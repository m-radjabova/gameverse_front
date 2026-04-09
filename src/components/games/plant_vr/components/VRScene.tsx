import { Environment, Float, OrbitControls, Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import type { Group } from "three";
import { XR, createXRStore } from "@react-three/xr";
import FloatingPanel from "./FloatingPanel";
import MissionBoard from "./MissionBoard";
import Plant from "./Plant";
import Pot from "./Pot";
import Seed from "./Seed";
import SoilBag from "./SoilBag";
import StatsBoard from "./StatsBoard";
import SunOrb from "./SunOrb";
import WateringCan from "./WateringCan";
import type { FeedbackMessage, Mission, PlantStage, PlantStats } from "../types";

export const plantVrStore = createXRStore({
  emulate: false,
  offerSession: false,
});

type SceneContentProps = {
  feedback: FeedbackMessage;
  missions: Array<Mission & { active?: boolean; completed?: boolean }>;
  onPotActivate: () => void;
  onSelectTool: (tool: "seed" | "water" | "sunlight" | "soil") => void;
  recentEffectType: "seed" | "water" | "sunlight" | "soil" | null;
  seedPlanted: boolean;
  selectedTool: "seed" | "water" | "sunlight" | "soil" | null;
  stage: PlantStage;
  stats: PlantStats;
};

function SceneContent({
  feedback,
  missions,
  onPotActivate,
  onSelectTool,
  recentEffectType,
  seedPlanted,
  selectedTool,
  stage,
  stats,
}: SceneContentProps) {
  const workspaceRef = useRef<Group>(null);
  const isHealthy = stats.health >= 72;
  const pedestalColor = (tool: "seed" | "water" | "sunlight" | "soil") =>
    selectedTool === tool
      ? tool === "seed"
        ? "#f2dc90"
        : tool === "water"
          ? "#9bdcff"
          : tool === "sunlight"
            ? "#ffe486"
            : "#be8d5c"
      : "#e8ddc7";
  useFrame((state) => {
    if (!workspaceRef.current) {
      return;
    }

    workspaceRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.015;
  });

  const feedbackAccent = useMemo(() => {
    switch (feedback.tone) {
      case "warning":
        return "#ffb56a";
      case "mission":
        return "#a7f39d";
      case "success":
        return "#8ddbff";
      default:
        return "#d7e8a2";
    }
  }, [feedback.tone]);

  return (
    <XR store={plantVrStore}>
      <color attach="background" args={["#d8efe4"]} />
      <fog attach="fog" args={["#d8efe4", 5.5, 12]} />
      <ambientLight intensity={1.15} />
      <directionalLight
        castShadow
        intensity={1.65}
        position={[4, 5.2, 3]}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <directionalLight intensity={0.7} position={[-3, 2, -2]} color="#ffe1a8" />
      <spotLight
        angle={0.48}
        castShadow
        color="#fef6d7"
        intensity={10}
        penumbra={0.7}
        position={[0, 4.4, 1.8]}
        target-position={[0, 1.1, 0]}
      />

      <group ref={workspaceRef}>
        <mesh position={[0, 0.7, 0]} receiveShadow>
          <boxGeometry args={[2.65, 0.14, 1.7]} />
          <meshStandardMaterial color="#d5b38f" roughness={0.82} />
        </mesh>

        <mesh position={[0, 0.62, 0.72]} receiveShadow>
          <boxGeometry args={[2.65, 0.18, 0.08]} />
          <meshStandardMaterial color="#d9c39e" roughness={0.88} />
        </mesh>

        <mesh position={[0, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.5, 64]} />
          <meshStandardMaterial color="#cfe8dc" />
        </mesh>

        <mesh position={[0, 2.2, -2.55]}>
          <planeGeometry args={[7.8, 4.7]} />
          <meshStandardMaterial color="#edf8f3" />
        </mesh>

        <mesh position={[-2.45, 2.05, -2.45]} rotation={[0, 0.18, 0]}>
          <planeGeometry args={[1.6, 4.3]} />
          <meshStandardMaterial color="#c8ead8" opacity={0.65} transparent />
        </mesh>

        <mesh position={[2.45, 2.05, -2.45]} rotation={[0, -0.18, 0]}>
          <planeGeometry args={[1.6, 4.3]} />
          <meshStandardMaterial color="#c8ead8" opacity={0.65} transparent />
        </mesh>

        <Float floatIntensity={0.08} speed={1.5}>
          <group position={[0, 2.65, -1.25]}>
            <mesh>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial
                color="#fff1ab"
                emissive="#ffe98a"
                emissiveIntensity={0.8}
                toneMapped={false}
              />
            </mesh>
            <Sparkles color="#fff3b5" count={18} scale={[0.7, 0.4, 0.7]} size={3} />
          </group>
        </Float>

        <mesh position={[-0.78, 0.79, 0.12]} receiveShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 28]} />
          <meshStandardMaterial
            color={pedestalColor("seed")}
            emissive={selectedTool === "seed" ? "#f4d972" : "#000000"}
            emissiveIntensity={selectedTool === "seed" ? 0.22 : 0}
            roughness={0.95}
          />
        </mesh>
        <mesh position={[-0.38, 0.79, 0.38]} receiveShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 28]} />
          <meshStandardMaterial
            color={pedestalColor("water")}
            emissive={selectedTool === "water" ? "#82d8ff" : "#000000"}
            emissiveIntensity={selectedTool === "water" ? 0.22 : 0}
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0.42, 0.79, 0.3]} receiveShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 28]} />
          <meshStandardMaterial
            color={pedestalColor("sunlight")}
            emissive={selectedTool === "sunlight" ? "#ffe486" : "#000000"}
            emissiveIntensity={selectedTool === "sunlight" ? 0.24 : 0}
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0.84, 0.79, 0.04]} receiveShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 28]} />
          <meshStandardMaterial
            color={pedestalColor("soil")}
            emissive={selectedTool === "soil" ? "#c49366" : "#000000"}
            emissiveIntensity={selectedTool === "soil" ? 0.2 : 0}
            roughness={0.95}
          />
        </mesh>

        <Pot
          effectType={recentEffectType}
          onActivate={onPotActivate}
          seedPlanted={seedPlanted}
          selectedTool={selectedTool}
        />
        <Plant planted={seedPlanted} stage={stage} stats={stats} />
        <Seed
          planted={seedPlanted}
          selected={selectedTool === "seed"}
          onActivate={() => onSelectTool("seed")}
        />
        <WateringCan
          selected={selectedTool === "water"}
          onActivate={() => onSelectTool("water")}
        />
        <SunOrb
          selected={selectedTool === "sunlight"}
          onActivate={() => onSelectTool("sunlight")}
        />
        <SoilBag
          selected={selectedTool === "soil"}
          onActivate={() => onSelectTool("soil")}
        />

        <MissionBoard missions={missions} />
        <StatsBoard stage={stage} stats={stats} />

        <FloatingPanel
          accent={feedbackAccent}
          header="TUSHUNTIRISH"
          height={1.02}
          position={[0, 1.94, -1.04]}
          title={feedback.title}
          titleFontSize={0.068}
          width={2.06}
        >
          <Text
            anchorX="center"
            anchorY="middle"
            color="#f2fff6"
            fontSize={0.056}
            lineHeight={1.22}
            maxWidth={1.66}
            position={[0, -0.17, 0]}
            textAlign="center"
          >
            {feedback.body}
          </Text>
        </FloatingPanel>

        <Sparkles
          count={isHealthy ? 24 : 10}
          position={[0, 1.6, 0]}
          scale={[1.8, 1.3, 1.8]}
          size={4}
          color={isHealthy ? "#fbffd6" : "#ffd4ab"}
        />
      </group>

      <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={4.6}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.35}
        minPolarAngle={Math.PI / 3.7}
        target={[0, 1.18, 0]}
      />
      <Environment preset="park" />
    </XR>
  );
}

export default memo(SceneContent);
