interface OrbitRingProps {
  radius: number
  color: string
  highlighted?: boolean
  faded?: boolean
}

export function OrbitRing({
  radius,
  color,
  highlighted = false,
  faded = false,
}: OrbitRingProps) {
  const width = highlighted ? 0.14 : faded ? 0.06 : 0.08

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius - width, radius + width, 160]} />
        <meshBasicMaterial
          color={color}
          opacity={highlighted ? 0.34 : faded ? 0.06 : 0.12}
          transparent
        />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[radius - width * 0.4, radius + width * 0.4, 160]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={highlighted ? 0.08 : 0.018}
          transparent
        />
      </mesh>
    </group>
  )
}
