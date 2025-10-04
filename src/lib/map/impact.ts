import { CalculationData } from "@/interfaces/impactForm";

// Constants
const GRAVITY = 9.81;
const EARTH_DENSITY = 2700; // kg/m³
const ENERGY_CONVERSION = 4.184e15; // 1 Megaton TNT in Joules
const CRATER_COEFFICIENT = 1.161;
const DEFAULT_DISTANCE = 10000; // 10 km

// Calculate radius of asteroid
// Formula: radius = diameter / 2
function calculateRadius(diameter: number): number {
    return diameter / 2;
}

// Calculate volume of asteroid (sphere)
// Formula: volume = 4/3 * π * r^3
function calculateVolume(radius: number): number {
    return (4 / 3) * Math.PI * Math.pow(radius, 3);
}

// Calculate mass of asteroid
// Formula: mass = volume * density
function calculateMass(volume: number, density: number): number {
    return volume * density;
}

// Calculate impact energy in Joules
// Formula: E = 1/2 * m * v^2
function calculateEnergyJ(mass: number, velocity: number): number {
    return 0.5 * mass * Math.pow(velocity, 2);
}

// Convert energy to Megatons of TNT
// Formula: E_MT = E_J / 4.184e15
function convertEnergyToMegatons(energyJ: number): number {
    return energyJ / ENERGY_CONVERSION;
}

// Correct energy for impact angle
// Formula: E_effective = E * sin(theta)
function applyAngleCorrection(energyJ: number, angleDegrees: number) {
    const angleRadians = angleDegrees * Math.PI / 180;
    return energyJ * Math.sin(angleRadians);
}

// Calculate crater diameter (empirical formula from Collins et al.)
// Formula: D = k * (ρ_ast / ρ_earth)^0.333 * r^0.78 * v^0.44 * g^-0.22
// Uses effective energy through velocity adjustment
function calculateCraterDiameter(density: number, radius: number, velocity: number, angleDegrees: number) {
    // Apply angle correction as factor on velocity
    const angleFactor = Math.sin(angleDegrees * Math.PI / 180);
    const effectiveVelocity = velocity * Math.pow(angleFactor, 1 / 0.44); // reverse formula for velocity effect
    return CRATER_COEFFICIENT *
        Math.pow(density / EARTH_DENSITY, 0.333) *
        Math.pow(radius, 0.78) *
        Math.pow(effectiveVelocity, 0.44) *
        Math.pow(GRAVITY, -0.22);
}

// Calculate shockwave pressure at a given distance
// Formula: P = 0.28 * (E_effective / distance^3)^0.5
function calculateShockwavePressure(energyJ, angleDegrees, distance = DEFAULT_DISTANCE) {
    const effectiveEnergy = applyAngleCorrection(energyJ, angleDegrees);
    return 0.28 * Math.pow(effectiveEnergy / Math.pow(distance, 3), 0.5);
}

// Calculate affected area for mapping
export function calculateAffectedArea(latitude: number, longitude: number, craterDiameter: number) {
    // Calculate affected area radius (crater radius in meters)
    const affectedRadiusMeters = craterDiameter / 2;
    
    // Convert radius to degrees for Leaflet circle
    // Approximate conversion: 1 degree ≈ 111,320 meters at equator
    const radiusInDegrees = affectedRadiusMeters / 111320;
    
    // Calculate bounds for the affected area
    const bounds = {
        north: latitude + radiusInDegrees,
        south: latitude - radiusInDegrees,
        east: longitude + (radiusInDegrees / Math.cos(latitude * Math.PI / 180)),
        west: longitude - (radiusInDegrees / Math.cos(latitude * Math.PI / 180))
    };

    return {
        center: { latitude, longitude },
        radiusMeters: affectedRadiusMeters,
        radiusDegrees: radiusInDegrees,
        bounds
    };
}

// Main function to calculate impact consequences
export function calculateImpact({ diameter, density, velocity, angle }) {
    const radius = calculateRadius(diameter);
    const volume = calculateVolume(radius);
    const mass = calculateMass(volume, density);
    const energyJ = calculateEnergyJ(mass, velocity);
    const energyMT = convertEnergyToMegatons(energyJ);
    const craterDiameter = calculateCraterDiameter(density, radius, velocity, angle);
    const pressureAt10km = calculateShockwavePressure(energyJ, angle);

    return {
        energyJ,
        energyMT,
        craterDiameter,
        pressureAt10km
    };
}