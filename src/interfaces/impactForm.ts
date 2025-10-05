// impactForm.ts
// Tipos de entrada existentes + tipos de salida (CalculationData) para TypeScript.
// Esto NO cambia ninguna lógica de cálculo; solo declara tipos para evitar TS2305.

export type GeometryType = "sphere" | "prolate" | "irregular";

export type MaterialType =
  | "comet"
  | "carbon"
  | "stony"
  | "stony-iron"
  | "iron"
  | "gold";

export type ImpactMode = "auto" | "surface" | "air";

// ---------------------- Entradas del motor físico ----------------------------

export interface ImpactFormData {
  latitude: number;
  longitude: number;
  diameter: number;        // m
  speed: number;           // m/s
  impactAngle: number;     // radianes (desde la horizontal)
  geometry?: GeometryType;
  material?: MaterialType;
  density?: number;
  isWater?: boolean;
  waterDepth?: number;
  burstAltitude?: number;
  luminousEfficiency?: number;
  bodyStrength?: number;
  distancesOfInterest?: number[];
  mode?: ImpactMode;
}

// (Opcional, para la capa UI web)
export interface UIImpactParams {
  lat: number;               // Leaflet
  lng: number;               // Leaflet
  material: MaterialType;    // selector
  diameter: number;          // m
  speed: number;             // m/s
  angleDeg: number;          // grados desde la horizontal
}

// ---------------------- Tipos de salida (solo tipos, no lógica) --------------

export interface BlastRadii {
  /** ~5 kPa (ventanas/daño ligero) */
  windows: number;
  /** ~20 kPa (daño moderado) */
  moderate: number;
  /** ~50 kPa (daño severo) */
  severe: number;
}

export interface ThermalRadii {
  /** Radio para ~0.25 MJ/m² (quemaduras de 2º) */
  burns2ndDeg: number;
  /** Radio para ~1.0 MJ/m² (ignición/“fireball visible”) */
  ignition: number;
  /** (Opcional) Radio para ~0.5 MJ/m² (quemaduras de 3º) si lo calculas aparte */
  burns3rdDeg?: number;
}

export interface TsunamiInfo {
  cavityDepth?: number;
  deepHeightAt50km?: number;
}

export interface SampleRow {
  range: number;            // m
  overpressure: number;     // Pa
  windSpeed: number;        // m/s
  thermalFluence: number;   // J/m²
  ejectaThickness: number;  // m
  seismicMMI?: string | number;
}

export type CraterType = "simple" | "complex";

// Esta es la interface que `impact.ts` intenta importar:
export interface CalculationData {
  // Energía y cinemática
  energyJ: number;
  energyMT: number;
  velocitySurface: number;        // m/s (velocidad a nivel del suelo/impacto)

  // Cráter
  craterFormed: boolean;
  finalCraterDiameter: number;    // m
  craterType: CraterType;
  transientDepth: number;         // m (o profundidad característica)
  rimHeight: number;              // m

  // Radios de blast y térmico
  blastRadii: BlastRadii;
  thermalRadii: ThermalRadii;

  // Sismo y tsunami (si aplica)
  seismicMagnitude: number;
  tsunami?: TsunamiInfo | null;

  // Burst info
  burstMode: ImpactMode | "surface" | "air" | "auto";
  burstAltitude?: number | null;

  // (Opcional) tabla de muestras por distancia si el motor la genera
  samples?: SampleRow[];

  // (Opcional) eco de algunos inputs si el motor los adjunta
  inputs?: {
    angle?: number; // rad
    [k: string]: unknown;
  };

  // (Opcional) otras propiedades que el motor pueda añadir
  [k: string]: unknown;
}
