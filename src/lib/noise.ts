import { createNoise2D } from "simplex-noise";
import alea from "./alea";
import type { TerrainParams } from "./types";

export function createSeededNoise(seed: number) {
  const prng = alea(seed.toString());
  return createNoise2D(prng);
}

export function fbm(
  noise2D: (x: number, y: number) => number,
  x: number,
  y: number,
  params: TerrainParams
): number {
  let value = 0;
  let amp = params.amplitude;
  let freq = params.frequency;

  for (let i = 0; i < params.octaves; i++) {
    let n = noise2D(x * freq, y * freq);

    if (params.ridgeFactor > 0) {
      const ridge = 1 - Math.abs(n);
      n = ridge * ridge * params.ridgeFactor + n * (1 - params.ridgeFactor);
    }

    value += n * amp;
    amp *= params.persistence;
    freq *= params.lacunarity;
  }

  if (params.plateauFactor > 0) {
    const plateauThreshold = params.amplitude * 0.3;
    if (value > plateauThreshold) {
      const excess = value - plateauThreshold;
      value = plateauThreshold + excess * (1 - params.plateauFactor);
    }
  }

  if (params.erosion > 0) {
    const erosionNoise = noise2D(x * params.frequency * 3, y * params.frequency * 3);
    value -= Math.abs(erosionNoise) * params.amplitude * params.erosion * 0.3;
  }

  return value;
}

export function getTerrainHeight(
  noise2D: (x: number, y: number) => number,
  worldX: number,
  worldZ: number,
  params: TerrainParams
): number {
  return fbm(noise2D, worldX, worldZ, params);
}
