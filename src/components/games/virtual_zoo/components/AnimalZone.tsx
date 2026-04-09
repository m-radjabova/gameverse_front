import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import AnimalModel from "./AnimalModel";
import TreeModel, { type TreeVariant } from "./TreeModel";
import WallModel from "./WallModel";
import type { ZooAnimal } from "../types";

type AnimalZoneProps = {
  animal: ZooAnimal;
  active: boolean;
  discovered: boolean;
  onSelect: () => void;
};

const zoneTrees: Array<{
  offset: [number, number, number];
  rotationY: number;
  scale: number;
  variant: TreeVariant;
}> = [
  { offset: [-2.2, 0, -1.6], rotationY: Math.PI * 0.12, scale: 0.7, variant: "tree" },
  { offset: [2.1, 0, -1.8], rotationY: -Math.PI * 0.18, scale: 0.74, variant: "treeOne" },
  { offset: [-2.35, 0, 1.5], rotationY: Math.PI * 0.3, scale: 0.72, variant: "treeTwo" },
  { offset: [2.2, 0, 1.55], rotationY: -Math.PI * 0.08, scale: 0.76, variant: "grove" },
];

const zoneFenceSegments: Array<{
  position: [number, number, number];
  rotationY: number;
  scale: number;
}> = [
  { position: [-2.35, 0, -1.55], rotationY: Math.PI / 2, scale: 1.02 },
  { position: [-2.35, 0, 0.15], rotationY: Math.PI / 2, scale: 1.02 },
  { position: [-2.35, 0, 1.85], rotationY: Math.PI / 2, scale: 0.94 },
  { position: [2.35, 0, -1.55], rotationY: -Math.PI / 2, scale: 1.02 },
  { position: [2.35, 0, 0.15], rotationY: -Math.PI / 2, scale: 1.02 },
  { position: [2.35, 0, 1.85], rotationY: -Math.PI / 2, scale: 0.94 },
  { position: [-1.45, 0, -2.35], rotationY: 0, scale: 1 },
  { position: [0.1, 0, -2.35], rotationY: 0, scale: 1.02 },
  { position: [1.65, 0, -2.35], rotationY: 0, scale: 0.98 },
];

const zoneHedges: Array<{
  position: [number, number, number];
  rotationY: number;
  scale: number;
}> = [
  { position: [-2.05, 0, -1.55], rotationY: Math.PI / 2, scale: 0.82 },
  { position: [-2.05, 0, 0.2], rotationY: Math.PI / 2, scale: 0.84 },
  { position: [2.05, 0, -1.55], rotationY: -Math.PI / 2, scale: 0.82 },
  { position: [2.05, 0, 0.2], rotationY: -Math.PI / 2, scale: 0.84 },
  { position: [-1.35, 0, -2.02], rotationY: 0, scale: 0.78 },
  { position: [0.1, 0, -2.02], rotationY: 0, scale: 0.82 },
  { position: [1.55, 0, -2.02], rotationY: 0, scale: 0.78 },
  { position: [-1.7, 0, 2.05], rotationY: Math.PI * 0.08, scale: 0.72 },
  { position: [1.7, 0, 2.05], rotationY: -Math.PI * 0.08, scale: 0.72 },
];

function getZoneTheme(animal: ZooAnimal) {
  switch (animal.id) {
    case "lion":
    case "zebra":
    case "giraffe":
    case "elephant":
    case "rhino":
      return {
        ground: "#aebc7d",
        ring: "#a17d4a",
        innerRing: "#d3be84",
        fence: "#8c6b43",
        trees: false,
        water: false,
        rocks: true,
        reeds: false,
        ice: false,
        sand: animal.id === "rhino" || animal.id === "elephant",
      };
    case "monkey":
    case "bear":
    case "wolf":
    case "fox":
    case "panda":
    case "rabbit":
      return {
        ground: "#5f8e4b",
        ring: "#76573a",
        innerRing: "#8fb06a",
        fence: "#7a5f40",
        trees: true,
        water: false,
        rocks: animal.id === "bear" || animal.id === "panda",
        reeds: false,
        ice: false,
        sand: false,
      };
    case "crocodile":
    case "hippo":
      return {
        ground: "#708b56",
        ring: "#846544",
        innerRing: "#7ea167",
        fence: "#7f6645",
        trees: false,
        water: true,
        rocks: true,
        reeds: true,
        ice: false,
        sand: false,
      };
    case "penguin":
      return {
        ground: "#dbe7ef",
        ring: "#8ca0b0",
        innerRing: "#f4fbff",
        fence: "#7f93a4",
        trees: false,
        water: true,
        rocks: false,
        reeds: false,
        ice: true,
        sand: false,
      };
    case "camel":
    case "kangaroo":
      return {
        ground: "#d7bf87",
        ring: "#a57948",
        innerRing: "#edd8ab",
        fence: "#93663d",
        trees: false,
        water: false,
        rocks: true,
        reeds: false,
        ice: false,
        sand: true,
      };
    default:
      return {
        ground: "#4e7b47",
        ring: "#8c6a45",
        innerRing: "#5c9348",
        fence: "#8d6a44",
        trees: true,
        water: false,
        rocks: false,
        reeds: false,
        ice: false,
        sand: false,
      };
  }
}

function getBaseFacingYaw(animal: ZooAnimal) {
  const lookTargetX = animal.position[0] * 0.15;
  const lookTargetZ = 17;

  return Math.atan2(lookTargetX - animal.position[0], lookTargetZ - animal.position[2]) + Math.PI;
}

export default function AnimalZone({
  animal,
  active,
  discovered,
  onSelect,
}: AnimalZoneProps) {
  const roamingRef = useRef<Group>(null);
  const theme = getZoneTheme(animal);

  useFrame((state) => {
    if (!roamingRef.current) {
      return;
    }

    const t = state.clock.elapsedTime;
    const radius = animal.id === "elephant" ? 0.24 : animal.id === "giraffe" ? 0.18 : 0.32;
    const speed = animal.id === "elephant" ? 0.22 : animal.id === "lion" ? 0.34 : 0.48;
    const phase = animal.position[0] * 0.17 + animal.position[2] * 0.11;
    const baseFacingYaw = getBaseFacingYaw(animal);

    roamingRef.current.position.x = Math.sin(t * speed + phase) * radius;
    roamingRef.current.position.z = Math.cos(t * speed * 0.9 + phase) * radius * 0.75;
    roamingRef.current.rotation.y = baseFacingYaw + Math.sin(t * speed * 0.8 + phase) * 0.22;
  });

  return (
    <group position={animal.position}>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.15, 3.38, 56]} />
        <meshStandardMaterial color={theme.ring} roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.35, 48]} />
        <meshStandardMaterial color={active ? animal.accent : theme.ground} roughness={0.98} />
      </mesh>

      <mesh receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.85, 48]} />
        <meshStandardMaterial
          color={active ? "#fff1c8" : theme.innerRing}
          emissive={active ? animal.accent : "#000000"}
          emissiveIntensity={active ? 0.18 : 0}
          roughness={0.85}
        />
      </mesh>

      {theme.trees
        ? zoneTrees.map(({ offset, rotationY, scale, variant }, index) => (
            <TreeModel
              key={index}
              position={offset}
              rotationY={rotationY}
              scale={scale}
              variant={variant}
            />
          ))
        : null}

      {zoneFenceSegments.map(({ position, rotationY, scale }, index) => (
        <WallModel
          key={`fence-${index}`}
          position={position}
          rotationY={rotationY}
          scale={scale}
          variant="fence"
        />
      ))}

      {zoneHedges.map(({ position, rotationY, scale }, index) => (
        <WallModel
          key={`hedge-${index}`}
          position={position}
          rotationY={rotationY}
          scale={scale}
          variant="hedge"
        />
      ))}

      {theme.water ? (
        <>
          <mesh receiveShadow position={[-0.2, 0.035, 0.98]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.92, 28]} />
            <meshStandardMaterial color={animal.id === "penguin" ? "#a6d7f2" : "#5d9fc0"} roughness={0.2} />
          </mesh>
          <mesh receiveShadow position={[-0.2, 0.02, 0.98]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95, 1.08, 28]} />
            <meshStandardMaterial color="#c9d7d5" roughness={0.8} />
          </mesh>
        </>
      ) : null}

      {theme.ice
        ? [[-0.95, 0.08, -0.8], [0.65, 0.06, -0.95], [1.05, 0.05, 0.15]].map((ice, index) => (
            <mesh key={index} castShadow receiveShadow position={ice as [number, number, number]} rotation={[0, index * 0.4, 0]}>
              <boxGeometry args={[0.62, 0.1, 0.46]} />
              <meshStandardMaterial color="#eef8ff" transparent opacity={0.9} roughness={0.18} />
            </mesh>
          ))
        : null}

      {theme.sand
        ? [[-0.9, 0.05, -0.7], [0.95, 0.05, -0.95], [0.1, 0.05, 1.08]].map((mound, index) => (
            <mesh key={index} castShadow receiveShadow position={mound as [number, number, number]}>
              <sphereGeometry args={[0.42, 14, 14]} />
              <meshStandardMaterial color="#d8be7c" roughness={0.98} />
            </mesh>
          ))
        : null}

      {theme.rocks
        ? [[-0.95, 0.16, -0.86], [1.04, 0.14, -0.62], [0.62, 0.12, 1.02]].map((rock, index) => (
            <mesh key={index} castShadow position={rock as [number, number, number]}>
              <dodecahedronGeometry args={[0.26 + index * 0.05, 0]} />
              <meshStandardMaterial color="#89796a" roughness={0.96} />
            </mesh>
          ))
        : null}

      {theme.reeds
        ? [[-1.1, 0, 1.2], [-0.75, 0, 1.38], [0.15, 0, 1.28], [0.42, 0, 1.16]].map((reed, index) => (
            <group key={index} position={reed as [number, number, number]}>
              {[0, 0.12, -0.1].map((offset, reedIndex) => (
                <mesh key={reedIndex} castShadow position={[offset, 0.42 + reedIndex * 0.08, 0]} rotation={[0, 0, -0.06 + reedIndex * 0.05]}>
                  <boxGeometry args={[0.04, 0.78 + reedIndex * 0.12, 0.02]} />
                  <meshStandardMaterial color="#668f4e" roughness={0.96} />
                </mesh>
              ))}
            </group>
          ))
        : null}

      {animal.id === "lion" && (
        <>
          <mesh castShadow position={[-0.9, 0.22, -0.86]}>
            <boxGeometry args={[0.9, 0.24, 0.62]} />
            <meshStandardMaterial color="#7c5a34" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[1.15, 0.18, -0.6]}>
            <dodecahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#90704f" roughness={0.98} />
          </mesh>
        </>
      )}

      {animal.id === "elephant" && (
        <>
          <mesh receiveShadow position={[-0.75, 0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.82, 24]} />
            <meshStandardMaterial color="#6eb2d2" roughness={0.28} />
          </mesh>
          <mesh position={[-0.18, 0.42, 1.38]}>
            <cylinderGeometry args={[0.08, 0.08, 0.82, 10]} />
            <meshStandardMaterial color="#b9d8e6" roughness={0.76} />
          </mesh>
        </>
      )}

      {animal.id === "monkey" && (
        <>
          <mesh castShadow position={[-0.78, 1.45, -0.9]}>
            <cylinderGeometry args={[0.08, 0.1, 2.5, 10]} />
            <meshStandardMaterial color="#6d4a2b" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[-0.78, 2.46, -0.9]} rotation={[0.2, 0.2, 1.12]}>
            <boxGeometry args={[1.3, 0.1, 0.1]} />
            <meshStandardMaterial color="#7a5330" roughness={0.94} />
          </mesh>
        </>
      )}

      {animal.id === "giraffe" && (
        <>
          <mesh castShadow position={[0.92, 1.5, 0.88]}>
            <cylinderGeometry args={[0.12, 0.18, 2.7, 10]} />
            <meshStandardMaterial color="#6d4a2a" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0.92, 2.95, 0.88]}>
            <sphereGeometry args={[0.62, 16, 16]} />
            <meshStandardMaterial color="#5f9448" roughness={0.94} />
          </mesh>
        </>
      )}

      {animal.id === "zebra" && (
        <>
          {[[-0.92, 0.22, -1.05], [0.88, 0.22, -0.86], [0.12, 0.22, -1.22]].map((hay, index) => (
            <mesh key={index} castShadow position={hay as [number, number, number]}>
              <boxGeometry args={[0.48, 0.24, 0.42]} />
              <meshStandardMaterial color="#b3924f" roughness={0.95} />
            </mesh>
          ))}
        </>
      )}

      <group ref={roamingRef}>
        <AnimalModel animal={animal} active={active} discovered={discovered} onSelect={onSelect} />
      </group>
    </group>
  );
}
