// retrieveImpactData.ts
// Modo Web + CLI opcional (solo imprime JSON). No toca la lógica de cálculo.
// isWater SIEMPRE se resuelve desde la API.

import axios from "axios"; // seguimos usando axios para Lobster (SSR/Browser)
import {
  ImpactFormData,
  MaterialType,
  ImpactMode,
  UIImpactParams,
} from "../../interfaces/impactForm";

import {
  calculateImpact,
  materialDensity,
} from "./impact";
import {
  buildRadiiForPopulation,
  estimateCasualtiesByRings,
  type CasualtyEstimateResult,
} from "./vulnerability";

import { fetchIsWater } from "./isWater";
import { fetchPopulations } from "./population";

/* =========================================================
   Utilidades y defaults (NO toques matemática del modelo)
   ========================================================= */

function estimateDensityFromSpeed(velocity: number): number {
  const v = Math.abs(velocity);
  if (v >= 30_000) return 1000; // cometa/poroso
  if (v <= 20_000) return 3000; // rocoso medio
  return 2500;
}

function resolveDensity(
  density: number | undefined,
  material: MaterialType | undefined,
  speed: number
): number {
  if (typeof density === "number" && isFinite(density) && density > 0) return density;
  if (material) return materialDensity(material);
  return estimateDensityFromSpeed(speed);
}

function defaultRanges(energyJ: number): number[] {
  const base = Math.max(Math.cbrt(energyJ / 4.184e12), 1); // kt^(1/3)
  const km = (x: number) => Math.round(x * base) * 1000;
  return [km(2), km(5), km(10), km(20), 10_000];
}

const to2 = (x: number) => (Number.isFinite(x) ? Number((x as number).toFixed(2)) : x);
const to6 = (x: number) => (Number.isFinite(x) ? Number((x as number).toFixed(6)) : x);

/* =========================================================
   Helpers red
   ========================================================= */

// Normaliza tamaño de populations al de radiiForPop (padding/truncado conservador)
function normalizePopulationsSize(pops: number[], targetLen: number): number[] {
  if (!Array.isArray(pops) || targetLen <= 0) return new Array(targetLen).fill(0);
  if (pops.length === targetLen) return pops;
  if (pops.length > targetLen) return pops.slice(0, targetLen);
  const out = pops.slice();
  const last = out.length ? out[out.length - 1] : 0;
  while (out.length < targetLen) out.push(last);
  return out;
}

/* =========================================================
   Curiosidades energéticas / periodicidad (visuales)
   ========================================================= */

function energyCuriosity(energyMT: number, t?: (key: string) => string) {
  // Fallback to Spanish if no translation function provided (CLI context)
  if (energyMT >= 5e6) {
    return {
      headline: t ? t("impactSummary:energyComparisons.chicxulubHeadline") : "Mayor que el evento de Chicxulub (~100 millones de MT)",
      detail: t ? t("impactSummary:energyComparisons.chicxulubDetail") : "Energía comparable o superior a los grandes impactos de extinción masiva.",
    };
  }
  if (energyMT >= 1e6) {
    return {
      headline: t ? t("impactSummary:energyComparisons.nuclearTestsHeadline") : "Mayor que todas las pruebas nucleares combinadas",
      detail: t ? t("impactSummary:energyComparisons.nuclearTestsDetail") : "Escala global con potencial de efectos climáticos significativos.",
    };
  }
  if (energyMT >= 1e5) {
    return {
      headline: t ? t("impactSummary:energyComparisons.yellowstoneHeadline") : "Mayor que el supervolcán Yellowstone en una erupción récord",
      detail: t ? t("impactSummary:energyComparisons.yellowstoneDetail") : "Devastación continental; efectos globales notables.",
    };
  }
  if (energyMT >= 1e4) {
    return {
      headline: t ? t("impactSummary:energyComparisons.krakatoaHeadline") : "Mayor que la erupción del Krakatoa (1883)",
      detail: t ? t("impactSummary:energyComparisons.krakatoaDetail") : "Efectos regionales muy severos; cambios atmosféricos transitorios.",
    };
  }
  if (energyMT >= 5e2) {
    return {
      headline: t ? t("impactSummary:energyComparisons.tsarBombaHeadline") : "Mayor que la bomba de Tsar (~50 MT)",
      detail: t ? t("impactSummary:energyComparisons.tsarBombaDetail") : "Efectos devastadores a escala regional.",
    };
  }
  if (energyMT >= 15) {
    return {
      headline: t ? t("impactSummary:energyComparisons.hiroshimaHeadline") : "Mayor que la bomba de Hiroshima (~15 kt) por órdenes de magnitud",
      detail: t ? t("impactSummary:energyComparisons.hiroshimaDetail") : "Daño urbano extremo en decenas a cientos de km.",
    };
  }
  return {
    headline: t ? t("impactSummary:energyComparisons.subNuclearHeadline") : "Energía significativa pero sub-nuclear",
    detail: t ? t("impactSummary:energyComparisons.subNuclearDetail") : "Daños localizados; el peligro depende de densidad poblacional y ángulo.",
  };
}

function eventPeriodicityHint(diameter_m: number, material?: MaterialType, t?: (key: string) => string) {
  const d = diameter_m;
  if (d >= 1000) return t ? t("impactSummary:periodicityHints.veryLarge") : "Eventos del orden de decenas a cientos de miles de años.";
  if (d >= 300) return t ? t("impactSummary:periodicityHints.large") : "Eventos del orden de varios miles a decenas de miles de años.";
  if (d >= 100) return t ? t("impactSummary:periodicityHints.medium") : "Eventos del orden de siglos a milenios.";
  if (d >= 50) return t ? t("impactSummary:periodicityHints.small") : "Eventos del orden de décadas a siglos.";
  if (material === "iron" || material === "stony-iron") return t ? t("impactSummary:periodicityHints.ironRare") : "Eventos poco frecuentes (décadas).";
  return t ? t("impactSummary:periodicityHints.default") : "Eventos poco frecuentes (cientos de días a pocos años).";
}

/* =========================================================
   Motor principal (idéntico en salida; isWater siempre por API)
   ========================================================= */

export async function retrieveImpactData(form: ImpactFormData, t?: (key: string) => string) {
  const {
    latitude,
    longitude,
    diameter,
    speed,
    impactAngle,
    geometry,
    material,
    density: densityIn,
    waterDepth,
    burstAltitude,
    luminousEfficiency,
    bodyStrength,
    distancesOfInterest,
    mode,
  } = form as any;

  // 1) isWater SIEMPRE desde la API (ignoramos lo que venga en form)
  let isWater = false;
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const lw = await fetchIsWater(latitude, longitude);
    if (lw !== null) isWater = lw;
  }

  // 2) Resolver densidad (auto por material o estimador)
  const rho = resolveDensity(densityIn, material, speed);

  // 3) Distancias por defecto (si no vienen)
  const E_guess = 0.5 * (Math.PI / 6) * rho * Math.pow(diameter, 3) * speed * speed;
  const ranges = distancesOfInterest?.length ? distancesOfInterest : defaultRanges(E_guess);

  // 4) Física
  const out = calculateImpact({
    diameter,
    density: rho,
    velocity: speed,
    angle: impactAngle,
    geometry,
    isWater,
    waterDepth,
    burstAltitude,
    luminousEfficiency,
    bodyStrength,
    distancesOfInterest: ranges,
    mode: (mode as ImpactMode) || "auto",
    material,
  });

  // 5) Radios para población
  const radiiForPop = buildRadiiForPopulation(out);
  let casualties: CasualtyEstimateResult | null = null;

  // 6) Población y víctimas
  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    radiiForPop.length > 0
  ) {
    const populationsRaw = await fetchPopulations(latitude, longitude, radiiForPop);
    if (populationsRaw) {
      const pops = normalizePopulationsSize(populationsRaw, radiiForPop.length);
      try {
        casualties = estimateCasualtiesByRings(out, radiiForPop, pops);
      } catch {
        casualties = {
          totals: {
            craterVaporized: 0, fireballDeaths: 0, burns3rd: 0, burns2nd: 0,
            shockwaveDeaths: 0, windDeaths: 0, earthquakeDeaths: 0
          },
          radiiUsed: radiiForPop
        };
      }
    }
  }

  // 7) “Affected area”
  const affectedRadius = Math.max(out.blastRadii.severe, out.thermalRadii.ignition);
  const affectedArea = Math.PI * affectedRadius * affectedRadius;

  const velocityKmh = out.velocitySurface * 3.6;
  const curios = energyCuriosity(out.energyMT, t);
  const periodicity = eventPeriodicityHint(diameter, material, t);

  // 8) Salida JSON para UI
  const base = {
    inputs: {
      latitude: to6(latitude),
      longitude: to6(longitude),
      isWater,
      waterDepth: isWater ? (waterDepth ?? null) : null,
      density: to2(rho),
      material: material ?? null,
      mode: out.burstMode,
      burstAltitude_m: out.burstAltitude ?? null,
    },
    energy: {
      J: to2(out.energyJ),
      MT: to2(out.energyMT),
      velocitySurface_kmh: to2(velocityKmh),
    },
    crater: {
      formed: out.craterFormed,
      finalDiameter_m: to2(out.finalCraterDiameter),
      type: out.craterType,
      depth_m: to2(out.transientDepth),
      rimHeight_m: to2(out.rimHeight),
    },
    blastRadii_m: {
      windows_5kPa: to2(out.blastRadii.windows),
      moderate_20kPa: to2(out.blastRadii.moderate),
      severe_50kPa: to2(out.blastRadii.severe),
    },
    thermalRadii_m: {
      burns2ndDeg_0_25MJm2: to2(out.thermalRadii.burns2ndDeg),
      ignition_1MJm2: to2(out.thermalRadii.ignition),
    },
    seismic: {
      magnitude: to2(out.seismicMagnitude),
    },
    tsunami: out.tsunami
      ? {
          cavityDepth_m: to2(out.tsunami.cavityDepth),
          deepHeightAt50km_m: to2(out.tsunami.deepHeightAt50km),
        }
      : null,
    affected: {
      radius_m: to2(affectedRadius),
      area_m2: to2(affectedArea),
    },
    curiosities: {
      headline: curios.headline,
      detail: curios.detail,
      periodicity,
    },
  } as any;

  if (casualties) {
    base.casualties = {
      totals: casualties.totals,
      radiiUsed_m: casualties.radiiUsed.map(to2),
    };
  } else {
    base.casualties = null;
  }

  // Tabla de muestreo si existe (no la imprimimos; la UI decide)
  if (out.samples?.length) {
    base.samplesTable = out.samples.map((s: any) => ({
      range_m: to2(s.range),
      overpressure_Pa: to2(s.overpressure),
      wind_mps: to2(s.windSpeed),
      thermal_Jpm2: to2(s.thermalFluence),
      ejecta_m: to2(s.ejectaThickness),
      seismic_MMI: s.seismicMMI,
    }));
  }

  return base;
}

/* =========================================================
   Helper para la UI (5 parámetros) — recomendado en Web
   ========================================================= */

/**
 * Recibe exactamente los 5 controles del formulario web y
 * ejecuta todo el flujo, devolviendo el JSON listo para pintar.
 * - Ángulo llega en GRADOS (slider) y aquí lo pasamos a radianes.
 * - Mode: "auto"; Geometry: "irregular".
 * - isWater SIEMPRE vendrá de la API (no de UI).
 */
export async function runImpactFromUI(params: UIImpactParams, t?: (key: string) => string) {
  const { lat, lng, material, diameter, speed, angleDeg } = params;

  // saneo básico (sin romper UX)
  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
  const d = Math.max(0.01, Number(diameter));        // >0
  const v = clamp(Number(speed), 3_000, 72_000);     // 3–72 km/s
  const angDeg = clamp(Number(angleDeg), 5, 90);     // 5–90°
  const angleRad = (angDeg * Math.PI) / 180;

  const form: ImpactFormData = {
    latitude: Number(lat),
    longitude: Number(lng),
    diameter: d,
    speed: v,
    impactAngle: angleRad,
    geometry: "irregular",
    material,
    // el resto va por defaults internos
    mode: "auto",
    luminousEfficiency: 0.003,
    bodyStrength: 1e7,
  };

  return await retrieveImpactData(form, t);
}

/* =========================================================
   CLI opcional (solo imprime JSON del resultado)
   ========================================================= */
// Uso:
//   ts-node retrieveImpactData.ts --lat -1.670846 --lng -78.651653 --material gold --diameter 500 --speed 17000 --angleDeg 45
// o con node (compilado a JS):
//   node dist/retrieveImpactData.js --lat ... --lng ... --material ... --diameter ... --speed ... --angleDeg ...

declare const require: any | undefined;
declare const moduleRef: any | undefined;
declare const process: any | undefined;

if (typeof require !== "undefined" && typeof moduleRef !== "undefined" && require.main === moduleRef) {
  (async () => {
    try {
      const args = (typeof process !== "undefined" ? process.argv.slice(2) : []) as string[];

      const getArg = (name: string, def?: string) => {
        const i = args.findIndex((a) => a === `--${name}`);
        if (i >= 0 && i + 1 < args.length) return args[i + 1];
        return def;
      };

      const lat = Number(getArg("lat"));
      const lng = Number(getArg("lng"));
      const material = (getArg("material", "stony") as MaterialType) || "stony";
      const diameter = Number(getArg("diameter", "500"));
      const speed = Number(getArg("speed", "17000"));
      const angleDeg = Number(getArg("angleDeg", "45"));

      if (![lat, lng, diameter, speed, angleDeg].every((n) => Number.isFinite(n))) {
        throw new Error("Parámetros inválidos. Ejemplo: --lat -1.670846 --lng -78.651653 --material gold --diameter 500 --speed 17000 --angleDeg 45");
      }

      const result = await runImpactFromUI({ lat, lng, material, diameter, speed, angleDeg });

      // Imprimir SOLO JSON "bonito" para debug
      // (no afecta al modo web ni SSR)
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error("CLI error:", err?.message || err);
      if (typeof process !== "undefined") process.exitCode = 1;
    }
  })();
}
