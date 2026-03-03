"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { SemanticWorld } from "@/lib/types";
import ProceduralTerrain from "./ProceduralTerrain";
import WaterPlane from "./WaterPlane";
import WorldFeatures from "./WorldFeatures";
import Atmosphere from "./Atmosphere";
import Particles from "./Particles";

interface Props {
  world: SemanticWorld;
}

export default function WorldRenderer({ world }: Props) {
  return (
    <Canvas
      shadows
      camera={{
        position: world.camera.position,
        fov: world.camera.fov,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Atmosphere atmosphere={world.atmosphere} palette={world.palette} />

      <ProceduralTerrain params={world.terrain} palette={world.palette} />

      {world.water && <WaterPlane water={world.water} />}

      <WorldFeatures
        features={world.features}
        terrainParams={world.terrain}
        water={world.water}
      />

      <Particles type={world.particles} />

      <OrbitControls
        target={world.camera.target}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.15}
      />
    </Canvas>
  );
}
