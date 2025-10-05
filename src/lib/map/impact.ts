import {
  CalculationData,
  GeometryType,
  MaterialType,
  ImpactMode,
} from "../../interfaces/impactForm";

/**
 * Impact Effects Model — versión compacta para web/CLI
 * (π-escalamiento, burst por presión dinámica, blast/thermal simplificado)
 */

const G_E = 9.81;
const MT_TNT_J = 4.184e15;
const PI = Math.PI;
const AIR_RHO0 = 1.225;
const H_SCALE = 8000;
const D_C_KM = 3.2;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const pow = Math.pow;

export type ImpactTarget = "land" | "water";

/** Densidad a granel del blanco (roca/agua) */
function targetBulkDensity(isWater: boolean): number {
  return isWater ? 1000 : 2700;
}

/** Cd aproximado por geometría */
function dragCoefficient(geom?: GeometryType): number {
  switch (geom) {
    case "sphere":  return 0.47;
    case "prolate": return 0.8;
    default:        return 1.0;
  }
}

/** Densidad típica por material del impactor */
export function materialDensity(material: MaterialType): number {
  switch (material) {
    case "comet":     return 750;
    case "carbon": return 2000;
    case "stony":        return 3000;
    case "stony-iron":   return 4500;
    case "iron":         return 7860;
    case "gold":         return 19320;
    default:
      // fallback defensivo si se amplía MaterialType y se olvida actualizar este switch
      return 3000;
  }
}

/** Masa de esfera de diámetro `diameter` y densidad `rho` */
function massSphere(diameter: number, rho: number): number {
  return (PI / 6) * rho * pow(diameter, 3);
}

/** Energía cinética */
function energyJ(mass: number, v: number): number {
  return 0.5 * mass * v * v;
}

/** v_surf ≈ v0 * exp{ − [3 ρ0 C_D H] / [4 ρ_i L sinθ] } */
function estimateSurfaceVelocity(
  v0: number, L0: number, rho_i: number, theta: number, C_D: number
): number {
  const atten = (3 * AIR_RHO0 * C_D * H_SCALE) / (4 * rho_i * L0 * Math.max(Math.sin(theta), 1e-3));
  return v0 * Math.exp(-atten);
}

/** h_burst = H ln[ ρ0 v^2 / (2S) ] si ½ρv² ≥ S; sino 0 (para modo "air" explícito) */
function burstAltitudeByStrength(v: number, strengthPa: number): number {
  const rhs = (AIR_RHO0 * v * v) / (2 * Math.max(strengthPa, 1));
  if (rhs <= 1) return 0;
  return H_SCALE * Math.log(rhs);
}

/** D_tc = C (ρ_i/ρ_t)^(1/3) L^0.78 v_i^0.44 g^(−0.22) (sinθ)^(1/3) */
function D_transient(
  L: number, v_i: number, rho_i: number, rho_t: number, theta: number, isWater: boolean
): number {
  const C = isWater ? 1.365 : 1.161;
  return (
    C *
    pow(rho_i / rho_t, 1 / 3) *
    pow(L, 0.78) *
    pow(v_i, 0.44) *
    pow(G_E, -0.22) *
    pow(Math.sin(theta), 1 / 3)
  );
}

/** Diámetro final a partir del transitorio; tipo simple/complex por umbral */
function craterFinalFromTransient(Dtc_m: number): { Df_m: number; type: "simple" | "complex" } {
  const Dtc_km = Dtc_m / 1000;
  if (Dtc_km <= 2.56) return { Df_m: 1.25 * Dtc_m, type: "simple" };
  const Df_km = 1.17 * pow(Dtc_km, 1.13) / pow(D_C_KM, 0.13);
  return { Df_m: Df_km * 1000, type: "complex" };
}

/** Profundidad transitoria (aprox.) */
function transientDepth(Dtc_m: number): number { return Dtc_m / (2 * Math.SQRT2); }

/** Altura de borde (aprox.) */
function rimHeight(Dtc_m: number, Df_m: number): number { return 0.07 * pow(Dtc_m, 4) / pow(Df_m, 3); }

/** Fluencia térmica en r: F(r) = (K E) / (4π r^2) */
function thermalFluenceAt(E_J: number, luminousEff: number, r_m: number, horizonLimit = true): number {
  if (horizonLimit && r_m > 1.5e6) return 0;
  const Erad = Math.max(0, luminousEff) * E_J;
  return Erad / (4 * PI * Math.max(r_m, 1) ** 2);
}
function radiusForFluence(E_J: number, K: number, F_thresh: number): number {
  if (K <= 0 || F_thresh <= 0) return 0;
  return Math.sqrt((K * E_J) / (4 * PI * F_thresh));
}

/** Ajuste simple de sobrepresión escalado por kt^(1/3) */
type OverpressureFit = { p0: number; r0: number; nNear: number };
const OVERPRESSURE_1KT_SURFACE: OverpressureFit = { p0: 75_000, r0: 290, nNear: 2.3 };

function overpressurePa_scaled(E_J: number, r_m: number): number {
  const kt = E_J / 4.184e12;
  const scale = Math.cbrt(Math.max(kt, 1e-6));
  const r1 = r_m / scale;

  const { p0, r0, nNear } = OVERPRESSURE_1KT_SURFACE;
  const near = p0 * pow(r0 / Math.max(r1, 1), nNear);
  const far  = p0 * (r0 / Math.max(r1, 1));
  const w = 1 / (1 + pow(r1 / r0, 4));
  return w * near + (1 - w) * far;
}
function radiusForOverpressure(E_J: number, P_thresh: number): number {
  const kt = E_J / 4.184e12;
  const scale = Math.cbrt(Math.max(kt, 1e-6));
  const r1 = (OVERPRESSURE_1KT_SURFACE.p0 * OVERPRESSURE_1KT_SURFACE.r0) / Math.max(P_thresh, 1);
  return r1 * scale;
}
function peakWindFromOverpressure(dP: number): number {
  return Math.sqrt(Math.max(2 * dP / AIR_RHO0, 0));
}

/** Espesor de eyecta (r^-3) fuera del borde */
function ejectaThicknessAt(r_m: number, Rrim_m: number, tRim_m: number): number {
  if (r_m <= Rrim_m) return tRim_m;
  return tRim_m * pow(Rrim_m / r_m, 3);
}

/** Magnitud sísmica a partir de fracción de E */
function seismicMagnitude(E_J: number, fractionToSeismic = 0.01): number {
  const Es = Math.max(E_J * clamp(fractionToSeismic, 0, 1), 1);
  return 0.67 * Math.log10(Es) - 5.87;
}
function mercalliFromM(M: number, r_km: number): string {
  const atten = M - Math.log10(Math.max(r_km, 1));
  if (atten >= 7) return "IX–X (daño severo)";
  if (atten >= 6) return "VII–VIII (daño)";
  if (atten >= 5) return "V–VI (moderado)";
  if (atten >= 4) return "III–IV (ligero)";
  return "I–II (débil)";
}

/** cavidad transitoria limitada por profundidad local: D_C ≲ 0.25 D_tc y ≤ depth */
function initialCavityDepthWater(Dtc_m: number, depth_m: number): number {
  const d = 0.25 * Dtc_m;
  return Math.min(d, Math.max(depth_m, 1));
}
function deepWaterWaveHeightAt(h0: number, Rc: number, r: number): number {
  if (r <= Rc) return h0;
  return h0 * (Rc / r);
}

/** Umbral mínimo de diámetro (m) para que haya cráter por material (modo "auto") */
const DIAMETER_CRATER_THRESHOLD_BY_MATERIAL: Record<MaterialType, number> = {
  // Valores razonables para condicionar “impacta vs se desintegra” sin usar v/strength:
  // - Cometary/carbonaceous: requieren tamaños muy grandes para cráter.
  // - Rochosos/stony-iron: umbral medio-bajo.
  // - Hierro/Oro: umbral bajo (muy probable que impacten si son “grandes”).
  comet:     1200, // hielo/poroso → se desintegra salvo tamaños enormes
  carbon: 800,
  stony:        200,
  "stony-iron": 120,
  iron:         80,
  gold:         80,   // <-- añadido para cubrir MaterialType = "gold"
};

function shouldCraterByMaterialAndDiameter(
  material: MaterialType | undefined,
  diameter_m: number
): boolean {
  if (!material) {
    // Si no viene material, usa un criterio conservador intermedio
    return diameter_m >= 200;
  }
  const thr = DIAMETER_CRATER_THRESHOLD_BY_MATERIAL[material];
  return diameter_m >= thr;
}

export interface EffectsAtRange {
  range: number;
  overpressure: number;     // Pa
  windSpeed: number;        // m/s
  thermalFluence: number;   // J/m^2
  ejectaThickness: number;  // m
  seismicMMI: string;
}

export interface ImpactOutputs {
  energyJ: number;
  energyMT: number;
  velocitySurface: number;

  craterFormed: boolean;
  transientCraterDiameter: number;
  finalCraterDiameter: number;
  craterType: "simple" | "complex" | "none";
  transientDepth: number;
  rimHeight: number;

  thermalRadii: { burns2ndDeg: number; ignition: number };
  blastRadii: { windows: number; moderate: number; severe: number };
  seismicMagnitude: number;

  tsunami?: { cavityDepth: number; deepHeightAt50km: number };
  samples?: EffectsAtRange[];

  /** Info de burst/modo */
  burstMode: ImpactMode;
  burstAltitude: number | null; // m; 0 si impacto en superficie; null si no aplica
}

export interface ImpactInputs {
  diameter: number;         // m
  density: number;          // kg/m^3
  velocity: number;         // m/s
  angle: number;            // rad
  geometry?: GeometryType;
  isWater: boolean;
  waterDepth?: number;      // m
  luminousEfficiency?: number;
  burstAltitude?: number;   // m (si mode="air" o override)
  bodyStrength?: number;    // Pa (se ignora en auto con la nueva lógica)
  distancesOfInterest?: number[]; // m
  mode?: ImpactMode;        // "auto" | "surface" | "air"
  material?: MaterialType;  // para decisión auto por material+diámetro
}

export function calculateImpact(input: ImpactInputs): ImpactOutputs {
  const {
    diameter, density, velocity, angle,
    geometry = "irregular",
    isWater, waterDepth = 4000,
    luminousEfficiency = 0.003,
    burstAltitude = undefined,
    bodyStrength = 1e7,
    distancesOfInterest,
    mode = "auto",
  } = input;

  const rho_t = targetBulkDensity(isWater);
  const Cd = dragCoefficient(geometry);

  // --- Decidir modo/burst ---
  let burstMode: ImpactMode = mode;
  let burstAltUsed: number | null = null;

  if (mode === "surface") {
    burstAltUsed = 0; // impacto en superficie
  } else if (mode === "air") {
    // Forzado a explosión aérea
    burstAltUsed = burstAltitude ?? burstAltitudeByStrength(velocity, bodyStrength);
    if (burstAltUsed <= 0) burstAltUsed = 15000; // fallback razonable si cálculo devolviese <=0
  } else {
    // "auto": SOLO material + diámetro (como se pidió)
    const crater = shouldCraterByMaterialAndDiameter(input.material, diameter);
    if (crater) {
      burstAltUsed = 0;
      burstMode = "surface";
    } else {
      // Explosión aérea "razonable": fija una altitud nominal si no se forzó
      burstAltUsed = 20000; // 20 km como altura típica de airburst
      burstMode = "air";
    }
  }

  // Velocidad a nivel del suelo solo relevante si terminamos en surface
  const v_surface = burstMode === "surface"
    ? estimateSurfaceVelocity(velocity, diameter, density, angle, Cd)
    : velocity;

  const m0 = massSphere(diameter, density);
  const E = energyJ(m0, velocity);
  const energyMT = E / MT_TNT_J;

  // ¿Se forma cráter?
  const craterFormed = burstMode === "surface";

  // --- Cráter (si aplica) ---
  let Dtc = 0, Df = 0, cType: "simple" | "complex" | "none" = "none", d_tc = 0, h_rim = 0;
  if (craterFormed) {
    Dtc = D_transient(diameter, v_surface, density, rho_t, angle, isWater);
    const fin = craterFinalFromTransient(Dtc);
    Df = fin.Df_m; cType = fin.type;
    d_tc = transientDepth(Dtc);
    h_rim = rimHeight(Dtc, Df);
  }

  // --- Térmico ---
  const F_burns = 1e5, F_fire = 5e5;
  const R_burns = radiusForFluence(E, luminousEfficiency, F_burns);
  const R_fire  = radiusForFluence(E, luminousEfficiency, F_fire);

  // --- Blast ---
  const R_windows  = radiusForOverpressure(E, 2_000);
  const R_moderate = radiusForOverpressure(E, 10_000);
  const R_severe   = radiusForOverpressure(E, 30_000);

  // --- Sismo ---
  const M_seis = seismicMagnitude(E, 0.01);

  // --- Tsunami ---
  let tsunami: ImpactOutputs["tsunami"] | undefined;
  if (isWater && craterFormed) {
    const Rc = (Dtc / 2) || (Df / 2);
    const cav = initialCavityDepthWater(Dtc, waterDepth);
    const Hdeep50 = deepWaterWaveHeightAt(0.5 * cav, Rc, 50_000);
    tsunami = { cavityDepth: cav, deepHeightAt50km: Hdeep50 };
  }

  // --- Muestreo por distancias ---
  let samples: EffectsAtRange[] | undefined;
  if (distancesOfInterest?.length) {
    samples = distancesOfInterest.map((r) => {
      const dP = overpressurePa_scaled(E, r);
      const u  = peakWindFromOverpressure(dP);
      const F  = thermalFluenceAt(E, luminousEfficiency, r, true);
      const t_ej = craterFormed && Dtc > 0 ? ejectaThicknessAt(r, Dtc / 2, Math.max(h_rim, 0)) : 0;
      const mmi = mercalliFromM(M_seis, r / 1000);
      return { range: r, overpressure: dP, windSpeed: u, thermalFluence: F, ejectaThickness: t_ej, seismicMMI: mmi };
    });
  }

  return {
    energyJ: E,
    energyMT,
    velocitySurface: v_surface,

    craterFormed,
    transientCraterDiameter: Dtc,
    finalCraterDiameter: Df,
    craterType: craterFormed ? cType : "none",
    transientDepth: d_tc,
    rimHeight: h_rim,

    thermalRadii: { burns2ndDeg: R_burns, ignition: R_fire },
    blastRadii: { windows: R_windows, moderate: R_moderate, severe: R_severe },
    seismicMagnitude: M_seis,

    tsunami,
    samples,

    burstMode,
    burstAltitude: burstAltUsed,
  };
}
