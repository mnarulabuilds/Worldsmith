"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { TerrainParams, ColorPalette } from "@/lib/types";
import { createSeededNoise, fbm } from "@/lib/noise";

const TERRAIN_SIZE = 120;
const SEGMENTS = 256;

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

interface Props {
  params: TerrainParams;
  palette: ColorPalette;
}

export default function ProceduralTerrain({ params, palette }: Props) {
  const { geometry, minH, maxH } = useMemo(() => {
    const noise2D = createSeededNoise(params.seed);
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = fbm(noise2D, x, z, params);
      pos.setY(i, h);
      if (h < min) min = h;
      if (h > max) max = h;
    }

    const colors = new Float32Array(pos.count * 3);
    const ramp = palette.terrain.map(hexToVec3);
    const range = max - min || 1;

    const maxIdx = ramp.length - 1;

    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i);
      const t = Math.max(0, Math.min(1, (h - min) / range));

      const idx = t * maxIdx;
      const lo = Math.min(Math.floor(idx), maxIdx);
      const hi = Math.min(lo + 1, maxIdx);
      const frac = idx - lo;

      const r = ramp[lo].x + (ramp[hi].x - ramp[lo].x) * frac;
      const g = ramp[lo].y + (ramp[hi].y - ramp[lo].y) * frac;
      const b = ramp[lo].z + (ramp[hi].z - ramp[lo].z) * frac;

      const slopeNoise = (Math.abs(Math.sin(i * 12.9898 + params.seed * 0.01) * 43758.5453) % 1 - 0.5) * 0.03;
      colors[i * 3] = Math.max(0, Math.min(1, r + slopeNoise));
      colors[i * 3 + 1] = Math.max(0, Math.min(1, g + slopeNoise));
      colors[i * 3 + 2] = Math.max(0, Math.min(1, b + slopeNoise));
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return { geometry: geo, minH: min, maxH: max };
  }, [params, palette]);

  void minH;
  void maxH;

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  );
}

export { TERRAIN_SIZE };
