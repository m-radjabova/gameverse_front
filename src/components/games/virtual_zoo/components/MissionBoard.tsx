import { RoundedBox, Text } from "@react-three/drei";
import type { DiscoveryMission } from "../types";

type MissionBoardProps = {
  missions: DiscoveryMission[];
};

export default function MissionBoard({ missions }: MissionBoardProps) {
  return (
    <group position={[0.95, 0.12, -1.55]}>
      <RoundedBox args={[1.02, 1.4, 0.08]} radius={0.08} smoothness={6}>
        <meshStandardMaterial color="#12261a" opacity={0.88} transparent roughness={0.56} />
      </RoundedBox>

      <Text
        anchorX="center"
        anchorY="middle"
        color="#f0fdf4"
        fontSize={0.08}
        position={[0, 0.56, 0.05]}
      >
        MISSIONS
      </Text>

      {missions.map((mission, index) => {
        const progress = Math.min(1, mission.current / mission.target);
        return (
          <group key={mission.id} position={[0, 0.24 - index * 0.42, 0.05]}>
            <Text
              anchorX="left"
              anchorY="middle"
              color={mission.completed ? "#bbf7d0" : "#eff6ff"}
              fontSize={0.074}
              maxWidth={0.78}
              position={[-0.36, 0.1, 0]}
            >
              {mission.completed ? "✓" : "•"} {mission.title}
            </Text>
            <Text
              anchorX="left"
              anchorY="middle"
              color="#93c5aa"
              fontSize={0.055}
              maxWidth={0.8}
              position={[-0.36, -0.03, 0]}
            >
              {mission.description}
            </Text>
            <mesh position={[0, -0.15, 0]}>
              <planeGeometry args={[0.74, 0.06]} />
              <meshBasicMaterial color="#264235" opacity={0.95} transparent />
            </mesh>
            <mesh position={[-0.37 + progress * 0.37, -0.15, 0.01]}>
              <planeGeometry args={[Math.max(progress * 0.74, 0.001), 0.06]} />
              <meshBasicMaterial color={mission.completed ? "#86efac" : "#7dd3fc"} />
            </mesh>
            <Text
              anchorX="right"
              anchorY="middle"
              color="#f8fafc"
              fontSize={0.056}
              position={[0.36, 0.1, 0]}
            >
              {mission.current}/{mission.target}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
