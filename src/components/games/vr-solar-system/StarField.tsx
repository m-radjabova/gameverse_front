import { Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export function StarField() {
  const groupRef = useRef<THREE.Group>(null)
  const { colors, positions } = useMemo(() => buildStarCloud(), [])

  useFrame((state, delta) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    group.rotation.y += delta * 0.004
    group.rotation.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.04
  })

  return (
    <group ref={groupRef}>
      <mesh scale={300}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#01030a" side={THREE.BackSide} />
      </mesh>

      <NebulaShell color="#133260" opacity={0.1} rotation={[0.18, 0.7, 0]} scale={272} />
      <NebulaShell color="#4a1e46" opacity={0.06} rotation={[-0.2, -0.8, 0.18]} scale={252} />
      <NebulaShell color="#3f1d67" opacity={0.035} rotation={[0.4, -0.2, 0.4]} scale={238} />

      <Stars count={4200} depth={200} fade factor={5.8} radius={285} saturation={0} speed={0.24} />

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          depthWrite={false}
          opacity={0.92}
          size={0.4}
          sizeAttenuation
          transparent
          vertexColors
        />
      </points>
    </group>
  )
}

function NebulaShell({
  color,
  opacity,
  rotation,
  scale,
}: {
  color: string
  opacity: number
  rotation: [number, number, number]
  scale: number
}) {
  return (
    <mesh rotation={rotation} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} opacity={opacity} side={THREE.BackSide} transparent />
    </mesh>
  )
}

function buildStarCloud() {
  const total = 2200
  const positions = new Float32Array(total * 3)
  const colors = new Float32Array(total * 3)

  for (let index = 0; index < total; index += 1) {
    const radius = THREE.MathUtils.lerp(135, 280, Math.pow(Math.random(), 0.62))
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))
    const color = new THREE.Color().setHSL(
      0.57 + THREE.MathUtils.randFloatSpread(0.12),
      0.32,
      0.72 + Math.random() * 0.2,
    )

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    positions[index * 3] = x
    positions[index * 3 + 1] = y
    positions[index * 3 + 2] = z
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }

  return { colors, positions }
}
