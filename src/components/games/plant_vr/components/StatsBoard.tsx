import { Text } from "@react-three/drei";
import FloatingPanel from "./FloatingPanel";
import type { PlantStage, PlantStats } from "../types";

type StatsBoardProps = {
  stage: PlantStage;
  stats: PlantStats;
};

const statColors = {
  growthProgress: "#9ce6b7",
  health: "#ffb86e",
  soilQuality: "#d2a97a",
  sunlightLevel: "#ffe08a",
  waterLevel: "#8dd7ff",
};

const stageLabels: Record<PlantStage, string> = {
  seed: "Urug'",
  sprout: "Nihol",
  "young plant": "Yosh O'simlik",
  "mature plant": "Yetilgan O'simlik",
  "flowering plant": "Gullagan O'simlik",
};

export default function StatsBoard({ stage, stats }: StatsBoardProps) {
  const items = [
    { key: "waterLevel", label: "Suv", value: stats.waterLevel },
    { key: "sunlightLevel", label: "Quyosh", value: stats.sunlightLevel },
    { key: "soilQuality", label: "Tuproq", value: stats.soilQuality },
    { key: "health", label: "Sog'liq", value: stats.health },
    { key: "growthProgress", label: "O'sish", value: stats.growthProgress },
  ] as const;

  return (
    <FloatingPanel
      accent="#8fcfff"
      header="KO'RSATKICHLAR"
      height={1.3}
      position={[1.94, 1.48, -1.02]}
      title={stageLabels[stage]}
      titleFontSize={0.062}
      width={1.85}
    >
      {items.map((item, index) => {
        const color = statColors[item.key];
        const width = (item.value / 100) * 0.98;

        return (
          <group key={item.key} position={[-0.52, -0.04 - index * 0.14, 0]}>
            <Text
              anchorX="left"
              anchorY="middle"
              color="#effff7"
              fontSize={0.048}
              position={[0, 0.04, 0]}
            >
              {item.label}
            </Text>
            <Text
              anchorX="right"
              anchorY="middle"
              color="#f7fff9"
              fontSize={0.044}
              position={[1.12, 0.04, 0]}
            >
              {`${Math.round(item.value)}%`}
            </Text>
            <mesh position={[0.46, -0.03, 0]}>
              <boxGeometry args={[0.92, 0.05, 0.02]} />
              <meshStandardMaterial color="#28453d" opacity={1} transparent />
            </mesh>
            <mesh position={[0.01 + Math.min(width, 0.92) / 2, -0.03, 0.01]}>
              <boxGeometry args={[Math.max(Math.min(width, 0.92), 0.025), 0.05, 0.035]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} />
            </mesh>
          </group>
        );
      })}
    </FloatingPanel>
  );
}
