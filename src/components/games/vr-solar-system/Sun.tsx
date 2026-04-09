import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export function Sun() {
  const coreRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const flareRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createSunTexture(), [])

  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  useFrame((state, delta) => {
    const core = coreRef.current
    const corona = coronaRef.current
    const halo = haloRef.current

    const flare = flareRef.current

    if (!core || !corona || !halo || !flare) {
      return
    }

    core.rotation.y += delta * 0.08
    corona.rotation.y -= delta * 0.03
    halo.rotation.z += delta * 0.02
    flare.rotation.z -= delta * 0.012

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.9) * 0.04
    corona.scale.setScalar(1.18 * pulse)
    flare.scale.setScalar(1.28 * pulse)
  })

  return (
    <group>
      <pointLight color="#ffe0a3" distance={340} intensity={320} position={[0, 0, 0]} />
      <pointLight color="#ff962e" distance={200} intensity={160} position={[0, 0, 0]} />

      <mesh ref={coreRef}>
        <sphereGeometry args={[4.8, 72, 72]} />
        <meshStandardMaterial
          emissive="#ff9e34"
          emissiveIntensity={3.1}
          map={texture}
          roughness={0.62}
        />
      </mesh>

      <mesh ref={coronaRef} scale={1.18}>
        <sphereGeometry args={[5.4, 48, 48]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#ffbb55"
          opacity={0.34}
          transparent
        />
      </mesh>

      <mesh ref={flareRef} rotation={[Math.PI / 2, 0.2, 0]}>
        <ringGeometry args={[6.1, 8.2, 96]} />
        <meshBasicMaterial
          color="#ffd38c"
          opacity={0.24}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.8, 0.2, 24, 120]} />
        <meshBasicMaterial color="#ffcf87" opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

function createSunTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512

  const context = canvas.getContext('2d')

  if (!context) {
    const fallback = new THREE.CanvasTexture(canvas)
    fallback.colorSpace = THREE.SRGBColorSpace
    return fallback
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#8f2c00')
  gradient.addColorStop(0.35, '#ff8f1f')
  gradient.addColorStop(0.7, '#ffd26b')
  gradient.addColorStop(1, '#a73700')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  const random = createSeededRandom(8924)

  for (let index = 0; index < 160; index += 1) {
    const y = random() * canvas.height
    const bandHeight = 8 + random() * 22
    const alpha = 0.06 + random() * 0.08
    context.fillStyle = `rgba(255, ${150 + Math.floor(random() * 70)}, ${30 + Math.floor(
      random() * 45,
    )}, ${alpha})`
    context.fillRect(0, y, canvas.width, bandHeight)
  }

  for (let index = 0; index < 260; index += 1) {
    const radius = 22 + random() * 110
    const x = random() * canvas.width
    const y = random() * canvas.height
    const flare = context.createRadialGradient(x, y, radius * 0.2, x, y, radius)
    flare.addColorStop(0, `rgba(255, 246, 194, ${0.18 + random() * 0.16})`)
    flare.addColorStop(0.45, `rgba(255, 169, 54, ${0.09 + random() * 0.08})`)
    flare.addColorStop(1, 'rgba(255, 85, 0, 0)')
    context.fillStyle = flare
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const rimGlow = context.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.height * 0.12,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.height * 0.48,
  )
  rimGlow.addColorStop(0, 'rgba(255,255,220,0)')
  rimGlow.addColorStop(0.72, 'rgba(255,199,102,0)')
  rimGlow.addColorStop(1, 'rgba(120,28,0,0.38)')
  context.fillStyle = rimGlow
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
