import { Float, Ring, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import ModelAsset from "./ModelAsset";

type SeedProps = {
  planted: boolean;
  selected: boolean;
  onActivate: () => void;
};

const seedAsset = {
  url: new URL("../models/Seed.glb", import.meta.url).href,
  targetHeight: 0.2,
} as const;

export default function Seed({ planted, selected, onActivate }: SeedProps) {
  const badgeRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.4) * 0.08;

    if (badgeRef.current) {
      badgeRef.current.scale.setScalar(selected ? pulse : 1);
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(selected ? 1 + Math.sin(state.clock.elapsedTime * 2.8) * 0.06 : 1);
    }
  });

  if (planted) {
    return null;
  }

  return (
    <group position={[-0.78, 0.96, 0.12]}>
      <Float floatIntensity={0.35} speed={1.6}>
        <group onClick={onActivate} onPointerDown={onActivate}>
          {selected ? (
            <group ref={ringRef} position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Ring args={[0.09, 0.125, 32]}>
                <meshStandardMaterial
                  color="#ffe08a"
                  emissive="#ffd45a"
                  emissiveIntensity={0.5}
                  opacity={0.78}
                  toneMapped={false}
                  transparent
                />
              </Ring>
            </group>
          ) : null}
          {selected ? (
            <mesh scale={[1.65, 1.65, 1.65]}>
              <sphereGeometry args={[0.07, 24, 24]} />
              <meshStandardMaterial
                color="#ffe9ae"
                emissive="#ffd569"
                emissiveIntensity={0.55}
                opacity={0.2}
                toneMapped={false}
                transparent
              />
            </mesh>
          ) : null}
          <group rotation={[0.18, selected ? Math.PI * 0.25 : Math.PI * 0.08, 0]}>
            <ModelAsset
              rotation={[0, Math.PI / 2, 0]}
              targetHeight={seedAsset.targetHeight}
              url={seedAsset.url}
            />
          </group>
          {selected ? (
            <group position={[0, 0.16, 0]} ref={badgeRef}>
              <mesh scale={[1.3, 0.45, 0.18]}>
                <sphereGeometry args={[0.07, 18, 18]} />
                <meshStandardMaterial
                  color="#fff2c5"
                  emissive="#ffe180"
                  emissiveIntensity={0.28}
                  opacity={0.92}
                  transparent
                />
              </mesh>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#5c4317"
                fontSize={0.034}
                position={[0, 0, 0.02]}
              >
                Tanlandi
              </Text>
            </group>
          ) : null}
        </group>
      </Float>
    </group>
  );
}

useGLTF.preload(seedAsset.url);
