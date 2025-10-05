"use client";

import { useState, useEffect, useRef } from "react";
import { MainMenusGradientCard } from "../eldoraui/animatedcard";
import { ImpactForm } from "./ImpactForm";
import dynamic from 'next/dynamic';
import { reverseGeocode } from '../../lib/apis/nominatim';
import { extractPlaceName } from '../../lib/map/utils';
import { useTranslation } from "react-i18next";

// Impact sequence states
type ImpactState = 'idle' | 'launching' | 'animating' | 'showing-impact' | 'ready-for-new';

interface ImpactData {
  energyJ: number;
  energyMT: number;
  craterDiameter: number;
  pressureAt10km: number;
  affectedArea: {
    center: { latitude: number; longitude: number };
    radiusMeters: number;
    radiusDegrees: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
}


const maps = Object.freeze({
  satellite: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg",
  street: "https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png",
})

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => ({ default: mod.MapContainer })),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => ({ default: mod.TileLayer })),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => ({ default: mod.Marker })),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => ({ default: mod.Circle })),
  { ssr: false }
);
const ImageOverlay = dynamic(
  () => import('react-leaflet').then((mod) => ({ default: mod.ImageOverlay })),
  { ssr: false }
);

// Component to handle map clicks
const MapClickHandler = ({ setPosition, onPositionChange, disabled = false }) => {
  const [MapEvents, setMapEvents] = useState(null);

  useEffect(() => {
    import('react-leaflet').then((mod) => {
      setMapEvents(() => mod.useMapEvents);
    });
  }, []);

  const MapEventsComponent = () => {
    if (!MapEvents) return null;

    MapEvents({
      click(e) {
        // Prevent marker movement when disabled (during impact sequence)
        if (disabled) {
          return;
        }

        // Prevent marker movement when clicking on UI elements
        if (e.originalEvent && e.originalEvent.target &&
          (e.originalEvent.target.closest('button') ||
            e.originalEvent.target.closest('.leaflet-control-zoom') ||
            e.originalEvent.target.closest('[class*="z-[1000]"]'))) {
          return;
        }

        const coords = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        if (onPositionChange) {
          onPositionChange(coords);
        }
      },
    });
    return null;
  };

  return <MapEventsComponent />;
};

// Impact animation component
const ImpactAnimation = ({ position, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000); // 2 second animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute z-[2000] pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'impactBurst 2s ease-out forwards'
      }}
    >
      <div className="relative">
        {/* Outer explosion ring */}
        <div className="absolute w-20 h-20 bg-orange-500 rounded-full opacity-80 animate-ping" />
        {/* Inner explosion */}
        <div className="absolute w-12 h-12 bg-red-500 rounded-full top-4 left-4 animate-pulse" />
        {/* Core impact */}
        <div className="absolute w-6 h-6 bg-yellow-300 rounded-full top-7 left-7 animate-bounce" />
      </div>
      <style jsx>{`
        @keyframes impactBurst {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Component to handle marker dragging
const DraggableMarker = ({ position, setPosition, customIcon = "/marker.svg", onPositionChange, isVisible = true }) => {
  const [L, setL] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (markerRef.current && L) {
      const marker = markerRef.current;
      marker.options.draggable = true;
      marker.dragging?.enable();

      const customMarkerIcon = new L.Icon({
        iconUrl: customIcon,
        iconSize: [30, 52],
        popupAnchor: [0, -52]
      });

      marker.setIcon(customMarkerIcon);
    }
  }, [L, customIcon, markerRef.current]);

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      const newPosition = marker.getLatLng();
      const coords = [newPosition.lat, newPosition.lng];
      setPosition(coords);
      if (onPositionChange) {
        onPositionChange(coords);
      }
    },
  };

  if (!isVisible) return null;

  return (
    <Marker
      ref={markerRef}
      eventHandlers={L ? eventHandlers : {}}
      position={position}
    />
  );
};

// Component to display the affected area
const AffectedAreaCircle = ({ affectedArea, backgroundImage = "/crater.png" }) => {
  if (!affectedArea) return null;

  const { center, radiusDegrees } = affectedArea;
  const position: [number, number] = [center.latitude, center.longitude];

  // Calculate bounds for the image overlay - make it larger to ensure full circle coverage
  const boundsPadding = radiusDegrees * 1.2; // 20% padding to ensure full coverage
  const bounds: [[number, number], [number, number]] = [
    [center.latitude - boundsPadding, center.longitude - boundsPadding],
    [center.latitude + boundsPadding, center.longitude + boundsPadding]
  ];

  const circleOptions = {
    color: 'transparent',
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 0, // Remove border
  };

  return (
    <>
      {/* Image overlay for crater texture */}
      {backgroundImage && (
        <ImageOverlay
          url={backgroundImage}
          bounds={bounds}
          opacity={0.9}
        />
      )}
      {/* Invisible circle to define the affected area (no border) */}
      <Circle
        center={position}
        radius={affectedArea.radiusMeters}
        pathOptions={circleOptions}
      />
    </>
  );
};

export function Map({
  lat = -1.65899,
  lon = -78.67901,
}) {

  const { i18n } = useTranslation();
  const [markerPosition, setMarkerPosition] = useState<number[]>([lat, lon]);
  const [placeName, setPlaceName] = useState('');
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const [placeError, setPlaceError] = useState(null);
  const [mapType, setMapType] = useState('street');

  // Impact sequence state management
  const [impactState, setImpactState] = useState<ImpactState>('idle');
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const formRef = useRef(null);


  const handlePositionChange = async (newPosition) => {
    const [lat, lon] = newPosition;
    setIsLoadingPlace(true);
    setPlaceError(null);

    try {
      const response = await reverseGeocode(lat, lon, i18n.language);
      const place = extractPlaceName(response);
      setPlaceName(place);
    } catch (error) {
      setPlaceError('Failed to load location');
      setPlaceName('Unknown Location');
    } finally {
      setIsLoadingPlace(false);
    }
  };

  useEffect(() => {
    handlePositionChange(markerPosition);
  }, []);

  // Handle impact launch
  const handleImpactLaunch = (result: ImpactData) => {
    setImpactData(result);
    setImpactState('launching');

    // Start animation sequence
    setTimeout(() => {
      setImpactState('animating');
    }, 100);
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    setImpactState('showing-impact');

    // After showing impact, change to ready for new launch
    setTimeout(() => {
      setImpactState('ready-for-new');
    }, 1000);
  };

  // Handle new launch (reset)
  const handleNewLaunch = () => {
    setImpactState('idle');
    setImpactData(null);
    if (formRef.current?.reset) {
      formRef.current.reset();
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    switch (impactState) {
      case 'animating':
      case 'showing-impact':
      case 'launching':
        return 'Launching...';
      case 'ready-for-new':
        return 'New Launch';
      default:
        return 'Launch Asteroid';
    }
  };

  const getTitle = () => {
    if (isLoadingPlace) return "Impact Zone: Loading...";
    if (placeError) return "Impact Zone: Location Error";
    if (placeName) return `Impact Zone: ${placeName}`;
    return "Impact Zone Map";
  };

  return (
    <MainMenusGradientCard
      className="!h-auto"
      description={
        <ImpactForm
          ref={formRef}
          latitude={markerPosition[0]}
          longitude={markerPosition[1]}
          onImpactResult={handleImpactLaunch}
          onNewLaunch={handleNewLaunch}
          buttonText={getButtonText()}
          isReadyForNew={impactState === 'ready-for-new'}
          disabled={impactState === 'launching' || impactState === 'animating' || impactState === 'showing-impact'}
          inputsDisabled={impactState !== 'idle'}
        />
      }
      title={getTitle()}
      clickable={false}
    >
      <div
        style={{
          height: '400px',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          contain: 'layout size style'
        }}
        className="rounded-[15px] [&_.leaflet-container]:rounded-[15px]"
      >
        <MapContainer
          center={markerPosition as [number, number]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className="rounded-[15px] [&_.leaflet-control-zoom]:!bg-blue-950 [&_.leaflet-control-zoom]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!bg-blue-950 [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!text-white [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!bg-blue-950 [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!text-white [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!border-b-0 [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!border-t-0"
          attributionControl={false}
        >
          <TileLayer
            url={`${maps[mapType]}?key=${process.env.NEXT_PUBLIC_MAP_TILER_KEY}`}
          />
          <MapClickHandler
            setPosition={setMarkerPosition}
            onPositionChange={handlePositionChange}
            disabled={impactState !== 'idle'}
          />
          <DraggableMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onPositionChange={handlePositionChange}
            isVisible={impactState === 'idle'}
          />

          {/* Impact Animation */}
          {impactState === 'animating' && (
            <ImpactAnimation
              position={markerPosition}
              onComplete={handleAnimationComplete}
            />
          )}

          {/* Affected Area Circle */}
          {(impactState === 'showing-impact' || impactState === 'ready-for-new') && !!impactData && (
            <AffectedAreaCircle
              affectedArea={impactData.affectedArea}
            />
          )}
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-blue-950 rounded-full p-1 shadow-lg">
              <div className="relative inline-flex items-center">
                <button
                  onClick={() => setMapType('street')}
                  className={`px-3 py-1 text-sm font-medium rounded-l-full transition-colors ${mapType === 'street'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-950 text-white hover:bg-blue-800'
                    }`}
                >
                  Street
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-1 text-sm font-medium rounded-r-full transition-colors ${mapType === 'satellite'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-950 text-white hover:bg-blue-800'
                    }`}
                >
                  Satellite
                </button>
              </div>
            </div>
          </div>
        </MapContainer>
      </div>
    </MainMenusGradientCard>
  );
}