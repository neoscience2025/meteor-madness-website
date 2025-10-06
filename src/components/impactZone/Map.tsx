"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MainMenusGradientCard } from "../eldoraui/animatedcard";
import { ImpactForm } from "./ImpactForm";
import dynamic from "next/dynamic";
import { reverseGeocode } from "../../lib/apis/nominatim";
import { extractPlaceName } from "../../lib/map/utils";
import { useTranslation } from "react-i18next";
import { ImpactState, ImpactData, BUTTON_TEXT_MAP } from "../../interfaces/map";
import ImpactSummary from "./ImpactSummary";
import { useRouter, useSearchParams, usePathname } from "next/navigation";


// ──────────────────────────────────────────────────────────────
// Tiles
const maps = Object.freeze({
  satellite: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg",
  street: "https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png",
});

// ──────────────────────────────────────────────────────────────
// Lazy react-leaflet bits
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.MapContainer })),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.TileLayer })),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Marker })),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Circle })),
  { ssr: false }
);
const ImageOverlay = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.ImageOverlay })),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);
const Pane = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Pane })),
  { ssr: false }
);

// ──────────────────────────────────────────────────────────────
// Map click handler
const MapClickHandler = ({ setPosition, onPositionChange, disabled = false }) => {
  const [MapEvents, setMapEvents] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapEvents(() => mod.useMapEvents);
    });
  }, []);

  const MapEventsComponent = () => {
    if (!MapEvents) return null;

    MapEvents({
      click(e) {
        if (disabled) return;

        if (
          e.originalEvent &&
          e.originalEvent.target &&
          (e.originalEvent.target.closest("button") ||
            e.originalEvent.target.closest(".leaflet-control-zoom") ||
            e.originalEvent.target.closest('[class*="z-[1000]"]'))
        ) {
          return;
        }

        const coords = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        onPositionChange?.(coords);
      },
    });
    return null;
  };

  return <MapEventsComponent />;
};

// ──────────────────────────────────────────────────────────────
// Impact flash animation (sin cambios funcionales)
const ImpactAnimation = ({ position, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mapEvents, setMapEvents] = useState<any>(null);
  const [screenPosition, setScreenPosition] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapEvents(() => mod.useMapEvents);
    });
  }, []);

  const MapEventsComponent = () => {
    const map = mapEvents ? mapEvents({}) : null;
    useEffect(() => {
      if (map) mapRef.current = map;
    }, [map]);
    return null;
  };

  useEffect(() => {
    if (mapRef.current && position && position.length === 2) {
      try {
        const point = mapRef.current.latLngToContainerPoint(position);
        setScreenPosition({ x: point.x, y: point.y });
      } catch {
        setScreenPosition({ x: 200, y: 200 });
      }
    }
  }, [position?.[0], position?.[1]]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && position && !screenPosition) {
        try {
          const point = mapRef.current.latLngToContainerPoint(position);
          setScreenPosition({ x: point.x, y: point.y });
        } catch {
          setScreenPosition({ x: 200, y: 200 });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [mapRef.current, screenPosition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return <MapEventsComponent />;
  if (!screenPosition) return <MapEventsComponent />;

  return (
    <>
      <MapEventsComponent />
      <div
        className="absolute inset-0 z-[1999] pointer-events-none"
        style={{
          animation: "mapIllumination 0.6s ease-out forwards",
          background: `radial-gradient(circle at ${screenPosition.x}px ${screenPosition.y}px, rgba(255,255,255,0.95) 0%, rgba(255,255,0,0.8) 15%, rgba(255,165,0,0.6) 35%, rgba(255,200,100,0.3) 60%, rgba(255,220,150,0.1) 80%, transparent 100%)`,
        }}
      />
      <div
        className="absolute z-[2000] pointer-events-none"
        style={{
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            animation: "impactFlash 0.4s ease-out forwards",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: "60px",
              height: "60px",
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,0,0.95) 30%, rgba(255,165,0,0.9) 60%, rgba(255,200,100,0.7) 80%, transparent 100%)",
              filter: "blur(3px)",
              boxShadow:
                "0 0 120px 60px rgba(255,255,255,1), 0 0 240px 120px rgba(255,255,0,0.9), 0 0 360px 180px rgba(255,165,0,0.7)",
            }}
          />
        </div>
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            animation: "shockwaveExpand 2.1s ease-out 0.4s forwards",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: "20px",
              height: "20px",
              background:
                "radial-gradient(circle, transparent 80%, rgba(255,255,255,0.9) 85%, rgba(255,255,0,0.7) 90%, rgba(255,165,0,0.5) 95%, transparent 100%)",
              filter: "blur(1px)",
              boxShadow:
                "0 0 50px rgba(255,255,0,0.7), inset 0 0 25px rgba(255,165,0,0.4)",
            }}
          />
        </div>
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            animation: "glowPulse 2.5s ease-out forwards",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: "80px",
              height: "80px",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,0,0.3) 40%, rgba(255,165,0,0.2) 70%, transparent 100%)",
              filter: "blur(8px)",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes mapIllumination {
            0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: 0; }
          }
          @keyframes impactFlash {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            20% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
            40% { transform: translate(-50%, -50%) scale(3); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
          }
          @keyframes shockwaveExpand {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
            20% { opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(40); opacity: 0; }
          }
          @keyframes glowPulse {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(3); opacity: 0.4; }
            100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────────────────────
// Draggable marker
const DraggableMarker = ({
  position,
  setPosition,
  customIcon = "/marker.svg",
  onPositionChange,
  isVisible = true,
}) => {
  const [L, setL] = useState<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
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
        popupAnchor: [0, -52],
      });

      marker.setIcon(customMarkerIcon);
    }
  }, [L, customIcon]);

  useEffect(() => {
    if (isVisible && markerRef.current && L) {
      const marker = markerRef.current;
      const customMarkerIcon = new L.Icon({
        iconUrl: customIcon,
        iconSize: [30, 52],
        popupAnchor: [0, -52],
      });
      marker.setIcon(customMarkerIcon);
    }
  }, [isVisible, L, customIcon]);

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      const newPosition = marker.getLatLng();
      const coords = [newPosition.lat, newPosition.lng];
      setPosition(coords);
      onPositionChange?.(coords);
    },
  };

  if (!isVisible) return null;

  return (
    <Marker ref={markerRef} eventHandlers={L ? eventHandlers : {}} position={position} />
  );
};

// ──────────────────────────────────────────────────────────────
// AffectedArea circle + overlay (textura opcional)
const AffectedAreaCircle = ({ affectedArea, backgroundImage = "/crater.png" }) => {
  if (!affectedArea) return null;

  const { center, radiusDegrees } = affectedArea;
  const position: [number, number] = [center.latitude, center.longitude];

  const boundsPadding = radiusDegrees * 1.2;
  const bounds: [[number, number], [number, number]] = [
    [center.latitude - boundsPadding, center.longitude - boundsPadding],
    [center.latitude + boundsPadding, center.longitude + boundsPadding],
  ];

  const circleOptions = {
    color: "transparent",
    fillColor: "transparent",
    fillOpacity: 0,
    weight: 0,
  };

  return (
    <>
      {backgroundImage && <ImageOverlay url={backgroundImage} bounds={bounds} opacity={0.9} />}
      <Circle center={position} radius={affectedArea.radiusMeters} pathOptions={circleOptions} />
    </>
  );
};

// ──────────────────────────────────────────────────────────────
// Hover panel (tabla flotante)
function HoverPanel({
  hovered,
}: {
  hovered:
    | null
    | {
        key: string;
        label: string;
        radius: number;
        desc: string;
        casualties?: { label: string; value: number }[];
      };
}) {
  if (!hovered) return null;
  return (
    <div
      className="absolute top-4 left-4 z-[1200] rounded-xl shadow-lg"
      style={{ background: "rgba(17, 24, 39, 0.9)", color: "white", padding: "10px 12px", minWidth: 240 }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{hovered.label}</div>
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>
        Radius: {hovered.radius >= 1000 ? (hovered.radius / 1000).toFixed(1) + " km" : Math.round(hovered.radius) + " m"}
      </div>
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>{hovered.desc}</div>
      {hovered.casualties && hovered.casualties.length > 0 && (
        <table style={{ width: "100%", fontSize: 12 }}>
          <tbody>
            {hovered.casualties.map((c, idx) => (
              <tr key={idx}>
                <td style={{ padding: "2px 6px 2px 0", opacity: 0.85 }}>{c.label}</td>
                <td style={{ padding: "2px 0", textAlign: "right", fontWeight: 600 }}>
                  {c.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Efectos físicos como anillos (ordenados: grande → pequeño)
const EffectRings = ({ center, result }: { center: [number, number]; result: any }) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<null | {
    key: string;
    label: string;
    radius: number;
    desc: string;
    casualties?: { label: string; value: number }[];
  }>(null);
  const [selected, setSelected] = useState<string | null>(null);

  if (!result) return null;

  const totals = result?.casualties?.totals || {};
  const ringsBreakdown = result?.casualties?.rings || null; // si existiera (por anillos)

  // Helper: mapea víctimas para cada anillo (usa rings si está, si no usa totals)
  const victimsFor = (key: string) => {
    if (ringsBreakdown && Array.isArray(ringsBreakdown)) {
      const found = ringsBreakdown.find((r: any) => r.key === key);
      if (found?.victims) return found.victims as { label: string; value: number }[];
    }
    // Fallback a totales por fenómeno
    switch (key) {
      case "crater":
        return totals.craterVaporized != null
          ? [{ label: t("impactSummary:casualtyLabels.vaporized"), value: totals.craterVaporized }]
          : [];
      case "ignition":
        return totals.fireballDeaths != null
          ? [{ label: t("impactSummary:casualtyLabels.fireballFatalities"), value: totals.fireballDeaths }]
          : [];
      case "burns2nd":
        const b2 = totals.burns2nd != null ? totals.burns2nd : undefined;
        const b3 = totals.burns3rd != null ? totals.burns3rd : undefined;
        return [
          ...(b2 != null ? [{ label: t("impactSummary:casualtyLabels.burns2nd"), value: b2 }] : []),
          ...(b3 != null ? [{ label: t("impactSummary:casualtyLabels.burns3rd"), value: b3 }] : []),
        ];
      case "blast50":
        return totals.shockwaveDeaths != null
          ? [{ label: t("impactSummary:casualtyLabels.shockwaveFatalities"), value: totals.shockwaveDeaths }]
          : [];
      case "blast20":
        return totals.windDeaths != null
          ? [{ label: t("impactSummary:casualtyLabels.windFatalities"), value: totals.windDeaths }]
          : [];
      case "blast5":
      default:
        return [];
    }
  };

  const rings: Array<{
    key: string;
    radius?: number;
    color: string;
    fillColor?: string;
    fillOpacity?: number;
    label: string;
    desc: string;
    dashArray?: string;
  }> = [
    // Ventanas / 5 kPa  (más grande)
    {
      key: "blast5",
      radius: result?.blastRadii_m?.windows_5kPa,
      color: "#10B981",          // green
      fillColor: "#86EFAC",
      fillOpacity: 0.05,
      label: t("impactSummary:rings.blast5.label"),
      desc: t("impactSummary:rings.blast5.desc"),
      dashArray: "4 10",
    },
    // Blast moderado (≈20 kPa)
    {
      key: "blast20",
      radius: result?.blastRadii_m?.moderate_20kPa,
      color: "#2563EB",          // blue
      fillColor: "#93C5FD",
      fillOpacity: 0.07,
      label: t("impactSummary:rings.blast20.label"),
      desc: t("impactSummary:rings.blast20.desc"),
      dashArray: "6 8",
    },
    // Blast severo (≈50 kPa)
    {
      key: "blast50",
      radius: result?.blastRadii_m?.severe_50kPa,
      color: "#8B5CF6",          // violet
      fillColor: "#C4B5FD",
      fillOpacity: 0.09,
      label: t("impactSummary:rings.blast50.label"),
      desc: t("impactSummary:rings.blast50.desc"),
      dashArray: "6 6",
    },
    // Quemaduras 2º (0.25 MJ/m²)
    {
      key: "burns2nd",
      radius: result?.thermalRadii_m?.burns2ndDeg_0_25MJm2,
      color: "#FB923C",          // orange
      fillColor: "#FED7AA",
      fillOpacity: 0.12,
      label: t("impactSummary:rings.burns2nd.label"),
      desc: t("impactSummary:rings.burns2nd.desc"),
    },
    // Fireball / Ignición (1 MJ/m²)
    {
      key: "ignition",
      radius: result?.thermalRadii_m?.ignition_1MJm2,
      color: "#DC2626",          // red
      fillColor: "#FCA5A5",
      fillOpacity: 0.18,
      label: t("impactSummary:rings.ignition.label"),
      desc: t("impactSummary:rings.ignition.desc"),
    },
    // Cráter (radio ~ Df/2)  (más pequeño)
    {
      key: "crater",
      radius:
        typeof result?.crater?.finalDiameter_m === "number"
          ? result.crater.finalDiameter_m / 2
          : undefined,
      color: "#FACC15",          // yellow
      fillColor: "#FEF08A",
      fillOpacity: 0.35,
      label: t("impactSummary:rings.crater.label"),
      desc: t("impactSummary:rings.crater.desc"),
    },
  ];

  // Filtrar y ordenar GRANDE → PEQUEÑO
  const valid = rings
    .filter((r) => typeof r.radius === "number" && (r.radius as number) > 0)
    .sort((a, b) => (b.radius as number) - (a.radius as number));

  const fmt = (m?: number) => {
    if (!m || !isFinite(m)) return "";
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  return (
    <>
      <Pane name="effect-rings" style={{ zIndex: 650 }} />
      <HoverPanel hovered={hovered} />
      {valid.map((r) => {
        const isHovered = hovered?.key === r.key;
        const isSelected = selected === r.key;
        const isActive = isHovered || isSelected;
        
        return (
          <Circle
            key={r.key}
            center={center}
            radius={r.radius!}
            pane="effect-rings"
            pathOptions={{
              color: r.color,
              weight: isActive ? 3.5 : 2.5,
              opacity: isActive ? 1 : 0.95,
              dashArray: r.dashArray,
              fillColor: r.fillColor ?? r.color,
              fillOpacity: isActive ? (r.fillOpacity ?? 0.08) * 1.8 : (r.fillOpacity ?? 0.08),
              interactive: true,
              bubblingMouseEvents: false,
            }}
            className="[&_path]:!outline-none [&_path]:focus:!outline-none [&_path]:focus-visible:!outline-none [&_path]:focus:ring-0 [&_path]:cursor-pointer"
            eventHandlers={{
              mouseover: () =>
                setHovered({
                  key: r.key,
                  label: r.label,
                  radius: r.radius!,
                  desc: r.desc,
                  casualties: victimsFor(r.key),
                }),
              mouseout: () => setHovered(null),
              click: () => setSelected(selected === r.key ? null : r.key),
            }}
          >
          {/* Tooltip liviano en el borde, NO permanente */}
          <Tooltip direction="top" sticky>
            <div style={{ fontWeight: 600, fontSize: 12 }}>
              {r.label} — <span style={{ fontWeight: 400 }}>{fmt(r.radius)}</span>
            </div>
          </Tooltip>
        </Circle>
        );
      })}
    </>
  );
};

// ──────────────────────────────────────────────────────────────
// Main Map component
export function Map({ 
  lat = -1.65899, 
  lon = -78.67901, 
  initialParams = {} 
}: { 
  lat?: number; 
  lon?: number; 
  initialParams?: { [key: string]: string | string[] | undefined }; 
}) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [markerPosition, setMarkerPosition] = useState<number[]>([lat, lon]);
  const [placeName, setPlaceName] = useState("");
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const [placeError, setPlaceError] = useState<any>(null);
  const [mapType, setMapType] = useState<"street" | "satellite">("street");

  const [impactState, setImpactState] = useState<ImpactState>(ImpactState.IDLE);
  const [impactData, setImpactData] = useState<ImpactData | any>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const formRef = useRef<any>(null);

  // Parse query parameters into form data
  const parseQueryParams = useCallback((params: URLSearchParams | { [key: string]: string | string[] | undefined }) => {
    const getParam = (key: string) => {
      if (params instanceof URLSearchParams) {
        return params.get(key);
      }
      const value = params[key];
      return Array.isArray(value) ? value[0] : value;
    };

    const lat = getParam('lat');
    const lng = getParam('lng');
    const diameter = getParam('diameter');
    const speed = getParam('speed');
    const angle = getParam('angle');
    const material = getParam('material');

    return {
      position: lat && lng ? [parseFloat(lat), parseFloat(lng)] : null,
      formData: {
        diameter: diameter ? parseFloat(diameter) : null,
        speed: speed ? parseFloat(speed) : null,
        impactAngle: angle ? parseFloat(angle) : null,
        meteoriteType: material || null,
      }
    };
  }, []);

  // Update URL with current form data
  const updateURLParams = useCallback((formData: any, position: number[]) => {
    const params = new URLSearchParams();
    params.set('lat', position[0].toString());
    params.set('lng', position[1].toString());
    params.set('diameter', formData.diameter.toString());
    params.set('speed', formData.speed.toString());
    params.set('angle', formData.impactAngle.toString());
    params.set('material', formData.meteoriteType);

    // Preserve the current pathname (which includes locale) and only update query parameters
    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [router, pathname]);

  const handlePositionChange = useCallback(async (newPosition: number[]) => {
    const [lat, lon] = newPosition;
    setIsLoadingPlace(true);
    setPlaceError(null);
    try {
      const response = await reverseGeocode(lat, lon, i18n.language);
      const place = extractPlaceName(response);
      if (place === "unknownLocation" || place === "Unknown Location") {
        setPlaceName(t("impactZone:unknownLocation"));
      } else {
        setPlaceName(place);
      }
    } catch {
      setPlaceError("Failed to load location");
      setPlaceName(t("impactZone:unknownLocation"));
    } finally {
      setIsLoadingPlace(false);
    }
  }, [i18n.language, t]);

  const currentLanguage = i18n.language || "en";
  
  // Initialize from URL parameters on mount
  useEffect(() => {
    const parsed = parseQueryParams(initialParams);
    if (parsed.position) {
      setMarkerPosition(parsed.position);
    }
    // Store initial form data to pass to ImpactForm
    setInitialFormData(parsed.formData);
  }, [initialParams, parseQueryParams]);

  // Auto-load impact if URL contains complete parameters
  useEffect(() => {
    const hasAllParams = initialParams.lat && initialParams.lng && 
                        initialParams.diameter && initialParams.speed && 
                        initialParams.angle && initialParams.material;
    
    if (hasAllParams && initialFormData && impactState === ImpactState.IDLE) {
      // Auto-trigger impact calculation with delay to ensure form is ready
      const timer = setTimeout(() => {
        if (formRef.current?.submitWithData) {
          formRef.current.submitWithData(initialFormData);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialParams, initialFormData, impactState]);
  
  useEffect(() => {
    handlePositionChange(markerPosition);
  }, [handlePositionChange, markerPosition, currentLanguage]);

  const handleImpactLaunch = (result: ImpactData | any, formData: any) => {
    // Update URL with current parameters
    updateURLParams(formData, markerPosition);
    
    setImpactData(result);
    setImpactState(ImpactState.LAUNCHING);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setImpactState(ImpactState.ANIMATING), 500);
  };

  const handleAnimationComplete = () => {
    setImpactState(ImpactState.SHOWING_IMPACT);
    setTimeout(() => setImpactState(ImpactState.READY_FOR_NEW), 1000);
  };

  const handleNewLaunch = () => {
    setImpactState(ImpactState.IDLE);
    setImpactData(null);
    formRef.current?.reset?.();
  };

  const getTitle = () => {
    if (isLoadingPlace) return t("impactZone:loading");
    if (placeError) return t("impactZone:locationError");
    if (placeName) return t("impactZone:mapTitle", { result: placeName });
    return t("impactZone:mapTitle", { result: "Map" });
  };

  const center: [number, number] = [markerPosition[0], markerPosition[1]];

  return (
  <>
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
          disabled={
            impactState === ImpactState.LAUNCHING ||
            impactState === ImpactState.ANIMATING ||
            impactState === ImpactState.SHOWING_IMPACT
          }
          inputsDisabled={impactState !== ImpactState.IDLE}
          initialFormData={initialFormData}
        />
      }
      title={getTitle()}
      clickable={false}
    >
      <div
        style={{
          height: "400px",
          width: "100%",
          overflow: "hidden",
          position: "relative",
          contain: "layout size style",
        }}
        className="rounded-[15px] [&_.leaflet-container]:rounded-[15px]"
      >
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          className="rounded-[15px] [&_.leaflet-control-zoom]:!bg-blue-950 [&_.leaflet-control-zoom]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!bg-blue-950 [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!text-white [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!bg-blue-950 [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!border-none [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!text-white [&_.leaflet-control-zoom_.leaflet-control-zoom-in]:!border-b-0 [&_.leaflet-control-zoom_.leaflet-control-zoom-out]:!border-t-0 [&_svg_path]:!outline-none [&_svg_path]:focus:!outline-none [&_.leaflet-interactive]:!outline-none [&_.leaflet-interactive]:focus:!outline-none"
          attributionControl={false}
        >
          <TileLayer url={`${maps[mapType]}?key=${process.env.NEXT_PUBLIC_MAP_TILER_KEY}`} />

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
            <ImpactAnimation position={center} onComplete={handleAnimationComplete} />
          )}

          {/* Textura del cráter */}
          {(impactState === ImpactState.SHOWING_IMPACT ||
            impactState === ImpactState.READY_FOR_NEW) &&
            !!impactData && <AffectedAreaCircle affectedArea={impactData.affectedArea} />}

          {/* Anillos + hover panel (persisten hasta New Launch) */}
          {(impactState === ImpactState.SHOWING_IMPACT ||
            impactState === ImpactState.READY_FOR_NEW) &&
            !!impactData && <EffectRings center={center} result={impactData} />}

          {/* Switch de mapa */}
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-blue-950 rounded-full p-1 shadow-lg">
              <div className="relative inline-flex items-center">
                <button
                  onClick={() => setMapType("street")}
                  className={`px-3 py-1 text-sm font-medium rounded-l-full transition-colors ${
                    mapType === "street"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-950 text-white hover:bg-blue-800"
                  }`}
                >
                  {t("impactZone:mapView.street")}
                </button>
                <button
                  onClick={() => setMapType("satellite")}
                  className={`px-3 py-1 text-sm font-medium rounded-r-full transition-colors ${
                    mapType === "satellite"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-950 text-white hover:bg-blue-800"
                  }`}
                >
                  {t("impactZone:mapView.satellite")}
                </button>
              </div>
            </div>
          </div>
        </MapContainer>
        
        {/* Global styles to remove focus outlines from Leaflet elements */}
        <style jsx global>{`
          .leaflet-interactive:focus {
            outline: none !important;
          }
          .leaflet-container svg path:focus {
            outline: none !important;
          }
          .leaflet-container svg path {
            outline: none !important;
          }
          .leaflet-interactive {
            outline: none !important;
          }
        `}</style>
      </div>
    </MainMenusGradientCard>

    {/* Resumen debajo del card: aparece cuando hay resultados */}
    {!!impactData && <ImpactSummary result={impactData} />}
  </>
);

}
