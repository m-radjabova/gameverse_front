import { Float, Ring, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type SoilBagProps = {
  selected: boolean;
  onActivate: () => void;
};

export default function SoilBag({ selected, onActivate }: SoilBagProps) {
  const badgeRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.1) * 0.07;

    if (badgeRef.current) {
      badgeRef.current.scale.setScalar(selected ? pulse : 1);
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(selected ? 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.05 : 1);
    }
  });

  return (
    <group position={[0.84, 0.98, 0.04]}>
      <Float floatIntensity={0.28} speed={1.35}>
        <group onClick={onActivate} onPointerDown={onActivate}>
          {selected ? (
            <group ref={ringRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Ring args={[0.14, 0.19, 40]}>
                <meshStandardMaterial
                  color="#d0a176"
                  emissive="#c58f5b"
                  emissiveIntensity={0.38}
                  opacity={0.68}
                  toneMapped={false}
                  transparent
                />
              </Ring>
            </group>
          ) : null}
          {selected ? (
            <mesh scale={[1.3, 1.2, 1.24]}>
              <boxGeometry args={[0.2, 0.3, 0.12]} />
              <meshStandardMaterial
                color="#c69f73"
                emissive="#a87542"
                emissiveIntensity={0.3}
                opacity={0.14}
                toneMapped={false}
                transparent
              />
            </mesh>
          ) : null}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.3, 0.12]} />
            <meshStandardMaterial
              color={selected ? "#a47248" : "#79512f"}
              emissive={selected ? "#8a5b37" : "#26170b"}
              emissiveIntensity={selected ? 0.18 : 0.06}
              roughness={0.92}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.05, 0.1]} />
            <meshStandardMaterial color="#b48358" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.04, 0.065]}>
            <planeGeometry args={[0.11, 0.09]} />
            <meshStandardMaterial color="#f0dec1" />
          </mesh>
          <mesh position={[0, -0.11, 0.065]}>
            <planeGeometry args={[0.1, 0.04]} />
            <meshStandardMaterial color="#d7c198" />
          </mesh>
          {selected ? (
            <group position={[0.12, -0.16, 0.02]}>
              {Array.from({ length: 4 }, (_, index) => (
                <mesh
                  key={`soil-speckle-${index}`}
                  position={[index * 0.024, index % 2 === 0 ? -0.01 : 0.015, 0]}
                >
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshStandardMaterial color="#8d6138" roughness={0.9} />
                </mesh>
              ))}
            </group>
          ) : null}
          {selected ? (
            <group position={[0, 0.24, 0]} ref={badgeRef}>
              <mesh scale={[1.48, 0.5, 0.2]}>
                <sphereGeometry args={[0.07, 18, 18]} />
                <meshStandardMaterial
                  color="#f1dfc7"
                  emissive="#cda272"
                  emissiveIntensity={0.18}
                  opacity={0.92}
                  transparent
                />
              </mesh>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#5f3e22"
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
