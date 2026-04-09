import { Environment, Sky, Stars, Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { XR, XROrigin } from "@react-three/xr";
import type { Group } from "three";
import { Vector3 } from "three";
import AnimalZone from "./AnimalZone";
import InfoPanel from "./InfoPanel";
import StreetLightModel from "./StreetLightModel";
import TreeModel, { type TreeVariant } from "./TreeModel";
import WallModel from "./WallModel";
import { useProximityTrigger } from "../hooks/useProximityTrigger";
import { useXRMovement } from "../hooks/useXRMovement";
import type { DiscoveryMission, ZooAnimal, ZooSceneMode } from "../types";
import type { XRStore } from "@react-three/xr";

type ZooSceneProps = {
  animals: ZooAnimal[];
  discoveredIds: string[];
  missions: DiscoveryMission[];
  onDiscoverAnimal: (animalId: string) => void;
  sceneMode: ZooSceneMode;
  store: XRStore;
};

type SceneContentProps = Omit<ZooSceneProps, "store">;

const pathSegments: Array<[number, number, number, number, number, number]> = [
  [0, 0.01, 10, 3.2, 0.04, 12],
  [0, 0.01, 4, 3.2, 0.04, 10],
  [0, 0.01, -2, 3.2, 0.04, 10],
  [-6.6, 0.01, -7.8, 7.5, 0.04, 3],
  [6.6, 0.01, -7.8, 7.5, 0.04, 3],
  [-6.6, 0.01, 7.8, 7.5, 0.04, 3],
  [6.6, 0.01, 7.8, 7.5, 0.04, 3],
];

const lamps: Array<{
  position: [number, number, number];
  rotationY: number;
  scale: number;
}> = [
  { position: [-1.9, 0, 12.4], rotationY: Math.PI, scale: 0.95 },
  { position: [1.9, 0, 12.4], rotationY: Math.PI, scale: 0.95 },
  { position: [-1.9, 0, 2.4], rotationY: 0, scale: 0.95 },
  { position: [1.9, 0, 2.4], rotationY: 0, scale: 0.95 },
];

const shrubs: Array<[number, number, number]> = [
  [-14, 0, 14],
  [-12.5, 0, 11.2],
  [-14.4, 0, 7.8],
  [-13.2, 0, 2.2],
  [-14.1, 0, -3.6],
  [-12.8, 0, -10.4],
  [14, 0, 13.4],
  [12.7, 0, 8.8],
  [14.3, 0, 4.2],
  [13, 0, -1.8],
  [14.2, 0, -8.6],
  [12.6, 0, -13.2],
];

const decorativeTrees: Array<{
  position: [number, number, number];
  rotationY: number;
  scale: number;
  variant: TreeVariant;
}> = [
  { position: [-16, 0, 16], rotationY: Math.PI * 0.14, scale: 1.18, variant: "tree" },
  { position: [-15.5, 0, -15], rotationY: -Math.PI * 0.2, scale: 1.08, variant: "treeOne" },
  { position: [16, 0, 15.5], rotationY: Math.PI * 0.32, scale: 1.12, variant: "treeTwo" },
  { position: [15.2, 0, -15.2], rotationY: -Math.PI * 0.12, scale: 1.16, variant: "grove" },
  { position: [-5.4, 0, 15.5], rotationY: Math.PI * 0.26, scale: 0.94, variant: "palm" },
  { position: [5.6, 0, 15.3], rotationY: -Math.PI * 0.18, scale: 1, variant: "palm" },
];

const pathPlanters: Array<[number, number, number, number, string]> = [
  [-4.9, 0, 12.1, 1.1, "#6baa5d"],
  [4.9, 0, 12.1, 1.05, "#74ad62"],
  [-4.8, 0, 2.1, 1, "#5f9d52"],
  [4.8, 0, 2.1, 1.08, "#78b76a"],
  [-9.8, 0, -7.7, 1.15, "#6ea85f"],
  [9.8, 0, -7.7, 1.15, "#629f55"],
  [-9.8, 0, 7.7, 1.12, "#73af62"],
  [9.8, 0, 7.7, 1.12, "#6ba35c"],
];

const grassTufts: Array<[number, number, number, number]> = [
  [-13.8, 0, 12.5, 1],
  [-11.2, 0, 10.4, 0.9],
  [-14.1, 0, 5.6, 1.1],
  [-12.5, 0, -1.2, 0.95],
  [-13.7, 0, -5.2, 1.05],
  [-11.4, 0, -12.6, 0.88],
  [13.9, 0, 12.1, 0.92],
  [11.8, 0, 9.8, 1.04],
  [13.6, 0, 5.1, 1.06],
  [12.2, 0, 0.6, 0.9],
  [13.8, 0, -5.8, 1.08],
  [11.6, 0, -12.2, 0.9],
];

const signPosts: Array<[number, number, number, string]> = [
  [-6.5, 0, 9.3, "Safari Way"],
  [6.5, 0, 9.3, "Tropical Trail"],
  [-6.5, 0, -0.7, "Forest Loop"],
  [6.5, 0, -0.7, "River Habitat"],
];

const centerShowcaseHedges: Array<{
  position: [number, number, number];
  rotationY: number;
  scale: number;
}> = [
  { position: [-4.8, 0, -14.9], rotationY: Math.PI * 0.06, scale: 0.82 },
  { position: [-2.4, 0, -14.2], rotationY: -Math.PI * 0.04, scale: 0.78 },
  { position: [2.4, 0, -14.2], rotationY: Math.PI * 0.04, scale: 0.78 },
  { position: [4.8, 0, -14.9], rotationY: -Math.PI * 0.06, scale: 0.82 },
];

const centerShowcasePlanters: Array<[number, number, number, number, string]> = [
  [-2.1, 0, -13.3, 0.96, "#79b86a"],
  [2.1, 0, -13.3, 0.96, "#79b86a"],
  [-4.1, 0, -12.6, 0.82, "#6fac61"],
  [4.1, 0, -12.6, 0.82, "#6fac61"],
];

function getApproachOffsets(animal: ZooAnimal): Array<[number, number]> {
  const frontDistance =
    animal.id === "elephant" ? 1.75 : animal.id === "giraffe" ? 1.95 : 1.65;
  const diagonalDistance =
    animal.id === "elephant" ? 1.45 : animal.id === "giraffe" ? 1.6 : 1.35;
  const sideDistance = animal.id === "giraffe" ? 1.55 : 1.4;

  return [
    [0, frontDistance],
    [diagonalDistance, frontDistance - 0.25],
    [-diagonalDistance, frontDistance - 0.25],
    [sideDistance, 0.55],
    [-sideDistance, 0.55],
    [0, -1.25],
    [diagonalDistance, -0.95],
    [-diagonalDistance, -0.95],
  ];
}

function getApproachTarget(animal: ZooAnimal, playerPosition: Vector3): [number, number, number] {
  const approachOffsets = getApproachOffsets(animal);
  let bestOffset = approachOffsets[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const [offsetX, offsetZ] of approachOffsets) {
    const candidateX = animal.position[0] + offsetX;
    const candidateZ = animal.position[2] + offsetZ;
    const score = Math.hypot(playerPosition.x - candidateX, playerPosition.z - candidateZ);

    if (score < bestScore) {
      bestScore = score;
      bestOffset = [offsetX, offsetZ];
    }
  }

  return [animal.position[0] + bestOffset[0], 0, animal.position[2] + bestOffset[1]];
}

function HedgeRow({
  length,
  position,
  rotationY = 0,
}: {
  length: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  const segmentCount = Math.max(1, Math.round(length / 2.25));
  const spacing = length / segmentCount;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: segmentCount }, (_, index) => {
        const x = -length / 2 + spacing * (index + 0.5);

        return (
          <WallModel
            key={index}
            position={[x, 0, 0]}
            rotationY={0}
            scale={0.96}
            variant="hedge"
          />
        );
      })}
    </group>
  );
}

function Planter({
  color,
  position,
  scale = 1,
}: {
  color: string;
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.78, 0.88, 0.44, 18]} />
        <meshStandardMaterial color="#8b6946" roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.82, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.4, 0.78, 0.22]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-0.36, 0.84, -0.12]}>
        <sphereGeometry args={[0.44, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
    </group>
  );
}

function GrassTuft({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-0.18, -0.06, 0.08, 0.2].map((x, index) => (
        <mesh
          key={index}
          castShadow
          position={[x, 0.2 + index * 0.02, 0]}
          rotation={[0, 0, -0.1 + index * 0.06]}
        >
          <boxGeometry args={[0.06, 0.42 + index * 0.05, 0.02]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#5a9c46" : "#6dad54"} roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

function SignPost({
  label,
  position,
}: {
  label: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 1.64, 10]} />
        <meshStandardMaterial color="#69482c" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.5, 0.05]}>
        <boxGeometry args={[1.36, 0.42, 0.08]} />
        <meshStandardMaterial color="#f0ddb5" roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 1.5, 0.1]}>
        <boxGeometry args={[1.14, 0.12, 0.04]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.84} />
      </mesh>
      <Text
        color="#3c2a18"
        fontSize={0.16}
        maxWidth={1.1}
        position={[0, 1.5, 0.12]}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function SceneContent({
  animals,
  discoveredIds,
  onDiscoverAnimal,
  sceneMode,
}: SceneContentProps) {
  const originRef = useRef<Group>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [autoMoveTarget, setAutoMoveTarget] = useState<[number, number, number] | null>(null);
  const [autoMoveAnimalId, setAutoMoveAnimalId] = useState<string | null>(null);
  const { playerPosition } = useXRMovement({
    autoMoveTarget,
    onAutoMoveComplete: () => {
      setAutoMoveTarget(null);

      if (autoMoveAnimalId) {
        setSelectedAnimalId(autoMoveAnimalId);
      }

      setAutoMoveAnimalId(null);
    },
    originRef,
  });

  const { activeAnimalId } = useProximityTrigger({
    animals,
    playerPosition,
    threshold: 4.35,
    onEnterAnimal: (animal) => {
      setSelectedAnimalId(animal.id);
      onDiscoverAnimal(animal.id);
    },
  });

  const focusedAnimalId = selectedAnimalId ?? activeAnimalId;

  const isNight = sceneMode === "night";
  const focusedAnimal = useMemo(
    () => animals.find((animal) => animal.id === focusedAnimalId) ?? null,
    [animals, focusedAnimalId],
  );
  const panelStatusText =
    autoMoveAnimalId && focusedAnimalId === autoMoveAnimalId
      ? "Yaqinlashyapti..."
      : focusedAnimal
        ? "Ma'lumot oynasi ochildi"
        : null;

  return (
    <>
      <color attach="background" args={[isNight ? "#07111f" : "#b7d9f8"]} />
      <fog attach="fog" args={[isNight ? "#0f1b2d" : "#c3e2f5", 18, 45]} />
      <ambientLight intensity={isNight ? 0.72 : 1.55} />
      <hemisphereLight
        color={isNight ? "#8db7ff" : "#fffde9"}
        groundColor={isNight ? "#28402d" : "#5b7d4f"}
        intensity={isNight ? 0.52 : 1.15}
      />
      <directionalLight
        castShadow
        intensity={isNight ? 0.56 : 1.85}
        position={[14, 18, 8]}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <spotLight
        castShadow
        angle={0.45}
        color={isNight ? "#9fc0ff" : "#fff3cf"}
        intensity={isNight ? 3.1 : 7.8}
        penumbra={0.7}
        position={[0, 11, 14]}
        target-position={[0, 0, 10]}
      />

      <Sky
        azimuth={0.35}
        distance={4500}
        inclination={isNight ? 0.62 : 0.5}
        mieCoefficient={isNight ? 0.002 : 0.01}
        turbidity={isNight ? 2.2 : 5.5}
      />
      <Stars count={isNight ? 1400 : 900} depth={40} factor={2} fade saturation={0} speed={0.15} />

      <XROrigin ref={originRef} position={[0, 0, 15]} />

      <group>
        <mesh receiveShadow position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[48, 48]} />
          <meshStandardMaterial color={isNight ? "#476b40" : "#79ae62"} roughness={1} />
        </mesh>

        <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[18.8, 22.8, 72]} />
          <meshStandardMaterial color={isNight ? "#3e6237" : "#6ca45d"} roughness={1} />
        </mesh>

        <mesh receiveShadow position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[17.3, 18.7, 72]} />
          <meshStandardMaterial color={isNight ? "#2f4a2c" : "#557c46"} roughness={1} />
        </mesh>

        {pathSegments.map(([x, y, z, width, height, depth], index) => (
          <mesh key={index} receiveShadow position={[x, y, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={isNight ? "#bca683" : "#e2d0ad"} roughness={0.95} />
          </mesh>
        ))}

        {pathSegments.map(([x, , z, width, , depth], index) => (
          <mesh key={`path-edge-${index}`} receiveShadow position={[x, 0.016, z]}>
            <boxGeometry args={[width + 0.32, 0.012, depth + 0.32]} />
            <meshStandardMaterial color="#b89c72" roughness={0.98} />
          </mesh>
        ))}

        <mesh position={[0, 3.8, 18.3]}>
          <boxGeometry args={[6.6, 0.26, 0.26]} />
          <meshStandardMaterial color="#73502e" roughness={0.9} />
        </mesh>
        {[-2.8, 2.8].map((x) => (
          <mesh key={x} castShadow position={[x, 2.1, 18.3]}>
            <boxGeometry args={[0.28, 3.6, 0.28]} />
            <meshStandardMaterial color="#7a5431" roughness={0.92} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 0.92, 18.36]}>
          <boxGeometry args={[3.1, 1.7, 0.16]} />
          <meshStandardMaterial color="#8d6440" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-1.64, 0.92, 18.36]}>
          <boxGeometry args={[0.14, 1.7, 0.2]} />
          <meshStandardMaterial color="#5b402c" roughness={0.94} />
        </mesh>
        <mesh castShadow position={[1.64, 0.92, 18.36]}>
          <boxGeometry args={[0.14, 1.7, 0.2]} />
          <meshStandardMaterial color="#5b402c" roughness={0.94} />
        </mesh>
        <HedgeRow length={14} position={[-10.7, 0, 15.85]} />
        <HedgeRow length={14} position={[10.7, 0, 15.85]} />
        <HedgeRow length={39} position={[-19.3, 0, 0]} rotationY={Math.PI / 2} />
        <HedgeRow length={39} position={[19.3, 0, 0]} rotationY={Math.PI / 2} />
        <HedgeRow length={39} position={[0, 0, -19.25]} />

        <WallModel position={[-11.8, 0, 0.8]} rotationY={Math.PI * 0.18} scale={0.92} variant="fountain" />
        <WallModel position={[0, 0, -13.7]} rotationY={Math.PI} scale={0.84} variant="fountain" />

        <WallModel position={[-2.7, 0, 9.4]} rotationY={Math.PI} scale={1.02} variant="bench" />
        <WallModel position={[2.7, 0, 9.4]} rotationY={Math.PI} scale={1.02} variant="bench" />

        {lamps.map(({ position, rotationY, scale }, index) => (
          <group key={index}>
            <StreetLightModel position={position} rotationY={rotationY} scale={scale} />
            <pointLight
              color={isNight ? "#ffe8a6" : "#fff1b5"}
              distance={10}
              intensity={isNight ? 1.7 : 1.1}
              position={[position[0], 3.28, position[2]]}
            />
          </group>
        ))}

        {shrubs.map((position, index) => (
          <group key={index} position={position}>
            <mesh castShadow position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.56, 14, 14]} />
              <meshStandardMaterial color="#4f8b4a" roughness={0.96} />
            </mesh>
            <mesh castShadow position={[0.36, 0.22, 0.08]}>
              <sphereGeometry args={[0.34, 14, 14]} />
              <meshStandardMaterial color="#5b994f" roughness={0.96} />
            </mesh>
          </group>
        ))}

        {decorativeTrees.map(({ position, rotationY, scale, variant }, index) => (
          <TreeModel
            key={index}
            position={position}
            rotationY={rotationY}
            scale={scale}
            variant={variant}
          />
        ))}

        {centerShowcaseHedges.map(({ position, rotationY, scale }, index) => (
          <WallModel
            key={`showcase-hedge-${index}`}
            position={position}
            rotationY={rotationY}
            scale={scale}
            variant="hedge"
          />
        ))}

        {pathPlanters.map(([x, y, z, scale, color], index) => (
          <Planter key={index} color={color} position={[x, y, z]} scale={scale} />
        ))}

        {centerShowcasePlanters.map(([x, y, z, scale, color], index) => (
          <Planter key={`showcase-planter-${index}`} color={color} position={[x, y, z]} scale={scale} />
        ))}

        {grassTufts.map(([x, y, z, scale], index) => (
          <GrassTuft key={index} position={[x, y, z]} scale={scale} />
        ))}

        {signPosts.map(([x, y, z, label], index) => (
          <SignPost key={index} label={label} position={[x, y, z]} />
        ))}

        <mesh castShadow position={[0, 4.65, 17.7]}>
          <boxGeometry args={[4.5, 1.1, 0.18]} />
          <meshStandardMaterial color="#24452f" roughness={0.86} />
        </mesh>
        <mesh castShadow position={[0, 4.65, 17.82]}>
          <boxGeometry args={[3.7, 0.18, 0.05]} />
          <meshStandardMaterial color="#d9c48b" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[-1.65, 4.9, 17.82]}>
          <boxGeometry args={[0.16, 0.38, 0.05]} />
          <meshStandardMaterial color="#d9c48b" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[1.65, 4.9, 17.82]}>
          <boxGeometry args={[0.16, 0.38, 0.05]} />
          <meshStandardMaterial color="#d9c48b" roughness={0.8} />
        </mesh>

        {animals.map((animal) => (
          <AnimalZone
            key={animal.id}
            active={focusedAnimalId === animal.id}
            animal={animal}
            discovered={discoveredIds.includes(animal.id)}
            onSelect={() => {
              setSelectedAnimalId(animal.id);
              onDiscoverAnimal(animal.id);
              setAutoMoveAnimalId(animal.id);
              setAutoMoveTarget(getApproachTarget(animal, playerPosition));
            }}
          />
        ))}

        <InfoPanel animal={focusedAnimal} statusText={panelStatusText} />
      </group>

      <Environment preset={isNight ? "night" : "park"} />
    </>
  );
}

export default function ZooScene({
  animals,
  discoveredIds,
  missions,
  onDiscoverAnimal,
  sceneMode,
  store,
}: ZooSceneProps) {
  return (
    <XR store={store}>
      <SceneContent
        animals={animals}
        discoveredIds={discoveredIds}
        missions={missions}
        onDiscoverAnimal={onDiscoverAnimal}
        sceneMode={sceneMode}
      />
    </XR>
  );
}
