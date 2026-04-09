import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore, useXR } from "@react-three/xr";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { SolarSystemPlanet } from "./data";
import type { SolarOverviewPerspective, SolarSystemView } from "./hooks/useSolarSystemState";
import { OrbitRing } from "./OrbitRing";
import { Planet } from "./Planet";
import { SolarSystemCameraController } from "./SolarSystemCameraController";
import { StarField } from "./StarField";
import { Sun } from "./Sun";

interface SolarSystemSceneProps {
  overviewPerspective: SolarOverviewPerspective;
  store: ReturnType<typeof createXRStore>;
  planets: SolarSystemPlanet[];
  selectedPlanet: SolarSystemPlanet | null;
  selectedPlanetId: string | null;
  view: SolarSystemView;
  visitedPlanetIds: string[];
  onSelectPlanet: (planetId: string) => void;
  onSessionStateChange: (active: boolean) => void;
}

export function SolarSystemScene({
  overviewPerspective,
  store,
  planets,
  selectedPlanet,
  selectedPlanetId,
  view,
  visitedPlanetIds,
  onSelectPlanet,
  onSessionStateChange,
}: SolarSystemSceneProps) {
  const planetPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const visitedPlanets = useMemo(() => new Set(visitedPlanetIds), [visitedPlanetIds]);

  const handlePlanetPosition = useCallback((planetId: string, position: THREE.Vector3) => {
    const existing = planetPositionsRef.current[planetId];

    if (existing) {
      existing.copy(position);
      return;
    }

    planetPositionsRef.current[planetId] = position.clone();
  }, []);

  const getPlanetPosition = useCallback(
    (planetId: string) => {
      const existing = planetPositionsRef.current[planetId];

      if (existing) {
        return existing.clone();
      }

      const planet = planets.find((item) => item.id === planetId);

      if (!planet) {
        return null;
      }

      return new THREE.Vector3(
        Math.cos(planet.initialAngle) * planet.orbitRadius,
        0,
        Math.sin(planet.initialAngle) * planet.orbitRadius,
      );
    },
    [planets],
  );

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[30px]">
      <Canvas
        camera={{ far: 460, fov: 42, near: 0.1, position: [0, 30, 112] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.94 }}
        shadows
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color args={["#01030a"]} attach="background" />
        <fog args={["#01030a", 200, 380]} attach="fog" />
        <StarField />
        <SolarLights />

        <XR store={store}>
          <SessionBridge onSessionStateChange={onSessionStateChange} />
          <CinematicPostProcessing />
          <SolarSystemCameraController
            getPlanetPosition={getPlanetPosition}
            overviewPerspective={overviewPerspective}
            selectedPlanet={selectedPlanet}
            view={view}
          />

          <Sun />
          <AsteroidBelt />

          {planets.map((planet) => (
            <OrbitRing
              color={planet.visual.accentColor}
              faded={planet.isBonusObject}
              highlighted={selectedPlanetId === planet.id}
              key={`orbit-${planet.id}`}
              radius={planet.orbitRadius}
            />
          ))}

          {planets.map((planet) => (
            <Planet
              key={planet.id}
              onPositionChange={handlePlanetPosition}
              onSelect={onSelectPlanet}
              overviewMode={view === "overview"}
              planet={planet}
              selected={selectedPlanetId === planet.id}
              showLabel={view === "overview"}
              visited={visitedPlanets.has(planet.id)}
            />
          ))}
        </XR>
      </Canvas>
    </div>
  );
}

function SessionBridge({
  onSessionStateChange,
}: {
  onSessionStateChange: (active: boolean) => void;
}) {
  const session = useXR((state) => state.session);

  useEffect(() => {
    onSessionStateChange(Boolean(session));
  }, [onSessionStateChange, session]);

  useEffect(() => {
    return () => {
      onSessionStateChange(false);
    };
  }, [onSessionStateChange]);

  return null;
}

function SolarLights() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#6f94c7", "#02050d", 0.48]} />
      <directionalLight color="#b8ceff" intensity={0.22} position={[-120, 50, -150]} />
      <directionalLight color="#ffd7a0" intensity={0.16} position={[120, 24, 110]} />
    </>
  );
}

function CinematicPostProcessing() {
  const { camera, gl, scene, size } = useThree();
  const session = useXR((state) => state.session);
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (session) {
      composerRef.current?.dispose();
      composerRef.current = null;
      return;
    }

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.3, 0.45, 0.55);
    bloomPass.threshold = 0.52;
    bloomPass.strength = 0.24;
    bloomPass.radius = 0.42;

    const composer = new EffectComposer(gl);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [camera, gl, scene, session, size.height, size.width]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    if (session) {
      gl.render(scene, camera);
      return;
    }

    composerRef.current?.render(delta);
  }, 1);

  return null;
}

function AsteroidBelt() {
  const groupRef = useRef<THREE.Group>(null);
  const asteroids = useMemo(
    () =>
      Array.from({ length: 160 }, (_, index) => {
        const angle = (index / 160) * Math.PI * 2;
        const radius = THREE.MathUtils.lerp(32, 37, Math.random());
        const y = THREE.MathUtils.randFloatSpread(1.8);
        const scale = THREE.MathUtils.lerp(0.05, 0.18, Math.random());

        return {
          position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          scale,
        };
      }),
    [],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.rotation.y += delta * 0.018;
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((asteroid, index) => (
        <mesh castShadow key={index} position={asteroid.position} rotation={asteroid.rotation} scale={asteroid.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#827060"
            emissive="#271f1b"
            emissiveIntensity={0.04}
            roughness={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}
