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
  [ImpactState.IDLE]: 'Launch Asteroid',
  [ImpactState.LAUNCHING]: 'Launching...',
  [ImpactState.ANIMATING]: 'Launching...',
  [ImpactState.SHOWING_IMPACT]: 'Launching...',
  [ImpactState.READY_FOR_NEW]: 'New Launch'
} as const;