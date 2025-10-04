"use server";

import { ImpactFormData } from "./impactForm";
import { calculateImpact, calculateAffectedArea } from "./impact";

export async function retrieveImpactData({
    latitude,
    longitude,
    diameter,
    impactAngle,
    speed
}: ImpactFormData) {
    const {
        energyJ,
        energyMT,
        craterDiameter,
        pressureAt10km
    } = calculateImpact({
        diameter,
        velocity: speed,
        angle: impactAngle,
        density: 19300
    });

    const affectedArea = calculateAffectedArea(latitude, longitude, craterDiameter);

    return {
        energyJ,
        energyMT,
        craterDiameter,
        pressureAt10km,
        affectedArea
    };
}