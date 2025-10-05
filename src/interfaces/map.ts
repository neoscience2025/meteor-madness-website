export enum ImpactState {
  IDLE = 'idle',
  LAUNCHING = 'launching',
  ANIMATING = 'animating',
  SHOWING_IMPACT = 'showing-impact',
  READY_FOR_NEW = 'ready-for-new'
}

export interface ImpactData {
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

export const BUTTON_TEXT_MAP = {
  [ImpactState.IDLE]: 'form.launchAsteroid',
  [ImpactState.LAUNCHING]: 'form.launching',
  [ImpactState.ANIMATING]: 'form.launching',
  [ImpactState.SHOWING_IMPACT]: 'form.launching',
  [ImpactState.READY_FOR_NEW]: 'form.newLaunch'
} as const;