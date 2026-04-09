import { RoundedBox, Text } from "@react-three/drei";
import type { ZooAnimal } from "../types";

type DiscoveryJournalProps = {
  animals: ZooAnimal[];
  discoveredIds: string[];
};

export default function DiscoveryJournal({
  animals,
  discoveredIds,
}: DiscoveryJournalProps) {
  return (
    <group position={[-0.95, 0.1, -1.55]}>
      <RoundedBox args={[0.9, 1.26, 0.08]} radius={0.08} smoothness={6}>
        <meshStandardMaterial color="#102219" opacity={0.88} transparent roughness={0.55} />
      </RoundedBox>

      <Text
        anchorX="center"
        anchorY="middle"
        color="#fef3c7"
        fontSize={0.08}
        position={[0, 0.48, 0.05]}
      >
        DISCOVERY JOURNAL
      </Text>

      <Text
        anchorX="center"
        anchorY="middle"
        color="#d6ffe0"
        fontSize={0.16}
        position={[0, 0.3, 0.05]}
      >
        {discoveredIds.length}/{animals.length}
      </Text>

      {animals.map((animal, index) => {
        const discovered = discoveredIds.includes(animal.id);
        return (
          <Text
            key={animal.id}
            anchorX="left"
            anchorY="middle"
            color={discovered ? "#f4f7f4" : "#6b8a73"}
            fontSize={0.072}
            maxWidth={0.72}
            position={[-0.31, 0.08 - index * 0.16, 0.05]}
          >
            {discovered ? "•" : "○"} {animal.name}
          </Text>
        );
      })}
    </group>
  );
}
