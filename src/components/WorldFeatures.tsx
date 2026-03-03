"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { FeatureConfig, TerrainParams, WaterParams } from "@/lib/types";
import { createSeededNoise, getTerrainHeight } from "@/lib/noise";
import { TERRAIN_SIZE } from "./ProceduralTerrain";

interface PlacedFeature {
  type: FeatureConfig["type"];
  position: [number, number, number];
  scale: number;
  rotation: number;
  colorOverride?: string;
  emissive: boolean;
}

function poissonDiskSample(
  density: number,
  terrainParams: TerrainParams,
  water: WaterParams | null,
  seed: number
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const noise2D = createSeededNoise(terrainParams.seed);
  const halfSize = TERRAIN_SIZE / 2 - 5;
  const spacing = Math.max(2, 8 / Math.sqrt(density * 10));

  let rng = seed;
  const rand = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng & 0x7fffffff) / 0x7fffffff;
  };

  for (let x = -halfSize; x < halfSize; x += spacing) {
    for (let z = -halfSize; z < halfSize; z += spacing) {
      if (rand() > density * 3) continue;

      const jitterX = x + (rand() - 0.5) * spacing * 0.8;
      const jitterZ = z + (rand() - 0.5) * spacing * 0.8;
      const h = getTerrainHeight(noise2D, jitterX, jitterZ, terrainParams);

      if (water && h < water.level + 0.3) continue;

      points.push([jitterX, h, jitterZ]);
    }
  }

  return points;
}

function PineTree({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.8, 2.5, 8]} />
        <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.6, 2.0, 8]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshStandardMaterial color="#4a2a0a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function OakTree({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 3.0, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.85} />
      </mesh>
      <mesh position={[0.5, 2.8, 0.3]} castShadow>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshStandardMaterial color="#3a6b2a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.0, 6]} />
        <meshStandardMaterial color="#5c3a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PalmTree({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.8, 3.8, Math.sin(angle) * 0.8]} rotation={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]} castShadow>
          <boxGeometry args={[0.15, 1.8, 0.6]} />
          <meshStandardMaterial color="#2d6a1e" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 4.0, 6]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  );
}

function DeadTree({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.2, 3.0, 5]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>
      <mesh position={[0.3, 2.5, 0]} rotation={[0, 0, 0.8]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.2, 4]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.2, 2.0, 0.1]} rotation={[0.3, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.8, 4]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale, rotation, color }: { position: [number, number, number]; scale: number; rotation: number; color?: string }) {
  const s = scale;
  return (
    <mesh position={position} rotation={[rotation * 0.3, rotation, rotation * 0.2]} scale={[s * 1.2, s * 0.7, s]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.5, 1]} />
      <meshStandardMaterial color={color || "#5a5a5a"} roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

function Boulder({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh scale={[s * 1.3, s * 0.8, s]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[s * 0.6, -s * 0.2, s * 0.3]} scale={[s * 0.5, s * 0.4, s * 0.5]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.92} />
      </mesh>
    </group>
  );
}

function Crystal({ position, scale, rotation, emissive, color }: { position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }) {
  const s = scale;
  const c = color || "#00e5ff";
  return (
    <mesh position={position} rotation={[0.1, rotation, 0.15]} scale={[s * 0.4, s, s * 0.4]} castShadow>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color={c}
        emissive={emissive ? c : "#000000"}
        emissiveIntensity={emissive ? 0.8 : 0}
        roughness={0.1}
        metalness={0.3}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function CrystalCluster({ position, scale, rotation, color }: { position: [number, number, number]; scale: number; rotation: number; color?: string }) {
  const s = scale;
  const c = color || "#00e5ff";
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      {[
        { p: [0, 0.5, 0] as [number, number, number], r: 0, s: 1 },
        { p: [0.3, 0.3, 0.2] as [number, number, number], r: 0.3, s: 0.7 },
        { p: [-0.2, 0.25, -0.15] as [number, number, number], r: -0.2, s: 0.6 },
        { p: [0.1, 0.2, -0.3] as [number, number, number], r: 0.5, s: 0.5 },
      ].map((crystal, i) => (
        <mesh key={i} position={crystal.p} rotation={[0.1, crystal.r, 0.15]} scale={[0.3 * crystal.s, crystal.s, 0.3 * crystal.s]} castShadow>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.1} metalness={0.3} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Building({ position, scale, rotation, emissive, color }: { position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }) {
  const s = scale;
  const c = color || "#3a3a4a";
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, s * 1.5, 0]} scale={[s * 0.8, s * 3, s * 0.8]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={c} roughness={0.7} metalness={0.2} />
      </mesh>
      {emissive && (
        <>
          {[0.5, 1.5, 2.5].map((y, i) => (
            <mesh key={i} position={[s * 0.41, y * s, 0]} scale={[0.02, s * 0.3, s * 0.2]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Tower({ position, scale, rotation, emissive, color }: { position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }) {
  const s = scale;
  const c = color || "#2a2a3a";
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, s * 2, 0]} scale={[s * 0.5, s * 4, s * 0.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.3} />
      </mesh>
      {emissive && (
        <mesh position={[0, s * 4.2, 0]}>
          <sphereGeometry args={[s * 0.2, 8, 8]} />
          <meshStandardMaterial color={color || "#ff00ff"} emissive={color || "#ff00ff"} emissiveIntensity={3} />
        </mesh>
      )}
    </group>
  );
}

function Ruin({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 0.6, 0]} rotation={[0.1, 0, 0.05]} castShadow>
        <boxGeometry args={[1.5, 1.2, 0.3]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.8, 0.4, 0.5]} rotation={[0, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.8]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
      </mesh>
      <mesh position={[0.6, 0.3, -0.4]} rotation={[0.15, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 6]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Mushroom({ position, scale, rotation, emissive, color }: { position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }) {
  const s = scale;
  const c = color || "#8b5cf6";
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c} emissive={emissive ? c : "#000000"} emissiveIntensity={emissive ? 0.6 : 0} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
        <meshStandardMaterial color="#e8d8c8" roughness={0.8} />
      </mesh>
    </group>
  );
}

function GiantMushroom({ position, scale, rotation, color }: { position: [number, number, number]; scale: number; rotation: number; color?: string }) {
  const s = scale;
  const c = color || "#a855f7";
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.4, 8]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Coral({ position, scale, rotation, color }: { position: [number, number, number]; scale: number; rotation: number; color?: string }) {
  const s = scale;
  const c = color || "#ff6b6b";
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      {[
        [0, 0.4, 0],
        [0.2, 0.3, 0.15],
        [-0.15, 0.35, -0.1],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.08, 0.5 + i * 0.15, 5]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Cactus({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 2.0, 8]} />
        <meshStandardMaterial color="#2d6a1e" roughness={0.8} />
      </mesh>
      <mesh position={[0.25, 1.2, 0]} rotation={[0, 0, -0.8]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#2d6a1e" roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, 0.8, 0]} rotation={[0, 0, 0.9]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.6, 6]} />
        <meshStandardMaterial color="#2d6a1e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Flower({ position, scale, rotation, color }: { position: [number, number, number]; scale: number; rotation: number; color?: string }) {
  const s = scale;
  const colors = ["#ff69b4", "#ff6347", "#ffd700", "#da70d6", "#87ceeb"];
  const c = color || colors[Math.floor(rotation * 100) % colors.length];
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[s, s, s]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 4]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
    </group>
  );
}

function FloatingIsland({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  const floatY = position[1] + 8 + Math.sin(rotation * 10) * 3;
  return (
    <group position={[position[0], floatY, position[2]]} rotation={[0, rotation, 0]} scale={[s, s * 0.4, s]}>
      <mesh castShadow>
        <dodecahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#4a6a3a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.2, 0]} scale={[0.3, 2, 0.3]}>
        <coneGeometry args={[0.5, 1.5, 6]} />
        <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pillar({ position, scale, rotation, emissive, color }: { position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }) {
  const s = scale;
  const c = color || "#5a5a6a";
  return (
    <mesh position={[position[0], position[1] + s, position[2]]} rotation={[0.05, rotation, 0.03]} scale={[s * 0.3, s * 2, s * 0.3]} castShadow>
      <cylinderGeometry args={[0.3, 0.5, 1, 6]} />
      <meshStandardMaterial
        color={c}
        emissive={emissive ? c : "#000000"}
        emissiveIntensity={emissive ? 0.5 : 0}
        roughness={0.7}
        metalness={0.15}
      />
    </mesh>
  );
}

function IceSpike({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <mesh position={[position[0], position[1] + s * 0.8, position[2]]} rotation={[0.05, rotation, 0.1]} scale={[s * 0.3, s, s * 0.3]} castShadow>
      <coneGeometry args={[0.5, 2, 6]} />
      <meshStandardMaterial color="#b0e0e6" roughness={0.15} metalness={0.1} transparent opacity={0.8} />
    </mesh>
  );
}

function LavaRock({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: number }) {
  const s = scale;
  return (
    <mesh position={position} rotation={[rotation * 0.3, rotation, 0]} scale={[s, s * 0.8, s]} castShadow>
      <dodecahedronGeometry args={[0.6, 1]} />
      <meshStandardMaterial color="#1a0a0a" roughness={0.95} metalness={0.05} emissive="#ff2200" emissiveIntensity={0.2} />
    </mesh>
  );
}

const FEATURE_COMPONENTS: Record<string, React.FC<{ position: [number, number, number]; scale: number; rotation: number; emissive: boolean; color?: string }>> = {
  tree_pine: PineTree as never,
  tree_oak: OakTree as never,
  tree_palm: PalmTree as never,
  tree_dead: DeadTree as never,
  rock: Rock as never,
  boulder: Boulder as never,
  crystal: Crystal,
  crystal_cluster: CrystalCluster as never,
  building: Building,
  ruin: Ruin as never,
  mushroom: Mushroom,
  mushroom_giant: GiantMushroom as never,
  coral: Coral as never,
  cactus: Cactus as never,
  flower: Flower as never,
  floating_island: FloatingIsland as never,
  tower: Tower,
  pillar: Pillar,
  ice_spike: IceSpike as never,
  lava_rock: LavaRock as never,
};

interface Props {
  features: FeatureConfig[];
  terrainParams: TerrainParams;
  water: WaterParams | null;
}

export default function WorldFeatures({ features, terrainParams, water }: Props) {
  const placed = useMemo(() => {
    const all: PlacedFeature[] = [];
    let seedOffset = 0;

    for (const feat of features) {
      seedOffset += 1000;
      const positions = poissonDiskSample(feat.density, terrainParams, water, terrainParams.seed + seedOffset);

      for (const pos of positions) {
        const rng = Math.abs(Math.sin(pos[0] * 12.9898 + pos[2] * 78.233) * 43758.5453) % 1;
        const scale = feat.minScale + rng * (feat.maxScale - feat.minScale);

        all.push({
          type: feat.type,
          position: pos,
          scale,
          rotation: rng * Math.PI * 2,
          colorOverride: feat.colorOverride,
          emissive: feat.emissive ?? false,
        });
      }
    }

    return all;
  }, [features, terrainParams, water]);

  return (
    <group>
      {placed.map((feat, i) => {
        const Component = FEATURE_COMPONENTS[feat.type];
        if (!Component) return null;
        return (
          <Component
            key={`${feat.type}-${i}`}
            position={feat.position}
            scale={feat.scale}
            rotation={feat.rotation}
            emissive={feat.emissive}
            color={feat.colorOverride}
          />
        );
      })}
    </group>
  );
}
