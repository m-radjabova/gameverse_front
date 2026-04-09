import { Text } from "@react-three/drei";
import FloatingPanel from "./FloatingPanel";
import type { Mission } from "../types";

type MissionBoardProps = {
  missions: Array<Mission & { active?: boolean; completed?: boolean }>;
};

export default function MissionBoard({ missions }: MissionBoardProps) {
  return (
    <FloatingPanel
      accent="#f1d886"
      header="VAZIFALAR"
      height={1.44}
      position={[-2.02, 1.48, -1.02]}
      title="O'sish Bosqichlari"
      titleFontSize={0.07}
      width={1.88}
    >
      {missions.slice(0, 5).map((mission, index) => {
        const color = mission.completed
          ? "#9fe8b8"
          : mission.active
            ? "#fff0bd"
            : "#7f9b90";

        const prefix = mission.completed ? "DONE" : mission.active ? "NOW" : "UP";

        return (
          <group key={mission.id} position={[0, -0.02 - index * 0.16, 0]}>
            <mesh position={[-0.74, 0.01, 0]}>
              <boxGeometry args={[0.13, 0.07, 0.02]} />
              <meshStandardMaterial
                color={mission.completed ? "#3b7a55" : mission.active ? "#8f7440" : "#344741"}
                emissive={mission.completed ? "#3b7a55" : mission.active ? "#8f7440" : "#344741"}
                emissiveIntensity={0.12}
              />
            </mesh>
            <Text
              anchorX="center"
              anchorY="middle"
              color="#f7fff9"
              fontSize={0.033}
              position={[-0.74, 0.012, 0.02]}
            >
              {prefix}
            </Text>
            <Text
              anchorX="left"
              anchorY="middle"
              color={color}
              fontSize={0.05}
              lineHeight={1.3}
              maxWidth={1.28}
              position={[-0.64, 0.01, 0.02]}
            >
              {mission.title}
            </Text>
          </group>
        );
      })}
    </FloatingPanel>
  );
}
