import { Float, Ring, Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

type SunOrbProps = {
  selected: boolean;
  onActivate: () => void;
};

export default function SunOrb({ selected, onActivate }: SunOrbProps) {
  const orbRef = useRef<Mesh>(null);
  const badgeRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    if (!orbRef.current) {
      return;
    }
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
    orbRef.current.scale.setScalar(selected ? pulse * 1.08 : pulse);

    if (badgeRef.current) {
      badgeRef.current.scale.setScalar(selected ? 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.07 : 1);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.45;
      ringRef.current.scale.setScalar(selected ? 1 + Math.sin(state.clock.elapsedTime * 2.6) * 0.06 : 1);
    }
  });

  return (
    <group position={[0.42, 1.14, 0.3]}>
      <Float floatIntensity={0.7} speed={1.8}>
        <group onClick={onActivate} onPointerDown={onActivate}>
          {selected ? (
            <group ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
              <Ring args={[0.17, 0.22, 48]}>
                <meshStandardMaterial
                  color="#ffe68c"
                  emissive="#ffe272"
                  emissiveIntensity={0.5}
                  opacity={0.66}
                  toneMapped={false}
                  transparent
                />
              </Ring>
            </group>
          ) : null}
          <mesh ref={orbRef}>
            <sphereGeometry args={[0.11, 28, 28]} />
            <meshStandardMaterial
              color={selected ? "#ffe89a" : "#f5c94e"}
              emissive="#ffdf73"
              emissiveIntensity={selected ? 1.3 : 0.8}
              toneMapped={false}
            />
          </mesh>
          <mesh scale={[1.55, 1.55, 1.55]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial
              color="#ffe8a1"
              emissive="#ffe38b"
              emissiveIntensity={0.45}
              opacity={0.18}
              toneMapped={false}
              transparent
            />
          </mesh>
          {selected ? (
            <mesh scale={[2.05, 2.05, 2.05]}>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial
                color="#fff4b2"
                emissive="#ffea80"
                emissiveIntensity={0.5}
                opacity={0.12}
                toneMapped={false}
                transparent
              />
            </mesh>
          ) : null}
        </group>
        <Sparkles
          color="#ffe9a0"
          count={selected ? 24 : 12}
          scale={[0.52, 0.52, 0.52]}
          size={3}
        />
        {selected ? (
          <group position={[0, 0.23, 0]} ref={badgeRef}>
            <mesh scale={[1.55, 0.5, 0.22]}>
              <sphereGeometry args={[0.07, 18, 18]} />
              <meshStandardMaterial
                color="#fff6c9"
                emissive="#ffe88a"
                emissiveIntensity={0.28}
                opacity={0.94}
                transparent
              />
            </mesh>
            <Text
              anchorX="center"
              anchorY="middle"
              color="#6a5318"
              fontSize={0.034}
              position={[0, 0, 0.02]}
            >
              Tanlandi
            </Text>
          </group>
        ) : null}
      </Float>
    </group>
  );
}
