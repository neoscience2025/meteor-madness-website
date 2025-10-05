"use client";

import { useState, useEffect, useRef } from "react";
import { MainMenusGradientCard } from "../eldoraui/animatedcard";
import { ImpactForm } from "./ImpactForm";
import dynamic from 'next/dynamic';
import { reverseGeocode } from '../../lib/apis/nominatim';
import { extractPlaceName } from '../../lib/map/utils';
import { useTranslation } from "react-i18next";
import { ImpactState, ImpactData, BUTTON_TEXT_MAP } from '../../interfaces/map';


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
  const [mapEvents, setMapEvents] = useState(null);
  const [screenPosition, setScreenPosition] = useState(null);

  useEffect(() => {
    import('react-leaflet').then((mod) => {
      setMapEvents(() => mod.useMapEvents);
    });
  }, []);

  const MapEventsComponent = () => {
    if (!mapEvents) return null;

    const map = mapEvents({});
    
    useEffect(() => {
      if (map && position) {
        const point = map.latLngToContainerPoint(position);
        setScreenPosition({ x: point.x, y: point.y });
      }
    }, [map, position]);

    return null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2500); // 2.5 second animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible || !screenPosition) return <MapEventsComponent />;

  return (
    <>
      <MapEventsComponent />
      <div
        className="absolute z-[2000] pointer-events-none"
        style={{
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Bright flash of light */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'impactFlash 0.4s ease-out forwards'
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '40px',
              height: '40px',
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,0,0.9) 30%, rgba(255,200,0,0.6) 60%, transparent 100%)',
              filter: 'blur(2px)',
              boxShadow: '0 0 60px 30px rgba(255,255,255,0.8), 0 0 120px 60px rgba(255,255,0,0.6)'
            }}
          />
        </div>

        {/* Expanding shockwave */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'shockwaveExpand 2.1s ease-out 0.4s forwards'
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '20px',
              height: '20px',
              background: 'radial-gradient(circle, transparent 80%, rgba(255,255,255,0.8) 85%, rgba(255,255,0,0.6) 90%, rgba(255,200,0,0.4) 95%, transparent 100%)',
              filter: 'blur(1px)',
              boxShadow: '0 0 40px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,0,0.3)'
            }}
          />
        </div>

        {/* Secondary glow effect */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'glowPulse 2.5s ease-out forwards'
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,0,0.2) 50%, transparent 100%)',
              filter: 'blur(8px)'
            }}
          />
        </div>

        <style jsx>{`
          @keyframes impactFlash {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            30% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(4);
              opacity: 0;
            }
          }

          @keyframes shockwaveExpand {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.9;
            }
            20% {
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(40);
              opacity: 0;
            }
          }

          @keyframes glowPulse {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 0.8;
            }
            50% {
              transform: translate(-50%, -50%) scale(3);
              opacity: 0.4;
            }
            100% {
              transform: translate(-50%, -50%) scale(8);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </>
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
  const [impactState, setImpactState] = useState<ImpactState>(ImpactState.IDLE);
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
    setImpactState(ImpactState.LAUNCHING);

    // Start animation sequence
    setTimeout(() => {
      setImpactState(ImpactState.ANIMATING);
    }, 100);
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    setImpactState(ImpactState.SHOWING_IMPACT);

    // After showing impact, change to ready for new launch
    setTimeout(() => {
      setImpactState(ImpactState.READY_FOR_NEW);
    }, 1000);
  };

  // Handle new launch (reset)
  const handleNewLaunch = () => {
    setImpactState(ImpactState.IDLE);
    setImpactData(null);
    if (formRef.current?.reset) {
      formRef.current.reset();
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
          buttonText={BUTTON_TEXT_MAP[impactState]}
          isReadyForNew={impactState === ImpactState.READY_FOR_NEW}
          disabled={impactState === ImpactState.LAUNCHING || impactState === ImpactState.ANIMATING || impactState === ImpactState.SHOWING_IMPACT}
          inputsDisabled={impactState !== ImpactState.IDLE}
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
            disabled={impactState !== ImpactState.IDLE}
          />
          <DraggableMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onPositionChange={handlePositionChange}
            isVisible={impactState === ImpactState.IDLE}
          />

          {/* Impact Animation */}
          {impactState === ImpactState.ANIMATING && (
            <ImpactAnimation
              position={markerPosition}
              onComplete={handleAnimationComplete}
            />
          )}

          {/* Affected Area Circle */}
          {(impactState === ImpactState.SHOWING_IMPACT || impactState === ImpactState.READY_FOR_NEW) && !!impactData && (
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