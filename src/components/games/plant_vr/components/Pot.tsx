import { Ring, Sparkles, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { InteractionType } from "../types";
import ModelAsset from "./ModelAsset";

type PotProps = {
  effectType: Exclude<InteractionType, "inspect"> | null;
  onActivate: () => void;
  selectedTool: Exclude<InteractionType, "inspect"> | null;
  seedPlanted: boolean;
};

const potAsset = {
  url: new URL("../models/Pot.glb", import.meta.url).href,
  targetHeight: 0.42,
} as const;

export default function Pot({
  effectType,
  onActivate,
  seedPlanted,
  selectedTool,
}: PotProps) {
  const effectRef = useRef<Group>(null);
  const highlightColor =
    selectedTool === "water"
      ? "#7fd8ff"
      : selectedTool === "sunlight"
        ? "#ffe082"
        : selectedTool === "soil"
          ? "#c18f62"
      : "#97dc8e";

  useFrame((state) => {
    if (!effectRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.05;
    effectRef.current.scale.setScalar(pulse);
  });

  return (
    <group position={[0, 0.88, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 48]} />
        <meshStandardMaterial color="#4a6d61" opacity={0.34} transparent />
      </mesh>

      <group onClick={onActivate} onPointerDown={onActivate}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <ModelAsset targetHeight={potAsset.targetHeight} url={potAsset.url} />
        </group>
      </group>

      <group onClick={onActivate} onPointerDown={onActivate}>
        <mesh position={[0, 0.118, 0]} receiveShadow>
          <cylinderGeometry args={[0.238, 0.224, 0.082, 40]} />
          <meshStandardMaterial color={seedPlanted ? "#5c3820" : "#7a5133"} roughness={1} />
        </mesh>

        <mesh position={[0, 0.146, 0]} scale={[1, 0.24, 0.92]} receiveShadow>
          <sphereGeometry args={[0.23, 32, 24]} />
          <meshStandardMaterial color={seedPlanted ? "#664028" : "#845536"} roughness={1} />
        </mesh>
      </group>

      {Array.from({ length: 14 }, (_, index) => (
        <mesh
          key={`soil-speck-${index}`}
          position={[
            Math.cos(index * 0.52) * 0.165,
            0.172 + (index % 3) * 0.005,
            Math.sin(index * 0.52) * 0.135,
          ]}
        >
          <sphereGeometry args={[0.01 + (index % 2) * 0.005, 8, 8]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#7a4c2b" : "#59351f"} roughness={1} />
        </mesh>
      ))}

      {seedPlanted
        ? Array.from({ length: 6 }, (_, index) => (
            <mesh
              key={`leaf-chip-${index}`}
              position={[
                Math.cos(index * 1.16) * 0.19,
                0.178,
                Math.sin(index * 1.16) * 0.145,
              ]}
              rotation={[0, index * 0.5, index % 2 === 0 ? 0.4 : -0.35]}
            >
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#7aa35e" : "#95ba6e"}
                roughness={0.86}
              />
            </mesh>
          ))
        : null}

      <Ring
        args={[0.28, 0.37, 48]}
        position={[0, 0.185, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={highlightColor}
          emissive={highlightColor}
          emissiveIntensity={selectedTool ? 0.95 : 0.18}
          opacity={selectedTool ? 0.82 : 0.16}
          transparent
        />
      </Ring>

      {effectType === "water" && (
        <group position={[0, 0.42, 0]} ref={effectRef}>
          {Array.from({ length: 10 }, (_, index) => (
            <mesh key={`drop-${index}`} position={[index * 0.028 - 0.13, -index * 0.04, 0]}>
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshStandardMaterial
                color="#8dd7ff"
                emissive="#7bcfff"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {effectType === "sunlight" && (
        <group ref={effectRef}>
          <Sparkles
            color="#ffe59a"
            count={18}
            position={[0, 0.44, 0]}
            scale={[0.5, 0.3, 0.5]}
            size={4}
          />
        </group>
      )}

      {effectType === "soil" && (
        <group position={[0, 0.3, 0]} ref={effectRef}>
          {Array.from({ length: 9 }, (_, index) => (
            <mesh
              key={`soil-${index}`}
              position={[index * 0.03 - 0.12, index % 2 === 0 ? 0.03 : 0.08, 0]}
            >
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial color="#8e5e37" />
            </mesh>
          ))}
        </group>
      )}

      {effectType === "seed" && (
        <group position={[0, 0.32, 0]} ref={effectRef}>
          <Ring
            args={[0.07, 0.12, 30]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color="#f8de91"
              emissive="#f4d469"
              emissiveIntensity={0.42}
              opacity={0.72}
              toneMapped={false}
              transparent
            />
          </Ring>
        </group>
      )}
    </group>
  );
}

useGLTF.preload(potAsset.url);
