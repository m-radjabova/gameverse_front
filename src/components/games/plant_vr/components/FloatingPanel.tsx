import { Billboard, Float, RoundedBox, Text } from "@react-three/drei";
import type { PropsWithChildren, ReactNode } from "react";
import type { Vector3Tuple } from "three";

type FloatingPanelProps = PropsWithChildren<{
  accent?: string;
  footer?: ReactNode;
  header?: string;
  height?: number;
  position: Vector3Tuple;
  subtitle?: string;
  title: string;
  titleFontSize?: number;
  width?: number;
}>;

export default function FloatingPanel({
  accent = "#8bcf9d",
  children,
  footer,
  header,
  height = 1.15,
  position,
  subtitle,
  title,
  titleFontSize = 0.1,
  width = 1.7,
}: FloatingPanelProps) {
  return (
    <Billboard position={position}>
      <Float floatIntensity={0.16} rotationIntensity={0.025} speed={1.1}>
        <group>
          <RoundedBox args={[width, height, 0.045]} radius={0.09} smoothness={8}>
            <meshStandardMaterial
              color="#112821"
              emissive="#091510"
              emissiveIntensity={0.18}
              metalness={0.08}
              opacity={0.98}
              roughness={0.22}
              transparent
            />
          </RoundedBox>
          <RoundedBox
            args={[width - 0.04, height - 0.06, 0.03]}
            position={[0, 0, 0.015]}
            radius={0.075}
            smoothness={6}
          >
            <meshStandardMaterial
              color="#1d3a31"
              emissive="#12231d"
              emissiveIntensity={0.12}
              opacity={0.9}
              roughness={0.38}
              transparent
            />
          </RoundedBox>

          <RoundedBox
            args={[width - 0.16, 0.07, 0.05]}
            position={[0, height / 2 - 0.12, 0.03]}
            radius={0.04}
          >
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.34}
              opacity={0.95}
              transparent
            />
          </RoundedBox>

          {header && (
            <Text
              anchorX="center"
              anchorY="middle"
              color="#f1fff6"
              fontSize={0.048}
              letterSpacing={0.06}
              maxWidth={width - 0.18}
              position={[0, height / 2 - 0.24, 0.05]}
            >
              {header}
            </Text>
          )}

          <Text
            anchorX="center"
            anchorY="middle"
            color="#ffffff"
            fontSize={titleFontSize}
            maxWidth={width - 0.18}
            position={[0, height / 2 - 0.39, 0.05]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              anchorX="center"
              anchorY="middle"
              color="#d8eee4"
              fontSize={0.045}
              lineHeight={1.3}
              maxWidth={width - 0.24}
              position={[0, height / 2 - 0.54, 0.05]}
              textAlign="center"
            >
              {subtitle}
            </Text>
          ) : null}

          <group position={[0, 0, 0.05]}>{children}</group>

          {footer ? <group position={[0, -height / 2 + 0.16, 0.05]}>{footer}</group> : null}
        </group>
      </Float>
    </Billboard>
  );
}
