import { Fragment, Suspense, useRef } from "react";
import { OrbitControls, Sphere, Stars, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { Mesh, Group } from "three";
import * as THREE from "three";
import CountryMarker from "./CountryMarker";
import type { Country } from "../types";

type GlobeSceneProps = {
  countries: Country[];
  completedMissionIds: string[];
  hideMarkers?: boolean;
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
  onClearSelection: () => void;
};

const EARTH_DAY_TEXTURE = "/textures/world-explorer/earth-day.jpg";
const EARTH_NORMAL_TEXTURE = "/textures/world-explorer/earth-normal.jpg";
const EARTH_CLOUD_TEXTURE = "/textures/world-explorer/earth-clouds.png";
const EARTH_NIGHT_TEXTURE = "/textures/world-explorer/earth-night.jpg";

function Earth({
  countries,
  completedMissionIds,
  hideMarkers,
  selectedCountry,
  onSelectCountry,
}: Omit<GlobeSceneProps, "onClearSelection">) {
  const groupRef = useRef<Group>(null);
  const earthRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const [dayMap, normalMap, cloudMap, nightMap] = useTexture([
    EARTH_DAY_TEXTURE,
    EARTH_NORMAL_TEXTURE,
    EARTH_CLOUD_TEXTURE,
    EARTH_NIGHT_TEXTURE,
  ]);

  dayMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 64, 64]} raycast={() => null} ref={earthRef}>
        <meshStandardMaterial
          emissive="#1d4ed8"
          emissiveIntensity={0.08}
          map={dayMap}
          metalness={0.04}
          normalMap={normalMap}
          roughness={0.96}
          emissiveMap={nightMap}
          envMapIntensity={0.18}
          aoMapIntensity={0.8}
        />
      </Sphere>

      <mesh raycast={() => null} ref={cloudRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          alphaMap={cloudMap}
          depthWrite={false}
          map={cloudMap}
          opacity={0.14}
          transparent
        />
      </mesh>

      <mesh raycast={() => null} ref={atmosphereRef} scale={1.09}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4cc9ff"
          opacity={0.05}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {!hideMarkers &&
        countries.map((country) => (
          <Fragment key={country.id}>
            <CountryMarker
              key={`${country.id}-country`}
              country={country}
              earthRef={earthRef}
              isCompleted={completedMissionIds.includes(country.id)}
              isSelected={selectedCountry?.id === country.id}
              markerKind="country"
              onSelect={onSelectCountry}
            />
            {country.capitalPosition ? (
              <CountryMarker
                key={`${country.id}-capital`}
                country={country}
                earthRef={earthRef}
                isCompleted={completedMissionIds.includes(country.id)}
                isSelected={selectedCountry?.id === country.id}
                markerKind="capital"
                onSelect={onSelectCountry}
              />
            ) : null}
          </Fragment>
        ))}
    </group>
  );
}

export default function GlobeScene({
  countries,
  completedMissionIds,
  hideMarkers = false,
  selectedCountry,
  onSelectCountry,
  onClearSelection,
}: GlobeSceneProps) {
  return (
    <div
      className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <Canvas
        camera={{ fov: 38, position: [0, 0.2, 6.6] }}
        dpr={[1, 2]}
        eventPrefix="client"
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onClearSelection()}
      >
        <color args={["#020617"]} attach="background" />
        <fog args={["#020617", 7, 15]} attach="fog" />

        <ambientLight intensity={1.2} />
        <hemisphereLight color="#dbeafe" groundColor="#0f172a" intensity={1.1} />
        <directionalLight color="#ffffff" intensity={2.8} position={[5, 3, 5]} />
        <directionalLight color="#38bdf8" intensity={1.25} position={[-5, -2, -4]} />
        <pointLight color="#60a5fa" intensity={18} distance={22} position={[0, 0, 8]} />

        <Suspense fallback={null}>
          <Stars
            count={5000}
            depth={120}
            factor={4.2}
            fade
            radius={120}
            saturation={0}
            speed={0.8}
          />
          <Earth
            completedMissionIds={completedMissionIds}
            countries={countries}
            hideMarkers={hideMarkers}
            onSelectCountry={onSelectCountry}
            selectedCountry={selectedCountry}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          enableRotate
          enablePan={false}
          maxDistance={8.4}
          minDistance={4.4}
          rotateSpeed={0.95}
          screenSpacePanning={false}
          target={[0, 0, 0]}
          zoomSpeed={0.75}
        />
      </Canvas>
    </div>
  );
}
