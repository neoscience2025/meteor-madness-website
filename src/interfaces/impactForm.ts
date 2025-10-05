import { MeteoriteName } from './meteorites';

export interface ImpactFormData {
    latitude: number;
    longitude: number;
    diameter: number;
    speed: number;
    impactAngle: number;
    meteoriteType: MeteoriteName;
}

export type CalculationData = Omit<ImpactFormData, "latitude" | "longitude">;