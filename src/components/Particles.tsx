"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ParticleType } from "@/lib/types";

interface ParticleSystemConfig {
  count: number;
  spread: number;
  height: number;
  baseY: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
  direction: [number, number, number];
  sway: number;
}

const PARTICLE_CONFIGS: Record<Exclude<ParticleType, "none">, ParticleSystemConfig> = {
  snow: {
    count: 2000,
    spread: 60,
    height: 40,
    baseY: 0,
    size: 0.15,
    color: "#ffffff",
    speed: 2.0,
    opacity: 0.8,
    direction: [0, -1, 0],
    sway: 0.5,
  },
  rain: {
    count: 3000,
    spread: 60,
    height: 40,
    baseY: 0,
    size: 0.08,
    color: "#a0c4e8",
    speed: 12.0,
    opacity: 0.4,
    direction: [0.1, -1, 0.05],
    sway: 0.05,
  },
  fireflies: {
    count: 300,
    spread: 40,
    height: 15,
    baseY: 2,
    size: 0.12,
    color: "#aaff44",
    speed: 0.3,
    opacity: 0.9,
    direction: [0, 0.2, 0],
    sway: 2.0,
  },
  ash: {
    count: 800,
    spread: 50,
    height: 30,
    baseY: 0,
    size: 0.1,
    color: "#888888",
    speed: 1.0,
    opacity: 0.5,
    direction: [0.1, -0.5, 0.05],
    sway: 0.8,
  },
  embers: {
    count: 600,
    spread: 40,
    height: 25,
    baseY: 0,
    size: 0.1,
    color: "#ff6600",
    speed: 1.5,
    opacity: 0.8,
    direction: [0, 1, 0],
    sway: 0.6,
  },
  dust: {
    count: 500,
    spread: 50,
    height: 20,
    baseY: 2,
    size: 0.08,
    color: "#d4a574",
    speed: 0.2,
    opacity: 0.3,
    direction: [0.3, 0.05, 0.1],
    sway: 1.5,
  },
  spores: {
    count: 400,
    spread: 35,
    height: 15,
    baseY: 1,
    size: 0.1,
    color: "#cc88ff",
    speed: 0.4,
    opacity: 0.6,
    direction: [0, 0.3, 0],
    sway: 1.8,
  },
};

interface Props {
  type: ParticleType;
}

export default function Particles({ type }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const config = type !== "none" ? PARTICLE_CONFIGS[type] : null;

  const { positions, phases } = useMemo(() => {
    if (!config) return { positions: new Float32Array(0), phases: new Float32Array(0) };

    const pos = new Float32Array(config.count * 3);
    const ph = new Float32Array(config.count);

    for (let i = 0; i < config.count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * config.spread;
      pos[i * 3 + 1] = config.baseY + Math.random() * config.height;
      pos[i * 3 + 2] = (Math.random() - 0.5) * config.spread;
      ph[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, phases: ph };
  }, [config]);

  useFrame((state) => {
    if (!pointsRef.current || !config) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const dt = config.speed * 0.016;

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      pos.array[i3] += config.direction[0] * dt + Math.sin(t * 0.5 + phase) * config.sway * 0.01;
      pos.array[i3 + 1] += config.direction[1] * dt + Math.cos(t * 0.3 + phase) * config.sway * 0.005;
      pos.array[i3 + 2] += config.direction[2] * dt + Math.sin(t * 0.4 + phase * 1.3) * config.sway * 0.01;

      const halfSpread = config.spread / 2;
      if (pos.array[i3] > halfSpread) pos.array[i3] = -halfSpread;
      if (pos.array[i3] < -halfSpread) pos.array[i3] = halfSpread;
      if (pos.array[i3 + 2] > halfSpread) pos.array[i3 + 2] = -halfSpread;
      if (pos.array[i3 + 2] < -halfSpread) pos.array[i3 + 2] = halfSpread;

      if (config.direction[1] < 0 && pos.array[i3 + 1] < config.baseY) {
        pos.array[i3 + 1] = config.baseY + config.height;
      }
      if (config.direction[1] > 0 && pos.array[i3 + 1] > config.baseY + config.height) {
        pos.array[i3 + 1] = config.baseY;
      }
    }

    pos.needsUpdate = true;
  });

  if (!config) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.size}
        color={config.color}
        transparent
        opacity={config.opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
