export type BiomeType =
  | "forest"
  | "desert"
  | "arctic"
  | "ocean"
  | "volcanic"
  | "alien"
  | "crystal"
  | "cyberpunk"
  | "meadow"
  | "swamp"
  | "canyon"
  | "space"
  | "tropical"
  | "mountains";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";
export type Weather = "clear" | "foggy" | "stormy" | "snowy" | "rainy";
export type FeatureType =
  | "tree_pine"
  | "tree_oak"
  | "tree_palm"
  | "tree_dead"
  | "rock"
  | "boulder"
  | "crystal"
  | "crystal_cluster"
  | "building"
  | "ruin"
  | "mushroom"
  | "mushroom_giant"
  | "coral"
  | "cactus"
  | "flower"
  | "floating_island"
  | "tower"
  | "pillar"
  | "ice_spike"
  | "lava_rock";

export type ParticleType =
  | "snow"
  | "fireflies"
  | "ash"
  | "rain"
  | "dust"
  | "spores"
  | "embers"
  | "none";

export interface TerrainParams {
  seed: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  amplitude: number;
  frequency: number;
  plateauFactor: number;
  ridgeFactor: number;
  erosion: number;
}

export interface WaterParams {
  level: number;
  color: string;
  opacity: number;
  speed: number;
  distortion: number;
  isLava: boolean;
}

export interface FeatureConfig {
  type: FeatureType;
  density: number;
  minScale: number;
  maxScale: number;
  colorOverride?: string;
  emissive?: boolean;
}

export interface AtmosphereParams {
  timeOfDay: TimeOfDay;
  weather: Weather;
  sunPosition: [number, number, number];
  skyTurbidity: number;
  skyRayleigh: number;
  fogDensity: number;
  fogColor: string;
  cloudCoverage: number;
  starDensity: number;
}

export interface ColorPalette {
  terrain: [string, string, string, string, string];
  sky: string;
  ambient: string;
  sunColor: string;
  sunIntensity: number;
  ambientIntensity: number;
  accent: string;
}

export interface CameraParams {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface SemanticWorld {
  name: string;
  description: string;
  biome: BiomeType;
  terrain: TerrainParams;
  water: WaterParams | null;
  features: FeatureConfig[];
  atmosphere: AtmosphereParams;
  particles: ParticleType;
  palette: ColorPalette;
  camera: CameraParams;
}
