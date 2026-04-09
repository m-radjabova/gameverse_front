import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { SolarSystemPlanet } from './data'

interface PlanetProps {
  planet: SolarSystemPlanet
  overviewMode: boolean
  selected: boolean
  showLabel: boolean
  visited: boolean
  onPositionChange: (planetId: string, position: THREE.Vector3) => void
  onSelect: (planetId: string) => void
}

export function Planet({
  planet,
  overviewMode,
  selected,
  showLabel,
  visited,
  onPositionChange,
  onSelect,
}: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null)
  const planetGroupRef = useRef<THREE.Group>(null)
  const surfaceRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const orbitAngleRef = useRef(planet.initialAngle)
  const worldPosition = useMemo(() => new THREE.Vector3(), [])
  const [hovered, setHovered] = useState(false)

  const planetMaps = useMemo(() => createPlanetMaps(planet), [planet])
  const cloudTexture = useMemo(
    () => (planet.visual.cloudColor ? createCloudTexture(planet.id, planet.visual.cloudColor) : null),
    [planet.id, planet.visual.cloudColor],
  )
  const ringTexture = useMemo(
    () => (planet.ring ? createRingTexture(planet.id, planet.ring.color) : null),
    [planet.id, planet.ring],
  )

  useEffect(() => {
    return () => {
      planetMaps.map.dispose()
      planetMaps.bumpMap.dispose()
      planetMaps.emissiveMap.dispose()
      planetMaps.roughnessMap.dispose()
      cloudTexture?.dispose()
      ringTexture?.dispose()
    }
  }, [cloudTexture, planetMaps, ringTexture])

  useFrame((state, delta) => {
    const orbit = orbitRef.current
    const planetGroup = planetGroupRef.current
    const surface = surfaceRef.current

    if (!orbit || !planetGroup || !surface) {
      return
    }

    if (!(selected && !overviewMode)) {
      orbitAngleRef.current += planet.orbitSpeed * delta
    }

    orbit.rotation.y = orbitAngleRef.current
    planetGroup.rotation.z = planet.tilt
    surface.rotation.y += planet.rotationSpeed * delta

    if (cloudRef.current) {
      cloudRef.current.rotation.y += planet.rotationSpeed * delta * 1.16
    }

    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.03 : hovered ? 1.025 : 1
    surface.scale.setScalar(pulse)

    planetGroup.getWorldPosition(worldPosition)
    onPositionChange(planet.id, worldPosition)
  })

  const atmosphereOpacity = selected ? 0.28 : hovered ? 0.18 : 0.12
  const haloOpacity = selected ? 0.34 : hovered ? 0.18 : visited ? 0.08 : 0
  const isSelectedOrHovered = selected || hovered
  const labelHeight = planet.radiusScale + (planet.ring ? planet.ring.outerRadius * 0.48 : 1.8)
  const materialSettings = getPlanetMaterialSettings(planet, isSelectedOrHovered)

  return (
    <group ref={orbitRef}>
      <group ref={planetGroupRef} position={[planet.orbitRadius, 0, 0]}>
        <mesh
          ref={surfaceRef}
          castShadow
          onClick={(event) => {
            event.stopPropagation()
            onSelect(planet.id)
          }}
          onPointerOut={() => setHovered(false)}
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          receiveShadow
        >
          <sphereGeometry args={[planet.radiusScale, 64, 64]} />
          <meshPhysicalMaterial
            bumpMap={planetMaps.bumpMap}
            emissiveMap={planet.id === 'earth' ? planetMaps.emissiveMap : null}
            map={planetMaps.map}
            roughnessMap={planetMaps.roughnessMap}
            {...materialSettings}
          />
        </mesh>

        <mesh
          onClick={(event) => {
            event.stopPropagation()
            onSelect(planet.id)
          }}
        >
          <sphereGeometry args={[planet.radiusScale * 1.22, 28, 28]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>

        {planet.visual.atmosphereColor ? (
          <>
            <mesh scale={planet.id === 'venus' ? 1.06 : 1.09}>
              <sphereGeometry args={[planet.radiusScale, 40, 40]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={planet.visual.atmosphereColor}
                depthWrite={false}
                opacity={planet.id === 'earth' ? atmosphereOpacity * 0.92 : atmosphereOpacity * 0.7}
                transparent
              />
            </mesh>
            <mesh scale={planet.id === 'venus' ? 1.12 : 1.16}>
              <sphereGeometry args={[planet.radiusScale, 40, 40]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={planet.visual.atmosphereColor}
                depthWrite={false}
                opacity={planet.id === 'earth' ? 0.04 : 0.025}
                side={THREE.BackSide}
                transparent
              />
            </mesh>
          </>
        ) : null}

        {cloudTexture && (
          <mesh ref={cloudRef} scale={1.025}>
            <sphereGeometry args={[planet.radiusScale, 48, 48]} />
            <meshStandardMaterial
              depthWrite={false}
              map={cloudTexture}
              opacity={planet.id === 'venus' ? 0.9 : planet.id === 'earth' ? 0.68 : 0.56}
              roughness={0.96}
              transparent
            />
          </mesh>
        )}

        {planet.ring && ringTexture && (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius, planet.ring.outerRadius, 180]} />
              <meshStandardMaterial
                alphaMap={ringTexture}
                color={planet.ring.color}
                map={ringTexture}
                metalness={0.16}
                opacity={planet.ring.opacity}
                roughness={0.72}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
            <mesh rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius * 1.015, planet.ring.outerRadius * 0.995, 180]} />
              <meshBasicMaterial
                alphaMap={ringTexture}
                color="#fff5dc"
                opacity={0.06}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
            <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius * 1.01, planet.ring.outerRadius * 0.98, 180]} />
              <meshBasicMaterial
                color="#140d06"
                opacity={selected ? 0.18 : 0.1}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
          </group>
        )}

        {planet.moons?.map((moon) => (
          <MoonObject key={moon.id} moon={moon} />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radiusScale * 1.44, planet.radiusScale * 1.62, 72]} />
          <meshBasicMaterial color={planet.visual.accentColor} opacity={haloOpacity} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radiusScale * 1.62, planet.radiusScale * 1.82, 72]} />
          <meshBasicMaterial color="#ffffff" opacity={haloOpacity * 0.08} transparent />
        </mesh>

        {showLabel ? (
          <Billboard position={[0, labelHeight, 0]}>
            <group>
              <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[planet.nameUz.length * 0.22 + 1.5, 0.6]} />
                <meshBasicMaterial
                  color={visited ? '#0f172a' : '#020617'}
                  opacity={selected ? 0.86 : hovered ? 0.68 : 0.54}
                  transparent
                />
              </mesh>
              <Text
                anchorX="center"
                anchorY="middle"
                color={selected ? '#fef3c7' : visited ? '#a7f3d0' : '#e2e8f0'}
                fontSize={0.34}
                maxWidth={5}
                outlineColor="#000000"
                outlineWidth={0.035}
              >
                {planet.nameUz}
              </Text>
            </group>
          </Billboard>
        ) : null}
      </group>
    </group>
  )
}

function MoonObject({
  moon,
}: {
  moon: NonNullable<SolarSystemPlanet['moons']>[number]
}) {
  const pivotRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)

  useFrame((_, delta) => {
    const pivot = pivotRef.current

    if (!pivot) {
      return
    }

    angleRef.current += moon.orbitSpeed * delta
    pivot.rotation.y = angleRef.current
  })

  return (
    <group ref={pivotRef}>
      <mesh castShadow position={[moon.orbitRadius, 0, 0]} receiveShadow>
        <sphereGeometry args={[moon.size, 28, 28]} />
        <meshStandardMaterial
          color={moon.color}
          emissive="#9ca9c8"
          emissiveIntensity={0.12}
          roughness={0.82}
        />
      </mesh>
    </group>
  )
}

function getPlanetMaterialSettings(planet: SolarSystemPlanet, isSelectedOrHovered: boolean) {
  switch (planet.id) {
    case 'earth':
      return {
        bumpScale: 0.14,
        clearcoat: 0.46,
        clearcoatRoughness: 0.24,
        emissive: planet.visual.emissiveColor ?? '#0d3158',
        emissiveIntensity: isSelectedOrHovered ? 0.06 : 0.035,
        ior: 1.42,
        metalness: 0.01,
        reflectivity: 0.26,
        roughness: 0.78,
        sheen: 0.08,
        sheenRoughness: 0.52,
      }
    case 'jupiter':
      return {
        bumpScale: 0.02,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
        emissive: planet.visual.emissiveColor ?? '#59321e',
        emissiveIntensity: isSelectedOrHovered ? 0.025 : 0.012,
        ior: 1.18,
        metalness: 0.01,
        reflectivity: 0.08,
        roughness: 0.95,
        sheen: 0.05,
        sheenRoughness: 0.9,
      }
    case 'saturn':
      return {
        bumpScale: 0.014,
        clearcoat: 0.04,
        clearcoatRoughness: 0.84,
        emissive: planet.visual.emissiveColor ?? '#5a4531',
        emissiveIntensity: isSelectedOrHovered ? 0.015 : 0.008,
        ior: 1.16,
        metalness: 0.01,
        reflectivity: 0.06,
        roughness: 0.97,
        sheen: 0.03,
        sheenRoughness: 0.94,
      }
    case 'uranus':
    case 'neptune':
      return {
        bumpScale: 0.04,
        clearcoat: 0.08,
        clearcoatRoughness: 0.6,
        emissive: planet.visual.emissiveColor ?? '#16395a',
        emissiveIntensity: isSelectedOrHovered ? 0.03 : 0.015,
        ior: 1.24,
        metalness: 0.01,
        reflectivity: 0.1,
        roughness: 0.88,
        sheen: 0.08,
        sheenRoughness: 0.72,
      }
    case 'venus':
      return {
        bumpScale: 0.035,
        clearcoat: 0.1,
        clearcoatRoughness: 0.7,
        emissive: planet.visual.emissiveColor ?? '#6b4420',
        emissiveIntensity: isSelectedOrHovered ? 0.025 : 0.012,
        ior: 1.26,
        metalness: 0.01,
        reflectivity: 0.1,
        roughness: 0.94,
        sheen: 0.04,
        sheenRoughness: 0.74,
      }
    default:
      return {
        bumpScale: planet.type === 'rocky' ? 0.15 : 0.06,
        clearcoat: planet.type === 'rocky' ? 0.12 : 0.16,
        clearcoatRoughness: planet.type === 'rocky' ? 0.52 : 0.58,
        emissive: planet.visual.emissiveColor ?? '#101010',
        emissiveIntensity: isSelectedOrHovered ? 0.14 : 0.07,
        ior: 1.2,
        metalness: 0.01,
        reflectivity: 0.16,
        roughness: planet.type === 'rocky' ? 0.88 : 0.82,
        sheen: planet.type === 'gas-giant' ? 0.22 : 0.04,
        sheenRoughness: 0.72,
      }
  }
}

function createPlanetMaps(planet: SolarSystemPlanet) {
  const canvas = document.createElement('canvas')
  const bumpCanvas = document.createElement('canvas')
  const emissiveCanvas = document.createElement('canvas')
  const roughnessCanvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 768
  bumpCanvas.width = 1536
  bumpCanvas.height = 768
  emissiveCanvas.width = 1536
  emissiveCanvas.height = 768
  roughnessCanvas.width = 1536
  roughnessCanvas.height = 768

  const context = canvas.getContext('2d')
  const bumpContext = bumpCanvas.getContext('2d')
  const emissiveContext = emissiveCanvas.getContext('2d')
  const roughnessContext = roughnessCanvas.getContext('2d')

  if (!context || !bumpContext || !emissiveContext || !roughnessContext) {
    const fallback = new THREE.CanvasTexture(canvas)
    fallback.colorSpace = THREE.SRGBColorSpace
    const bumpFallback = new THREE.CanvasTexture(bumpCanvas)
    const emissiveFallback = new THREE.CanvasTexture(emissiveCanvas)
    const roughnessFallback = new THREE.CanvasTexture(roughnessCanvas)
    return {
      map: fallback,
      bumpMap: bumpFallback,
      emissiveMap: emissiveFallback,
      roughnessMap: roughnessFallback,
    }
  }

  const random = createSeededRandom(hashString(planet.id))
  const { surfaceColors } = planet.visual
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)

  surfaceColors.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(surfaceColors.length - 1, 1), color)
  })

  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  fillSolid(bumpContext, '#6f6f6f')
  fillSolid(emissiveContext, '#000000')
  fillSolid(roughnessContext, planet.id === 'earth' ? '#676767' : '#b0b0b0')
  paintLatitudeLighting(context, planet.id === 'earth' ? 0.08 : 0.12)

  switch (planet.visual.textureVariant) {
    case 'earth':
      paintBands(context, random, surfaceColors, 22, 0.14)
      paintContinents(context, random)
      paintOceanDepth(context, random)
      paintEarthCurrents(context, random)
      paintSoftBlobs(context, random, '#7cc7ff', 96, 0.05)
      paintPolarCaps(context)
      paintEarthRelief(bumpContext, roughnessContext, random)
      paintCityLights(emissiveContext, random, '#ffd37a')
      paintAuroraBands(emissiveContext, random)
      break
    case 'banded':
      if (planet.id === 'jupiter') {
        paintJupiterBands(context, random, surfaceColors)
      } else {
        paintSaturnBands(context, random, surfaceColors)
      }
      paintGasRelief(bumpContext, roughnessContext, random, planet.id === 'jupiter')
      paintGasGlow(emissiveContext, random, planet.id === 'jupiter' ? '#4e2513' : '#56442f', 0.025)
      break
    case 'cloudy':
      paintVenusClouds(context, random, surfaceColors)
      paintVenusRelief(bumpContext, roughnessContext, random)
      paintGasGlow(emissiveContext, random, '#5f3e1d', 0.018)
      break
    case 'dust':
      paintMarsSurface(context, random, surfaceColors)
      paintRockRelief(bumpContext, roughnessContext, random, '#8a8a8a', '#c6c6c6')
      paintGasGlow(emissiveContext, random, '#2f120d', 0.012)
      break
    case 'icy':
      paintUranusSurface(context, random, surfaceColors)
      paintIcyRelief(bumpContext, roughnessContext, random)
      paintGasGlow(emissiveContext, random, '#27565f', 0.015)
      break
    case 'deep':
      paintNeptuneSurface(context, random, surfaceColors)
      paintIcyRelief(bumpContext, roughnessContext, random)
      paintGasGlow(emissiveContext, random, '#142f67', 0.016)
      break
    case 'rocky':
      if (planet.id === 'mercury') {
        paintMercurySurface(context, random)
      } else {
        paintCrateredSurface(context, random)
        paintCanyonStreaks(context, random, '#f0d2ae', 12, 0.08)
      }
      paintRockRelief(bumpContext, roughnessContext, random, '#828282', '#d6d6d6')
      paintGasGlow(emissiveContext, random, '#241b13', 0.008)
      break
    default:
      break
  }

  addVignette(context, canvas.width, canvas.height)
  paintFineNoise(context, random, 240, 0.045)
  softenTextureSeam(context)

  const map = new THREE.CanvasTexture(canvas)
  map.anisotropy = 8
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.ClampToEdgeWrapping

  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  bumpMap.anisotropy = 8
  bumpMap.wrapS = THREE.RepeatWrapping
  bumpMap.wrapT = THREE.ClampToEdgeWrapping

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas)
  emissiveMap.anisotropy = 8
  emissiveMap.colorSpace = THREE.SRGBColorSpace
  emissiveMap.wrapS = THREE.RepeatWrapping
  emissiveMap.wrapT = THREE.ClampToEdgeWrapping

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas)
  roughnessMap.anisotropy = 8
  roughnessMap.wrapS = THREE.RepeatWrapping
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping

  return { map, bumpMap, emissiveMap, roughnessMap }
}

function createCloudTexture(seedLabel: string, cloudColor: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 768

  const context = canvas.getContext('2d')

  if (!context) {
    const fallback = new THREE.CanvasTexture(canvas)
    fallback.colorSpace = THREE.SRGBColorSpace
    return fallback
  }

  const random = createSeededRandom(hashString(`${seedLabel}-clouds`))
  const bandCount = seedLabel === 'venus' ? 42 : seedLabel === 'earth' ? 18 : 28

  for (let index = 0; index < bandCount; index += 1) {
    const y = (index / bandCount) * canvas.height
    const height = 8 + random() * 24
    const alpha =
      seedLabel === 'venus'
        ? 0.08 + random() * 0.08
        : seedLabel === 'earth'
          ? 0.015 + random() * 0.025
          : 0.03 + random() * 0.05
    context.fillStyle = applyAlpha(cloudColor, alpha)
    context.fillRect(0, y, canvas.width, height)
  }

  const cloudCount = seedLabel === 'earth' ? 170 : 120

  for (let index = 0; index < cloudCount; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const radius = seedLabel === 'earth' ? 12 + random() * 44 : 14 + random() * 60
    const gradient = context.createRadialGradient(x, y, radius * 0.25, x, y, radius)
    gradient.addColorStop(0, seedLabel === 'earth' ? `${cloudColor}e0` : `${cloudColor}cc`)
    gradient.addColorStop(0.6, seedLabel === 'earth' ? `${cloudColor}55` : `${cloudColor}33`)
    gradient.addColorStop(1, `${cloudColor}00`)
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  if (seedLabel === 'earth') {
    for (let index = 0; index < 20; index += 1) {
      const startY = random() * canvas.height
      context.strokeStyle = applyAlpha(cloudColor, 0.12 + random() * 0.06)
      context.lineWidth = 3 + random() * 5
      context.beginPath()

      for (let x = 0; x <= canvas.width; x += 32) {
        const waveY = startY + Math.sin((x / canvas.width) * Math.PI * 4 + index) * (10 + random() * 18)
        if (x === 0) {
          context.moveTo(x, waveY)
        } else {
          context.lineTo(x, waveY)
        }
      }

      context.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function createRingTexture(seedLabel: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 96

  const context = canvas.getContext('2d')

  if (!context) {
    const fallback = new THREE.CanvasTexture(canvas)
    fallback.colorSpace = THREE.SRGBColorSpace
    return fallback
  }

  const random = createSeededRandom(hashString(`${seedLabel}-ring`))
  context.clearRect(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < canvas.width; index += 1) {
    const banding = Math.sin(index * 0.013) * 0.07 + Math.sin(index * 0.045) * 0.04
    const fineBanding = Math.sin(index * 0.11) * 0.015
    const softness = random() * 0.025
    const alpha = 0.16 + banding + fineBanding + softness
    context.fillStyle = applyAlpha(color, THREE.MathUtils.clamp(alpha, 0.06, 0.34))
    context.fillRect(index, 0, 1, canvas.height)
  }

  const sheen = context.createLinearGradient(0, 0, 0, canvas.height)
  sheen.addColorStop(0, 'rgba(255,255,255,0.07)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)')
  sheen.addColorStop(1, 'rgba(255,255,255,0.06)')
  context.fillStyle = sheen
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function paintBands(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
  count: number,
  alpha: number,
) {
  const width = context.canvas.width
  const height = context.canvas.height

  for (let index = 0; index < count; index += 1) {
    const bandHeight = 18 + random() * 42
    const y = random() * height
    const color = colors[index % colors.length]
    context.fillStyle = applyAlpha(color, alpha + random() * 0.08)
    context.fillRect(0, y, width, bandHeight)
  }
}

function paintLatitudeLighting(context: CanvasRenderingContext2D, alpha: number) {
  const width = context.canvas.width
  const height = context.canvas.height
  const gradient = context.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, `rgba(255,255,255,${alpha * 0.65})`)
  gradient.addColorStop(0.18, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.82, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(0,0,0,${alpha})`)
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

function fillSolid(context: CanvasRenderingContext2D, color: string) {
  context.fillStyle = color
  context.fillRect(0, 0, context.canvas.width, context.canvas.height)
}

function paintContinents(context: CanvasRenderingContext2D, random: () => number) {
  const width = context.canvas.width
  const height = context.canvas.height

  const continentLayers = [
    { color: '#557a3e', alpha: 0.94, scale: 1 },
    { color: '#7c8b49', alpha: 0.42, scale: 0.82 },
    { color: '#a88a56', alpha: 0.24, scale: 0.6 },
  ]

  const continents = [
    [
      [0.12, 0.2],
      [0.18, 0.14],
      [0.24, 0.15],
      [0.27, 0.22],
      [0.25, 0.28],
      [0.21, 0.33],
      [0.18, 0.38],
      [0.13, 0.34],
      [0.1, 0.27],
    ],
    [
      [0.24, 0.34],
      [0.29, 0.37],
      [0.31, 0.46],
      [0.29, 0.56],
      [0.26, 0.67],
      [0.23, 0.76],
      [0.19, 0.82],
      [0.16, 0.74],
      [0.17, 0.63],
      [0.19, 0.52],
      [0.21, 0.42],
    ],
    [
      [0.49, 0.26],
      [0.57, 0.2],
      [0.66, 0.23],
      [0.72, 0.31],
      [0.69, 0.38],
      [0.63, 0.42],
      [0.56, 0.41],
      [0.5, 0.35],
    ],
    [
      [0.54, 0.43],
      [0.59, 0.46],
      [0.63, 0.54],
      [0.61, 0.63],
      [0.58, 0.72],
      [0.53, 0.8],
      [0.48, 0.73],
      [0.47, 0.61],
      [0.49, 0.5],
    ],
    [
      [0.77, 0.72],
      [0.85, 0.75],
      [0.9, 0.83],
      [0.82, 0.88],
      [0.74, 0.84],
    ],
    [
      [0.72, 0.18],
      [0.77, 0.16],
      [0.81, 0.21],
      [0.78, 0.26],
      [0.73, 0.24],
    ],
  ]

  for (const layer of continentLayers) {
    context.fillStyle = applyAlpha(layer.color, layer.alpha)

    for (const polygon of continents) {
      context.beginPath()

      polygon.forEach(([px, py], index) => {
        const jitterX = (random() - 0.5) * 0.012
        const jitterY = (random() - 0.5) * 0.012
        const x = (px - 0.5) * layer.scale * width + width * 0.5 + jitterX * width
        const y = (py - 0.5) * layer.scale * height + height * 0.5 + jitterY * height

        if (index === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      })

      context.closePath()
      context.fill()
    }
  }

  paintSoftBlobs(context, random, '#d4bf8f', 18, 0.05)
}

function paintEarthCurrents(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 26; index += 1) {
    const y = random() * context.canvas.height
    context.strokeStyle = applyAlpha('#8fd7ff', 0.028 + random() * 0.018)
    context.lineWidth = 1 + random() * 2.5
    context.beginPath()
    for (let x = 0; x <= context.canvas.width; x += 28) {
      const waveY = y + Math.sin((x / context.canvas.width) * Math.PI * 4 + index) * (6 + random() * 10)
      if (x === 0) context.moveTo(x, waveY)
      else context.lineTo(x, waveY)
    }
    context.stroke()
  }
}

function paintOceanDepth(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 80; index += 1) {
    const radius = 18 + random() * 120
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const gradient = context.createRadialGradient(x, y, radius * 0.2, x, y, radius)
    gradient.addColorStop(0, 'rgba(25, 98, 185, 0.22)')
    gradient.addColorStop(1, 'rgba(12, 78, 146, 0)')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const oceanShade = context.createLinearGradient(0, 0, context.canvas.width, context.canvas.height)
  oceanShade.addColorStop(0, 'rgba(18,70,150,0.12)')
  oceanShade.addColorStop(0.5, 'rgba(0,0,0,0)')
  oceanShade.addColorStop(1, 'rgba(8,34,90,0.14)')
  context.fillStyle = oceanShade
  context.fillRect(0, 0, context.canvas.width, context.canvas.height)
}

function paintCityLights(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
) {
  for (let index = 0; index < 180; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const radius = 1 + random() * 3.2
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 3.8)
    gradient.addColorStop(0, applyAlpha(color, 0.55))
    gradient.addColorStop(0.35, applyAlpha(color, 0.22))
    gradient.addColorStop(1, applyAlpha(color, 0))
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius * 3.8, 0, Math.PI * 2)
    context.fill()
  }
}

function paintAuroraBands(context: CanvasRenderingContext2D, random: () => number) {
  const colors = ['#78ffd9', '#7fd0ff']

  for (let index = 0; index < 10; index += 1) {
    const top = random() * 46
    const bottom = context.canvas.height - 46 - random() * 18
    const height = 6 + random() * 18
    context.fillStyle = applyAlpha(colors[index % colors.length], 0.08 + random() * 0.06)
    context.fillRect(0, top, context.canvas.width, height)
    context.fillRect(0, bottom, context.canvas.width, height)
  }
}

function paintEarthRelief(
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
) {
  fillSolid(roughnessContext, '#666666')

  for (let index = 0; index < 18; index += 1) {
    const x = random() * bumpContext.canvas.width
    const y = random() * bumpContext.canvas.height
    const radiusX = 40 + random() * 140
    const radiusY = 20 + random() * 60
    const rotation = random() * Math.PI

    bumpContext.save()
    bumpContext.translate(x, y)
    bumpContext.rotate(rotation)
    bumpContext.fillStyle = `rgba(210,210,210,${0.12 + random() * 0.1})`
    bumpContext.beginPath()
    bumpContext.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
    bumpContext.fill()
    bumpContext.restore()

    roughnessContext.save()
    roughnessContext.translate(x, y)
    roughnessContext.rotate(rotation)
    roughnessContext.fillStyle = `rgba(255,255,255,${0.08 + random() * 0.06})`
    roughnessContext.beginPath()
    roughnessContext.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
    roughnessContext.fill()
    roughnessContext.restore()
  }

  for (let index = 0; index < 84; index += 1) {
    const y = random() * roughnessContext.canvas.height
    const height = 2 + random() * 7
    roughnessContext.fillStyle = `rgba(40,40,40,${0.06 + random() * 0.05})`
    roughnessContext.fillRect(0, y, roughnessContext.canvas.width, height)
  }

  for (let index = 0; index < 8; index += 1) {
    const y = random() * bumpContext.canvas.height
    const height = 8 + random() * 14
    bumpContext.fillStyle = `rgba(250,250,250,${0.04 + random() * 0.04})`
    bumpContext.fillRect(0, y, bumpContext.canvas.width, height)
  }
}

function paintMercurySurface(context: CanvasRenderingContext2D, random: () => number) {
  paintCrateredSurface(context, random)
  paintSoftBlobs(context, random, '#c9b39a', 72, 0.05)
  paintSoftBlobs(context, random, '#5d5046', 52, 0.08)

  for (let index = 0; index < 18; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const radius = 18 + random() * 68
    context.strokeStyle = applyAlpha('#e4d2bc', 0.08 + random() * 0.06)
    context.lineWidth = 1.4 + random() * 2
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.stroke()
  }
}

function paintMarsSurface(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 8, 0.04)
  paintSoftBlobs(context, random, '#8c3a22', 180, 0.1)
  paintSoftBlobs(context, random, '#f1b17a', 100, 0.07)
  paintSoftBlobs(context, random, '#5a2418', 46, 0.14)
  paintCanyonStreaks(context, random, '#6d2a1c', 10, 0.08)

  for (let index = 0; index < 14; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const radiusX = 48 + random() * 160
    const radiusY = 16 + random() * 54
    context.fillStyle = applyAlpha(index % 2 === 0 ? '#7b301d' : '#e7bf8a', 0.08 + random() * 0.05)
    context.beginPath()
    context.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2)
    context.fill()
  }
}

function paintJupiterBands(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 52, 0.2)
  paintJetStreams(context, random, ['#8f5a37', '#cf9c72', '#f1dcc0', '#b9784c'])
  paintStorm(context, random, true)
  paintStormCells(context, random, '#f2e0c8', 14, 0.03)

  for (let index = 0; index < 24; index += 1) {
    const y = random() * context.canvas.height
    const h = 10 + random() * 20
    const stripeColor =
      index % 3 === 0 ? '#9e6541' : index % 3 === 1 ? '#d5ab80' : '#efd9be'
    context.fillStyle = applyAlpha(stripeColor, 0.06 + random() * 0.035)
    context.fillRect(0, y, context.canvas.width, h)
  }
}

function paintSaturnBands(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 18, 0.08)
  paintJetStreams(context, random, ['#d5c198', '#f1e3bf', '#aa9168'])

  for (let index = 0; index < 24; index += 1) {
    const y = random() * context.canvas.height
    const h = 8 + random() * 14
    const stripeColor = index % 3 === 0 ? '#f4e2b8' : index % 3 === 1 ? '#c9ac7d' : '#9a7c55'
    context.fillStyle = applyAlpha(stripeColor, 0.035 + random() * 0.02)
    context.fillRect(0, y, context.canvas.width, h)
  }
}

function paintVenusClouds(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 20, 0.08)
  paintSoftBlobs(context, random, '#ffe4b8', 160, 0.08)
  paintCloudVeins(context, random, '#fff1d7', 0.04)

  for (let index = 0; index < 18; index += 1) {
    const y = random() * context.canvas.height
    const amp = 8 + random() * 22
    context.strokeStyle = applyAlpha('#fff7e7', 0.06 + random() * 0.03)
    context.lineWidth = 3 + random() * 5
    context.beginPath()
    for (let x = 0; x <= context.canvas.width; x += 26) {
      const waveY = y + Math.sin((x / context.canvas.width) * Math.PI * 3.2 + index) * amp
      if (x === 0) context.moveTo(x, waveY)
      else context.lineTo(x, waveY)
    }
    context.stroke()
  }
}

function paintUranusSurface(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 10, 0.06)
  paintSoftBlobs(context, random, '#d9ffff', 42, 0.035)

  const haze = context.createLinearGradient(0, 0, 0, context.canvas.height)
  haze.addColorStop(0, 'rgba(214,255,255,0.12)')
  haze.addColorStop(0.5, 'rgba(214,255,255,0.02)')
  haze.addColorStop(1, 'rgba(120,190,196,0.08)')
  context.fillStyle = haze
  context.fillRect(0, 0, context.canvas.width, context.canvas.height)
}

function paintNeptuneSurface(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  paintBands(context, random, colors, 18, 0.1)
  paintJetStreams(context, random, colors)
  paintStormCells(context, random, '#a5c6ff', 12, 0.05)
  paintSoftBlobs(context, random, '#1c4fb4', 48, 0.05)

  for (let index = 0; index < 10; index += 1) {
    const y = random() * context.canvas.height
    const h = 10 + random() * 18
    context.fillStyle = applyAlpha('#7ca6ff', 0.045 + random() * 0.025)
    context.fillRect(0, y, context.canvas.width, h)
  }
}

function paintPolarCaps(context: CanvasRenderingContext2D) {
  context.fillStyle = 'rgba(245, 249, 255, 0.78)'
  context.fillRect(0, 0, context.canvas.width, 48)
  context.fillRect(0, context.canvas.height - 48, context.canvas.width, 48)
}

function paintGasRelief(
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
  emphasizeStorm: boolean,
) {
  fillSolid(roughnessContext, '#8c8c8c')

  for (let index = 0; index < 54; index += 1) {
    const y = random() * bumpContext.canvas.height
    const height = 8 + random() * 26
    bumpContext.fillStyle = `rgba(180,180,180,${0.06 + random() * 0.1})`
    bumpContext.fillRect(0, y, bumpContext.canvas.width, height)

    roughnessContext.fillStyle = `rgba(110,110,110,${0.08 + random() * 0.08})`
    roughnessContext.fillRect(0, y, roughnessContext.canvas.width, height)
  }

  if (emphasizeStorm) {
    const x = bumpContext.canvas.width * 0.62
    const y = bumpContext.canvas.height * 0.5
    bumpContext.fillStyle = 'rgba(225,225,225,0.22)'
    bumpContext.beginPath()
    bumpContext.ellipse(x, y, 130, 74, 0, 0, Math.PI * 2)
    bumpContext.fill()

    roughnessContext.fillStyle = 'rgba(70,70,70,0.3)'
    roughnessContext.beginPath()
    roughnessContext.ellipse(x, y, 130, 74, 0, 0, Math.PI * 2)
    roughnessContext.fill()
  }

  for (let index = 0; index < 24; index += 1) {
    const y = random() * bumpContext.canvas.height
    const height = 3 + random() * 10
    bumpContext.fillStyle = `rgba(225,225,225,${0.05 + random() * 0.06})`
    bumpContext.fillRect(0, y, bumpContext.canvas.width, height)
  }
}

function paintVenusRelief(
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
) {
  fillSolid(roughnessContext, '#9e9e9e')
  paintCloudLikeNoise(bumpContext, random, 180, 0.08, '#bcbcbc')
  paintCloudLikeNoise(roughnessContext, random, 140, 0.07, '#d0d0d0')
}

function paintRockRelief(
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
  baseBump: string,
  baseRoughness: string,
) {
  fillSolid(bumpContext, baseBump)
  fillSolid(roughnessContext, baseRoughness)

  for (let index = 0; index < 220; index += 1) {
    const radius = 4 + random() * 24
    const x = random() * bumpContext.canvas.width
    const y = random() * bumpContext.canvas.height

    bumpContext.fillStyle = `rgba(210,210,210,${0.07 + random() * 0.12})`
    bumpContext.beginPath()
    bumpContext.arc(x, y, radius, 0, Math.PI * 2)
    bumpContext.fill()

    roughnessContext.fillStyle = `rgba(70,70,70,${0.08 + random() * 0.16})`
    roughnessContext.beginPath()
    roughnessContext.arc(x, y, radius * 0.82, 0, Math.PI * 2)
    roughnessContext.fill()
  }
}

function paintIcyRelief(
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
) {
  fillSolid(roughnessContext, '#7b7b7b')
  for (let index = 0; index < 80; index += 1) {
    const y = random() * bumpContext.canvas.height
    const height = 6 + random() * 18
    bumpContext.fillStyle = `rgba(190,190,190,${0.08 + random() * 0.08})`
    bumpContext.fillRect(0, y, bumpContext.canvas.width, height)
  }
  paintCloudLikeNoise(roughnessContext, random, 120, 0.06, '#a0a0a0')
}

function paintGasGlow(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
  alpha: number,
) {
  for (let index = 0; index < 26; index += 1) {
    const y = random() * context.canvas.height
    const height = 10 + random() * 26
    context.fillStyle = applyAlpha(color, alpha + random() * 0.03)
    context.fillRect(0, y, context.canvas.width, height)
  }
}

function paintJetStreams(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
) {
  for (let index = 0; index < 28; index += 1) {
    const y = random() * context.canvas.height
    const wave = 8 + random() * 18
    const thickness = 2 + random() * 7
    const color = colors[index % colors.length]
    context.strokeStyle = applyAlpha(color, 0.12 + random() * 0.08)
    context.lineWidth = thickness
    context.beginPath()

    for (let x = 0; x <= context.canvas.width; x += 32) {
      const offsetY = y + Math.sin((x / context.canvas.width) * Math.PI * 4 + random() * Math.PI) * wave
      if (x === 0) {
        context.moveTo(x, offsetY)
      } else {
        context.lineTo(x, offsetY)
      }
    }

    context.stroke()
  }
}

function paintCloudVeins(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
  alpha: number,
) {
  for (let index = 0; index < 40; index += 1) {
    const startY = random() * context.canvas.height
    context.strokeStyle = applyAlpha(color, alpha + random() * 0.04)
    context.lineWidth = 1 + random() * 3
    context.beginPath()

    for (let x = 0; x <= context.canvas.width; x += 24) {
      const y = startY + Math.sin((x / context.canvas.width) * Math.PI * 5 + random() * 6) * (8 + random() * 18)
      if (x === 0) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }
    }

    context.stroke()
  }
}

function paintCanyonStreaks(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
  count: number,
  alpha: number,
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * context.canvas.width
    const width = 16 + random() * 60
    context.fillStyle = applyAlpha(color, alpha + random() * 0.06)
    context.fillRect(x, 0, width, context.canvas.height)
  }
}

function paintStormCells(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
  count: number,
  alpha: number,
) {
  for (let index = 0; index < count; index += 1) {
    const radiusX = 18 + random() * 64
    const radiusY = 8 + random() * 30
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    context.fillStyle = applyAlpha(color, alpha + random() * 0.05)
    context.beginPath()
    context.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2)
    context.fill()
  }
}

function paintCloudLikeNoise(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
  alpha: number,
  color: string,
) {
  for (let index = 0; index < count; index += 1) {
    const radius = 10 + random() * 42
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const gradient = context.createRadialGradient(x, y, radius * 0.2, x, y, radius)
    gradient.addColorStop(0, applyAlpha(color, alpha + random() * 0.06))
    gradient.addColorStop(1, applyAlpha(color, 0))
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

function paintStorm(
  context: CanvasRenderingContext2D,
  random: () => number,
  largeStorm: boolean,
) {
  const x = context.canvas.width * (0.56 + random() * 0.16)
  const y = context.canvas.height * (0.46 + random() * 0.08)
  const radiusX = largeStorm ? 120 : 76
  const radiusY = largeStorm ? 66 : 36
  context.fillStyle = largeStorm ? 'rgba(170, 78, 44, 0.55)' : 'rgba(255, 233, 193, 0.35)'
  context.beginPath()
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
  context.fill()
}

function paintSoftBlobs(
  context: CanvasRenderingContext2D,
  random: () => number,
  color: string,
  count: number,
  alpha: number,
) {
  for (let index = 0; index < count; index += 1) {
    const radius = 6 + random() * 34
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const gradient = context.createRadialGradient(x, y, radius * 0.15, x, y, radius)
    gradient.addColorStop(0, applyAlpha(color, alpha + random() * 0.08))
    gradient.addColorStop(1, applyAlpha(color, 0))
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

function paintFineNoise(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
  alpha: number,
) {
  for (let index = 0; index < count; index += 1) {
    const size = 1 + random() * 3
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    context.fillStyle = `rgba(255,255,255,${random() * alpha})`
    context.fillRect(x, y, size, size)
  }
}

function paintCrateredSurface(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 180; index += 1) {
    const radius = 4 + random() * 26
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    context.fillStyle = `rgba(40, 28, 22, ${0.04 + random() * 0.12})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = `rgba(240, 223, 204, ${0.03 + random() * 0.08})`
    context.lineWidth = 1.2
    context.beginPath()
    context.arc(x, y, radius * 0.72, 0, Math.PI * 2)
    context.stroke()
  }
}

function addVignette(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const gradient = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.1,
    width * 0.5,
    height * 0.5,
    width * 0.7,
  )
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.22)')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

function softenTextureSeam(context: CanvasRenderingContext2D) {
  const width = context.canvas.width
  const gradient = context.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, 'rgba(255,255,255,0.06)')
  gradient.addColorStop(0.03, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.97, 'rgba(255,255,255,0)')
  gradient.addColorStop(1, 'rgba(255,255,255,0.06)')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, context.canvas.height)
}

function applyAlpha(color: string, alpha: number) {
  const nextColor = new THREE.Color(color)
  return `rgba(${Math.round(nextColor.r * 255)}, ${Math.round(nextColor.g * 255)}, ${Math.round(
    nextColor.b * 255,
  )}, ${alpha})`
}

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash) + 1
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
