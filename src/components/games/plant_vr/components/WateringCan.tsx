import { Float, Ring, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import ModelAsset from "./ModelAsset";

type WateringCanProps = {
  selected: boolean;
  onActivate: () => void;
};

const wateringCanAsset = {
  url: new URL("../models/Watering Can.glb", import.meta.url).href,
  targetHeight: 0.34,
} as const;

export default function WateringCan({ selected, onActivate }: WateringCanProps) {
  const badgeRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;

    if (badgeRef.current) {
      badgeRef.current.scale.setScalar(selected ? pulse : 1);
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(selected ? 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.05 : 1);
    }
  });

  return (
    <group position={[-0.38, 1.03, 0.38]}>
      <Float floatIntensity={selected ? 0.55 : 0.22} speed={1.5}>
        <group onClick={onActivate} onPointerDown={onActivate}>
          {selected ? (
            <group ref={ringRef} position={[0, -0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Ring args={[0.13, 0.18, 40]}>
                <meshStandardMaterial
                  color="#90dbff"
                  emissive="#76d0ff"
                  emissiveIntensity={0.45}
                  opacity={0.72}
                  toneMapped={false}
                  transparent
                />
              </Ring>
            </group>
          ) : null}
          {selected ? (
            <mesh position={[0, -0.01, 0]} scale={[1.58, 1.58, 1.58]}>
              <sphereGeometry args={[0.115, 24, 24]} />
              <meshStandardMaterial
                color="#97e1ff"
                emissive="#74ccff"
                emissiveIntensity={0.45}
                opacity={0.16}
                toneMapped={false}
                transparent
              />
            </mesh>
          ) : null}
          <group position={[0, -0.12, 0]} rotation={[0.12, selected ? -0.35 : -0.18, 0.08]}>
            <ModelAsset
              rotation={[0, -Math.PI / 2, 0]}
              targetHeight={wateringCanAsset.targetHeight}
              url={wateringCanAsset.url}
            />
          </group>
          {selected ? (
            <group position={[0.13, -0.12, 0.12]}>
              {Array.from({ length: 4 }, (_, index) => (
                <mesh key={`water-hint-${index}`} position={[index * 0.03, -index * 0.035, 0]}>
                  <sphereGeometry args={[0.013, 10, 10]} />
                  <meshStandardMaterial
                    color="#9ce4ff"
                    emissive="#9ce4ff"
                    emissiveIntensity={0.22}
                  />
                </mesh>
              ))}
            </group>
          ) : null}
          {selected ? (
            <group position={[0, 0.21, 0]} ref={badgeRef}>
              <mesh scale={[1.55, 0.5, 0.22]}>
                <sphereGeometry args={[0.07, 18, 18]} />
                <meshStandardMaterial
                  color="#d9f3ff"
                  emissive="#9cdfff"
                  emissiveIntensity={0.24}
                  opacity={0.92}
                  transparent
                />
              </mesh>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#1c4e65"
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

useGLTF.preload(wateringCanAsset.url);
