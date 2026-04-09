import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { PlantStage, PlantStats } from "../types";

type PlantProps = {
  planted: boolean;
  stage: PlantStage;
  stats: PlantStats;
};

const stageHeight: Record<PlantStage, number> = {
  seed: 0.03,
  sprout: 0.2,
  "young plant": 0.42,
  "mature plant": 0.68,
  "flowering plant": 0.78,
};

export default function Plant({ planted, stage, stats }: PlantProps) {
  const groupRef = useRef<Group>(null);

  const isHealthy = stats.health >= 70;
  const droopRotation = isHealthy ? 0 : 0.18;
  const growthScale = 0.55 + stageHeight[stage];
  const petalCount = stage === "flowering plant" ? 8 : 0;
  const leafColor = isHealthy ? "#5faa59" : "#83916d";
  const leafEdgeColor = isHealthy ? "#87cc72" : "#9aa487";
  const stemColor = isHealthy ? "#5f9d54" : "#788460";
  const budColor = stage === "flowering plant" ? "#ef8fb4" : "#7fb870";
  const petalColor = isHealthy ? "#ffb3cf" : "#d5b0bf";
  const petalHighlight = isHealthy ? "#fff0f7" : "#f0e6eb";
  const pollenColor = isHealthy ? "#6f4d1e" : "#7e7050";
  const stageLevel =
    stage === "sprout"
      ? 1
      : stage === "young plant"
        ? 2
        : stage === "mature plant"
          ? 3
          : stage === "flowering plant"
            ? 4
            : 0;

  const petalOffsets = useMemo(
    () =>
      Array.from({ length: petalCount }, (_, index) => {
        const angle = (Math.PI * 2 * index) / petalCount;
        return {
          angle,
          position: [Math.cos(angle) * 0.115, 0.665, Math.sin(angle) * 0.115] as const,
        };
      }),
    [petalCount],
  );

  const soilPebbles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        key: index,
        position: [
          Math.cos(index * 1.1) * 0.08,
          -0.12 + (index % 3) * 0.006,
          Math.sin(index * 1.1) * 0.08,
        ] as const,
        scale: 0.012 + (index % 3) * 0.003,
      })),
    [],
  );

  const pollenOffsets = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 14;
        const radius = index % 2 === 0 ? 0.018 : 0.011;
        return [
          Math.cos(angle) * radius,
          0.008 + (index % 3) * 0.002,
          Math.sin(angle) * radius,
        ] as const;
      }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current || !planted) {
      return;
    }

    const sway = isHealthy ? Math.sin(state.clock.elapsedTime * 1.4) * 0.05 : 0.01;
    groupRef.current.rotation.z = sway - droopRotation;
    groupRef.current.scale.y += (growthScale - groupRef.current.scale.y) * 0.08;
    groupRef.current.scale.x += (1 - groupRef.current.scale.x) * 0.08;
    groupRef.current.scale.z += (1 - groupRef.current.scale.z) * 0.08;
  });

  if (!planted) {
    return null;
  }

  return (
    <group position={[0, 1.02, 0]} ref={groupRef} scale={[1, 0.5, 1]}>
      {stage === "seed" ? (
        <group>
          {soilPebbles.map((pebble) => (
            <mesh key={pebble.key} position={pebble.position}>
              <sphereGeometry args={[pebble.scale, 10, 10]} />
              <meshStandardMaterial color="#6b432a" roughness={1} />
            </mesh>
          ))}
          <mesh position={[0, -0.11, 0]}>
            <sphereGeometry args={[0.045, 24, 24]} />
            <meshStandardMaterial color="#6d4320" roughness={0.8} />
          </mesh>
          <mesh position={[0.01, -0.1, 0.025]} rotation={[0.2, 0.5, 0]}>
            <sphereGeometry args={[0.017, 16, 16]} />
            <meshStandardMaterial color="#8a5b30" roughness={0.75} />
          </mesh>
        </group>
      ) : (
        <Float floatIntensity={0.1} rotationIntensity={0.02} speed={1.15}>
          <group>
            <mesh position={[0, stageHeight[stage] / 2 - 0.1, 0]}>
              <cylinderGeometry args={[0.018, 0.028, stageHeight[stage], 16]} />
              <meshStandardMaterial
                color={stemColor}
                emissive={isHealthy ? "#2d5d2b" : "#434b37"}
                emissiveIntensity={0.08}
                roughness={0.7}
              />
            </mesh>

            {stageLevel >= 1 && (
              <>
                <mesh
                  position={[0.11, Math.min(0.16, stageHeight[stage] * 0.48), 0]}
                  rotation={[0, 0.18, -0.9]}
                  scale={[0.7, 1.2, 0.18]}
                >
                  <sphereGeometry args={[0.075, 18, 18]} />
                  <meshStandardMaterial color={leafColor} roughness={0.84} />
                </mesh>
                <mesh
                  position={[0.09, Math.min(0.16, stageHeight[stage] * 0.48), 0.008]}
                  rotation={[0, 0.18, -0.9]}
                  scale={[0.22, 0.9, 0.08]}
                >
                  <sphereGeometry args={[0.075, 18, 18]} />
                  <meshStandardMaterial color={leafEdgeColor} roughness={0.76} />
                </mesh>
                <mesh
                  position={[0.098, Math.min(0.16, stageHeight[stage] * 0.48), 0.015]}
                  rotation={[0, 0.18, -0.9]}
                  scale={[0.06, 0.82, 0.03]}
                >
                  <sphereGeometry args={[0.075, 14, 14]} />
                  <meshStandardMaterial color="#d9f0b0" roughness={0.62} />
                </mesh>

                <mesh
                  position={[-0.12, Math.min(0.22, stageHeight[stage] * 0.7), 0]}
                  rotation={[0, -0.2, 0.92]}
                  scale={[0.78, 1.28, 0.18]}
                >
                  <sphereGeometry args={[0.078, 18, 18]} />
                  <meshStandardMaterial color={leafColor} roughness={0.84} />
                </mesh>
                <mesh
                  position={[-0.1, Math.min(0.22, stageHeight[stage] * 0.7), -0.008]}
                  rotation={[0, -0.2, 0.92]}
                  scale={[0.24, 0.94, 0.08]}
                >
                  <sphereGeometry args={[0.078, 18, 18]} />
                  <meshStandardMaterial color={leafEdgeColor} roughness={0.76} />
                </mesh>
                <mesh
                  position={[-0.108, Math.min(0.22, stageHeight[stage] * 0.7), -0.016]}
                  rotation={[0, -0.2, 0.92]}
                  scale={[0.06, 0.88, 0.03]}
                >
                  <sphereGeometry args={[0.078, 14, 14]} />
                  <meshStandardMaterial color="#d9f0b0" roughness={0.62} />
                </mesh>
              </>
            )}

            {stageLevel >= 2 && (
              <>
                <mesh position={[0.04, 0.33, 0.02]} rotation={[0.14, 0.08, -0.3]}>
                  <cylinderGeometry args={[0.008, 0.012, 0.16, 12]} />
                  <meshStandardMaterial color={stemColor} roughness={0.76} />
                </mesh>
                <mesh
                  position={[0.12, 0.39, 0.03]}
                  rotation={[0.12, 0.24, -0.86]}
                  scale={[0.64, 1.06, 0.16]}
                >
                  <sphereGeometry args={[0.07, 18, 18]} />
                  <meshStandardMaterial color={leafColor} roughness={0.82} />
                </mesh>
                <mesh
                  position={[0.122, 0.392, 0.038]}
                  rotation={[0.12, 0.24, -0.86]}
                  scale={[0.05, 0.78, 0.03]}
                >
                  <sphereGeometry args={[0.07, 14, 14]} />
                  <meshStandardMaterial color="#d9f0b0" roughness={0.58} />
                </mesh>
              </>
            )}

            {stageLevel >= 3 && (
              <>
                <mesh position={[-0.03, 0.46, -0.02]} rotation={[-0.1, -0.06, 0.24]}>
                  <cylinderGeometry args={[0.007, 0.011, 0.18, 12]} />
                  <meshStandardMaterial color={stemColor} roughness={0.76} />
                </mesh>
                <mesh
                  position={[-0.12, 0.54, -0.025]}
                  rotation={[-0.16, -0.2, 0.86]}
                  scale={[0.62, 1.02, 0.16]}
                >
                  <sphereGeometry args={[0.068, 18, 18]} />
                  <meshStandardMaterial color={leafColor} roughness={0.82} />
                </mesh>
                <mesh
                  position={[-0.124, 0.544, -0.032]}
                  rotation={[-0.16, -0.2, 0.86]}
                  scale={[0.05, 0.76, 0.03]}
                >
                  <sphereGeometry args={[0.068, 14, 14]} />
                  <meshStandardMaterial color="#d9f0b0" roughness={0.58} />
                </mesh>
                <mesh position={[0, 0.55, 0]} rotation={[0.05, 0, 0]}>
                  <sphereGeometry args={[0.052, 20, 20]} />
                  <meshStandardMaterial
                    color={budColor}
                    emissive={stage === "flowering plant" ? "#8e3458" : "#315a2e"}
                    emissiveIntensity={stage === "flowering plant" ? 0.18 : 0.08}
                    roughness={0.65}
                  />
                </mesh>
              </>
            )}

            {stage === "flowering plant" && (
              <group position={[0, 0.56, 0]}>
                <mesh position={[0, -0.018, 0]}>
                  <sphereGeometry args={[0.03, 18, 18]} />
                  <meshStandardMaterial color="#7fb870" roughness={0.72} />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.05, 20, 20]} />
                  <meshStandardMaterial
                    color="#f1b749"
                    emissive="#ffc447"
                    emissiveIntensity={0.32}
                  />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[0.022, 16, 16]} />
                  <meshStandardMaterial color="#5f4621" roughness={0.85} />
                </mesh>
                {petalOffsets.map((petal, index) => (
                  <group
                    key={`${petal.position[0]}-${index}`}
                    position={petal.position}
                    rotation={[0, petal.angle, Math.PI / 2]}
                  >
                    <mesh scale={[0.58, 1.28, 0.18]}>
                      <sphereGeometry args={[0.06, 20, 20]} />
                      <meshStandardMaterial
                        color={petalColor}
                        emissive="#ffbfd9"
                        emissiveIntensity={0.18}
                        roughness={0.58}
                      />
                    </mesh>
                    <mesh position={[0.018, 0.022, 0]} scale={[0.24, 0.62, 0.08]}>
                      <sphereGeometry args={[0.06, 16, 16]} />
                      <meshStandardMaterial color={petalHighlight} roughness={0.44} />
                    </mesh>
                    <mesh position={[-0.01, -0.016, 0]} scale={[0.16, 0.36, 0.05]}>
                      <sphereGeometry args={[0.06, 14, 14]} />
                      <meshStandardMaterial color="#f58ab7" roughness={0.5} />
                    </mesh>
                  </group>
                ))}
                {pollenOffsets.map((offset, index) => (
                  <mesh key={`pollen-${index}`} position={offset}>
                    <sphereGeometry args={[0.0045, 8, 8]} />
                    <meshStandardMaterial
                      color={pollenColor}
                      emissive="#f6d06f"
                      emissiveIntensity={0.14}
                      roughness={0.48}
                    />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        </Float>
      )}
    </group>
  );
}
