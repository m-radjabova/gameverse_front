import { RoundedBox, Text } from "@react-three/drei";
import type { ZooAnimal } from "../types";

type MiniMapProps = {
  animals: ZooAnimal[];
  discoveredIds: string[];
  focusedAnimalId: string | null;
};

export default function MiniMap({
  animals,
  discoveredIds,
  focusedAnimalId,
}: MiniMapProps) {
  return (
    <group position={[0, -0.82, -1.55]}>
      <RoundedBox args={[1.26, 0.92, 0.08]} radius={0.08} smoothness={6}>
        <meshStandardMaterial color="#122319" opacity={0.88} transparent roughness={0.56} />
      </RoundedBox>

      <Text
        anchorX="center"
        anchorY="middle"
        color="#f8fafc"
        fontSize={0.07}
        position={[0, 0.34, 0.05]}
      >
        ZOO MAP
      </Text>

      <mesh position={[0, -0.02, 0.05]}>
        <planeGeometry args={[0.9, 0.56]} />
        <meshBasicMaterial color="#224431" opacity={0.92} transparent />
      </mesh>

      <mesh position={[0, -0.02, 0.06]}>
        <planeGeometry args={[0.1, 0.5]} />
        <meshBasicMaterial color="#dcc9a4" />
      </mesh>

      <mesh position={[0, -0.02, 0.065]}>
        <planeGeometry args={[0.72, 0.1]} />
        <meshBasicMaterial color="#dcc9a4" />
      </mesh>

      <mesh position={[0, 0.22, 0.07]}>
        <circleGeometry args={[0.035, 18]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {animals.map((animal) => {
        const isDiscovered = discoveredIds.includes(animal.id);
        const isFocused = focusedAnimalId === animal.id;
        const x = (animal.position[0] / 18) * 0.38;
        const y = (-animal.position[2] / 18) * 0.22;

        return (
          <group key={animal.id} position={[x, y, 0.08]}>
            <mesh>
              <circleGeometry args={[isFocused ? 0.038 : 0.026, 18]} />
              <meshBasicMaterial color={isFocused ? "#fde68a" : isDiscovered ? "#86efac" : "#d1d5db"} />
            </mesh>
          </group>
        );
      })}

      <Text
        anchorX="center"
        anchorY="middle"
        color="#c7f9d4"
        fontSize={0.05}
        maxWidth={1}
        position={[0, -0.34, 0.05]}
      >
        Sariq nuqta: siz. Oq/yashil nuqtalar: animal zones.
      </Text>
    </group>
  );
}
