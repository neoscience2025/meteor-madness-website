export interface MeteoriteType {
  name: string;
  density: number;
}

export interface MeteoriteOption {
  [key: string]: MeteoriteType;
}

export type MeteoriteName = 'gold' | 'iron' | 'carbon' | 'comet' | 'stone';