"use client";

import { useMemo } from "react";
import { Sky, Stars, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import type { AtmosphereParams, ColorPalette } from "@/lib/types";

interface Props {
  atmosphere: AtmosphereParams;
  palette: ColorPalette;
}

export default function Atmosphere({ atmosphere, palette }: Props) {
  const sunPos = useMemo(
    () => new THREE.Vector3(...atmosphere.sunPosition),
    [atmosphere.sunPosition]
  );

  const isNight = atmosphere.timeOfDay === "night";
  const isDusk = atmosphere.timeOfDay === "dusk";
  const isDawn = atmosphere.timeOfDay === "dawn";

  const showSky = !isNight || atmosphere.skyRayleigh > 0.5;

  return (
    <>
      {showSky && (
        <Sky
          distance={450000}
          sunPosition={sunPos}
          turbidity={atmosphere.skyTurbidity}
          rayleigh={atmosphere.skyRayleigh}
          mieCoefficient={isDusk || isDawn ? 0.01 : 0.005}
          mieDirectionalG={isDusk || isDawn ? 0.95 : 0.8}
          inclination={0.5}
          azimuth={0.25}
        />
      )}

      {isNight && (
        <color attach="background" args={[palette.sky]} />
      )}

      {atmosphere.starDensity > 0 && (
        <Stars
          radius={200}
          depth={80}
          count={atmosphere.starDensity}
          factor={5}
          saturation={0.3}
          fade
          speed={0.5}
        />
      )}

      {atmosphere.cloudCoverage > 0.05 && (
        <Clouds limit={200} material={THREE.MeshLambertMaterial}>
          {Array.from({ length: Math.ceil(atmosphere.cloudCoverage * 6) }).map((_, i) => (
            <Cloud
              key={i}
              position={[
                (i - 3) * 20 + Math.sin(i * 2.5) * 15,
                25 + Math.sin(i * 1.7) * 5,
                (i % 3 - 1) * 25 + Math.cos(i * 3.1) * 10,
              ]}
              speed={0.15}
              opacity={Math.min(0.6, atmosphere.cloudCoverage * 0.8)}
              bounds={[15 + i * 3, 3, 8]}
              volume={8}
              segments={20}
              color="#ffffff"
            />
          ))}
        </Clouds>
      )}

      <ambientLight
        color={palette.ambient}
        intensity={palette.ambientIntensity}
      />

      <directionalLight
        position={atmosphere.sunPosition}
        color={palette.sunColor}
        intensity={palette.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.001}
      />

      {(isDusk || isDawn) && (
        <hemisphereLight
          color={isDusk ? "#ff8c42" : "#ffa07a"}
          groundColor={palette.terrain[0]}
          intensity={0.4}
        />
      )}

      {isNight && (
        <>
          <pointLight position={[0, 30, 0]} color="#4a4a8a" intensity={0.3} />
          <hemisphereLight color="#1a1a3e" groundColor="#0a0a1e" intensity={0.15} />
        </>
      )}

      <fogExp2
        attach="fog"
        args={[atmosphere.fogColor, atmosphere.fogDensity]}
      />
    </>
  );
}
