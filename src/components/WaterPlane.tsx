"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WaterParams } from "@/lib/types";
import { TERRAIN_SIZE } from "./ProceduralTerrain";

interface Props {
  water: WaterParams;
}

export default function WaterPlane({ water }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 128, 128);
  }, []);

  const baseColor = useMemo(() => new THREE.Color(water.color), [water.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta * water.speed;

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const t = timeRef.current;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const wave1 = Math.sin(x * 0.05 + t * 1.2) * water.distortion * 0.5;
      const wave2 = Math.sin(z * 0.07 + t * 0.8) * water.distortion * 0.3;
      const wave3 = Math.sin((x + z) * 0.03 + t * 0.5) * water.distortion * 0.2;
      pos.setZ(i, wave1 + wave2 + wave3);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, water.level, 0]}
      receiveShadow
    >
      {water.isLava ? (
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={water.opacity}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshPhysicalMaterial
          color={baseColor}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={water.opacity}
          transmission={0.3}
          thickness={2}
          ior={1.33}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}
