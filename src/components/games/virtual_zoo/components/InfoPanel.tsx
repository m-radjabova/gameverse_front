import { Billboard, Float, RoundedBox, Text } from "@react-three/drei";
import type { ZooAnimal } from "../types";

type InfoPanelProps = {
  animal: ZooAnimal | null;
  statusText?: string | null;
};

const infoRows = [
  { key: "food", label: "Oziqasi" },
  { key: "habitat", label: "Yashash joyi" },
  { key: "behavior", label: "Xulqi" },
  { key: "fact", label: "Qiziqarli fakt" },
] as const;

export default function InfoPanel({ animal, statusText }: InfoPanelProps) {
  const position: [number, number, number] = animal
    ? [animal.position[0], animal.id === "giraffe" ? 3.35 : 2.85, animal.position[2]]
    : [0, 3, 14.5];
  const panelHeight = animal ? 2.95 : 1.95;
  const headerY = animal ? 1.1 : 0.78;
  const bodyTopY = animal ? 0.55 : 0.18;

  return (
    <Billboard follow lockX={false} lockY={false} position={position}>
      <Float floatIntensity={0.08} rotationIntensity={0.04} speed={1.4}>
        <group>
          <RoundedBox args={[3.74, panelHeight + 0.1, 0.08]} radius={0.22} smoothness={8}>
            <meshStandardMaterial color="#0a1616" opacity={0.5} transparent roughness={0.35} />
          </RoundedBox>

          <RoundedBox args={[3.58, panelHeight, 0.12]} position={[0, 0, 0.03]} radius={0.18} smoothness={8}>
            <meshStandardMaterial color="#081311" opacity={0.93} transparent roughness={0.46} metalness={0.08} />
          </RoundedBox>

          <mesh position={[0, 0.16, 0.1]}>
            <planeGeometry args={[3.3, panelHeight - 0.28]} />
            <meshBasicMaterial color="#10231f" opacity={0.3} transparent />
          </mesh>

          <mesh position={[0, headerY, 0.11]}>
            <planeGeometry args={[3.22, 0.42]} />
            <meshBasicMaterial color={animal?.accent ?? "#7dd3fc"} opacity={0.96} transparent />
          </mesh>

          <Text
            anchorX="center"
            anchorY="middle"
            color="#fffdf7"
            fontSize={0.2}
            maxWidth={3}
            position={[0, headerY, 0.14]}
          >
            {animal ? animal.name : "Virtual Zoo Explorer VR"}
          </Text>

          {statusText ? (
            <group position={[0, animal ? 0.78 : 0.5, 0.12]}>
              <RoundedBox args={[1.28, 0.18, 0.04]} radius={0.08} smoothness={6}>
                <meshStandardMaterial color="#173126" opacity={0.92} transparent roughness={0.42} />
              </RoundedBox>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#dff8bf"
                fontSize={0.075}
                maxWidth={1.1}
                position={[0, 0, 0.04]}
              >
                {statusText}
              </Text>
            </group>
          ) : null}

          {animal ? (
            <>
              {infoRows.map((row, index) => (
                <group key={row.key} position={[0, bodyTopY - index * 0.58, 0.12]}>
                  <RoundedBox args={[3.02, 0.42, 0.035]} radius={0.12} smoothness={6}>
                    <meshStandardMaterial color="#102420" opacity={0.86} transparent roughness={0.5} />
                  </RoundedBox>

                  <mesh position={[-1.12, 0, 0.025]}>
                    <circleGeometry args={[0.075, 24]} />
                    <meshBasicMaterial color={animal.accent} opacity={0.95} transparent />
                  </mesh>

                  <Text
                    anchorX="left"
                    anchorY="middle"
                    color="#eff8de"
                    fontSize={0.09}
                    maxWidth={0.72}
                    position={[-1, 0, 0.04]}
                  >
                    {row.label}
                  </Text>
                  <Text
                    anchorX="left"
                    anchorY="middle"
                    color="#ffffff"
                    fontSize={0.086}
                    lineHeight={1.28}
                    maxWidth={1.78}
                    position={[-0.14, 0, 0.04]}
                  >
                    {animal[row.key]}
                  </Text>
                </group>
              ))}
            </>
          ) : (
            <>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#f3fbf5"
                fontSize={0.12}
                lineHeight={1.25}
                maxWidth={2.7}
                position={[0, 0.2, 0.12]}
                textAlign="center"
              >
                Hayvonlarga yaqinlashing yoki controller ray bilan tanlang.
              </Text>
              <RoundedBox args={[2.7, 0.52, 0.03]} position={[0, 0.18, 0.08]} radius={0.14} smoothness={6}>
                <meshStandardMaterial color="#10241f" opacity={0.8} transparent roughness={0.52} />
              </RoundedBox>
              <Text
                anchorX="center"
                anchorY="middle"
                color="#d8f0dd"
                fontSize={0.096}
                lineHeight={1.25}
                maxWidth={2.55}
                position={[0, -0.48, 0.12]}
                textAlign="center"
              >
                Maqsad: barcha hayvonlarni toping va ularning hayoti haqida bilib oling.
              </Text>
              <RoundedBox args={[2.9, 0.58, 0.03]} position={[0, -0.48, 0.08]} radius={0.14} smoothness={6}>
                <meshStandardMaterial color="#0d1d19" opacity={0.76} transparent roughness={0.52} />
              </RoundedBox>
            </>
          )}
        </group>
      </Float>
    </Billboard>
  );
}
