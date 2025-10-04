export interface ImpactFormData {
    latitude: number;
    longitude: number;
    diameter: number;
    speed: number;
    impactAngle: number;
}

export type CalculationData = Omit<ImpactFormData, "latitude" | "longitude">;