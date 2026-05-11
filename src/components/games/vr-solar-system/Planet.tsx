import { Billboard, Text } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
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

const planetTexturePaths: Record<string, string> = {
  earth: '/textures/solar-system/earth.jpg',
  jupiter: '/textures/solar-system/jupiter.jpg',
  mars: '/textures/solar-system/mars.jpg',
  mercury: '/textures/solar-system/mercury.jpg',
  neptune: '/textures/solar-system/neptune.jpg',
  pluto: '/textures/solar-system/pluto.jpg',
  saturn: '/textures/solar-system/saturn.jpg',
  uranus: '/textures/solar-system/uranus.jpg',
  venus: '/textures/solar-system/venus.jpg',
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
  const dragStateRef = useRef<{ active: boolean; lastX: number; lastY: number } | null>(null)
  const manualRotationRef = useRef(new THREE.Vector2(0, 0))
  const autoRotationRef = useRef(0)

  const realSurfaceMap = useLoader(THREE.TextureLoader, planetTexturePaths[planet.id])
  const earthCloudMap = useLoader(THREE.TextureLoader, '/textures/solar-system/earth-clouds.png')
  const planetMaps = useMemo(() => createPlanetMaps(planet), [planet])
  const generatedCloudTexture = useMemo(
    () =>
      planet.visual.cloudColor && planet.id !== 'earth' && planet.id !== 'saturn'
        ? createCloudTexture(planet.id, planet.visual.cloudColor)
        : null,
    [planet.id, planet.visual.cloudColor],
  )
  const cloudTexture = useMemo(
    () => {
      if (!planet.visual.cloudColor || planet.id === 'saturn') {
        return null
      }

      return planet.id === 'earth' ? earthCloudMap : generatedCloudTexture
    },
    [earthCloudMap, generatedCloudTexture, planet.id, planet.visual.cloudColor],
  )
  const ringTexture = useMemo(
    () => (planet.ring ? createRingTexture(planet.id, planet.ring.color) : null),
    [planet.id, planet.ring],
  )

  useEffect(() => {
    realSurfaceMap.anisotropy = 12
    realSurfaceMap.colorSpace = THREE.SRGBColorSpace
    realSurfaceMap.wrapS = THREE.RepeatWrapping
    realSurfaceMap.wrapT = THREE.ClampToEdgeWrapping
    realSurfaceMap.needsUpdate = true
  }, [realSurfaceMap])

  useEffect(() => {
    return () => {
      planetMaps.map.dispose()
      planetMaps.bumpMap.dispose()
      planetMaps.emissiveMap.dispose()
      planetMaps.roughnessMap.dispose()
      generatedCloudTexture?.dispose()
      ringTexture?.dispose()
    }
  }, [generatedCloudTexture, planetMaps, ringTexture])

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
    if (!dragStateRef.current?.active) {
      autoRotationRef.current += planet.rotationSpeed * delta
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += planet.rotationSpeed * delta * 1.16
    }

    surface.rotation.set(
      manualRotationRef.current.x,
      autoRotationRef.current + manualRotationRef.current.y,
      0,
    )

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
          onPointerDown={(event) => {
            if (!(selected && !overviewMode)) {
              return
            }

            event.stopPropagation()
            dragStateRef.current = {
              active: true,
              lastX: event.clientX,
              lastY: event.clientY,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const dragState = dragStateRef.current

            if (!dragState?.active) {
              return
            }

            const dx = event.clientX - dragState.lastX
            const dy = event.clientY - dragState.lastY
            dragState.lastX = event.clientX
            dragState.lastY = event.clientY

            manualRotationRef.current.y += dx * 0.008
            manualRotationRef.current.x = THREE.MathUtils.clamp(
              manualRotationRef.current.x + dy * 0.008,
              -1.25,
              1.25,
            )
          }}
          onPointerUp={(event) => {
            if (dragStateRef.current) {
              dragStateRef.current.active = false
            }

            event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          onPointerOut={() => setHovered(false)}
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          onPointerLeave={() => {
            if (dragStateRef.current) {
              dragStateRef.current.active = false
            }
          }}
          receiveShadow
        >
          <sphereGeometry args={[planet.radiusScale, 96, 96]} />
          <meshPhysicalMaterial
            bumpMap={(planet.type === 'rocky' || planet.type === 'dwarf-planet') && planet.id !== 'earth' ? planetMaps.bumpMap : null}
            emissiveMap={planet.id === 'earth' ? planetMaps.emissiveMap : null}
            map={realSurfaceMap}
            roughnessMap={planet.id === 'earth' ? planetMaps.roughnessMap : null}
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

        {planet.visual.atmosphereColor && planet.id !== 'saturn' ? (
          <>
            <mesh scale={planet.id === 'venus' ? 1.06 : 1.09}>
              <sphereGeometry args={[planet.radiusScale, 64, 64]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={planet.visual.atmosphereColor}
                depthWrite={false}
                opacity={planet.id === 'earth' ? atmosphereOpacity * 1.15 : atmosphereOpacity * 0.78}
                transparent
              />
            </mesh>
            <mesh scale={planet.id === 'venus' ? 1.12 : 1.16}>
              <sphereGeometry args={[planet.radiusScale, 64, 64]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={planet.visual.atmosphereColor}
                depthWrite={false}
                opacity={planet.id === 'earth' ? 0.09 : 0.04}
                side={THREE.BackSide}
                transparent
              />
            </mesh>
          </>
        ) : null}

        {cloudTexture ? (
          <mesh ref={cloudRef} scale={1.025}>
            <sphereGeometry args={[planet.radiusScale, 48, 48]} />
            {planet.id === 'earth' ? (
              <meshStandardMaterial
                alphaMap={earthCloudMap}
                color="#f5fbff"
                depthWrite={false}
                opacity={0.72}
                roughness={1}
                transparent
              />
            ) : (
              <meshStandardMaterial
                alphaTest={0.03}
                depthWrite={false}
                map={cloudTexture}
                opacity={planet.id === 'venus' ? 0.9 : 0.56}
                roughness={0.96}
                transparent
              />
            )}
          </mesh>
        ) : null}

        {planet.id === 'earth' ? (
          <>
            <mesh scale={1.08}>
              <sphereGeometry args={[planet.radiusScale, 64, 64]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color="#63c7ff"
                depthWrite={false}
                opacity={0.18}
                side={THREE.BackSide}
                transparent
                toneMapped={false}
              />
            </mesh>
            <mesh scale={1.14}>
              <sphereGeometry args={[planet.radiusScale, 64, 64]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color="#e6fbff"
                depthWrite={false}
                opacity={0.08}
                side={THREE.BackSide}
                transparent
                toneMapped={false}
              />
            </mesh>
          </>
        ) : null}

        {planet.ring && ringTexture && (
          <group rotation={[Math.PI / 2, 0, 0.18]}>
            <mesh rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius, planet.ring.outerRadius, 180]} />
              <meshStandardMaterial
                color="#d8c69a"
                depthWrite={false}
                map={ringTexture}
                metalness={0.02}
                opacity={0.78}
                roughness={0.88}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
            <mesh rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius * 1.05, planet.ring.outerRadius * 0.82, 180]} />
              <meshBasicMaterial
                color="#fff0c7"
                depthWrite={false}
                opacity={0.18}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
            <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0.18]}>
              <ringGeometry args={[planet.ring.innerRadius * 1.58, planet.ring.innerRadius * 1.72, 180]} />
              <meshBasicMaterial
                color="#2b2218"
                depthWrite={false}
                opacity={selected ? 0.24 : 0.16}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
          </group>
        )}

        {planet.moons?.map((moon) => (
          <MoonObject key={moon.id} moon={moon} />
        ))}

        {!planet.ring ? (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.radiusScale * 1.44, planet.radiusScale * 1.62, 72]} />
              <meshBasicMaterial color={planet.visual.accentColor} opacity={haloOpacity} transparent />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.radiusScale * 1.62, planet.radiusScale * 1.82, 72]} />
              <meshBasicMaterial color="#ffffff" opacity={haloOpacity * 0.08} transparent />
            </mesh>
          </>
        ) : null}

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
          metalness={0.02}
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
        bumpScale: 0,
        clearcoat: 0.14,
        clearcoatRoughness: 0.58,
        color: '#ffffff',
        emissive: planet.visual.emissiveColor ?? '#1f7fd6',
        emissiveIntensity: isSelectedOrHovered ? 0.08 : 0.04,
        envMapIntensity: 0.22,
        ior: 1.42,
        metalness: 0.01,
        reflectivity: 0.08,
        roughness: 0.72,
        sheen: 0.05,
        sheenRoughness: 0.72,
      }
    case 'jupiter':
      return {
        bumpScale: 0.035,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
        emissive: planet.visual.emissiveColor ?? '#59321e',
        emissiveIntensity: isSelectedOrHovered ? 0.025 : 0.012,
        envMapIntensity: 0.18,
        ior: 1.18,
        metalness: 0.01,
        reflectivity: 0.08,
        roughness: 0.95,
        sheen: 0.05,
        sheenRoughness: 0.9,
      }
    case 'saturn':
      return {
        bumpScale: 0.025,
        clearcoat: 0.04,
        clearcoatRoughness: 0.84,
        emissive: planet.visual.emissiveColor ?? '#5a4531',
        emissiveIntensity: isSelectedOrHovered ? 0.015 : 0.008,
        envMapIntensity: 0.16,
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
        bumpScale: 0.055,
        clearcoat: 0.16,
        clearcoatRoughness: 0.42,
        emissive: planet.visual.emissiveColor ?? '#16395a',
        emissiveIntensity: isSelectedOrHovered ? 0.03 : 0.015,
        envMapIntensity: 0.2,
        ior: 1.24,
        metalness: 0.01,
        reflectivity: 0.1,
        roughness: 0.88,
        sheen: 0.08,
        sheenRoughness: 0.72,
      }
    case 'venus':
      return {
        bumpScale: 0.052,
        clearcoat: 0.18,
        clearcoatRoughness: 0.5,
        emissive: planet.visual.emissiveColor ?? '#6b4420',
        emissiveIntensity: isSelectedOrHovered ? 0.025 : 0.012,
        envMapIntensity: 0.18,
        ior: 1.26,
        metalness: 0.01,
        reflectivity: 0.1,
        roughness: 0.94,
        sheen: 0.04,
        sheenRoughness: 0.74,
      }
    default:
      return {
        bumpScale: planet.type === 'rocky' ? 0.22 : 0.08,
        clearcoat: planet.type === 'rocky' ? 0.08 : 0.16,
        clearcoatRoughness: planet.type === 'rocky' ? 0.72 : 0.58,
        emissive: planet.visual.emissiveColor ?? '#101010',
        emissiveIntensity: isSelectedOrHovered ? 0.14 : 0.07,
        envMapIntensity: planet.type === 'rocky' ? 0.12 : 0.18,
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
  canvas.width = 2048
  canvas.height = 1024
  bumpCanvas.width = 2048
  bumpCanvas.height = 1024
  emissiveCanvas.width = 2048
  emissiveCanvas.height = 1024
  roughnessCanvas.width = 2048
  roughnessCanvas.height = 1024

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
      paintEarthOceanBase(context, random)
      paintContinents(context, random)
      paintSatelliteLandDetails(context, random)
      paintOceanDepth(context, random)
      paintEarthCurrents(context, random)
      paintSoftBlobs(context, random, '#7cc7ff', 120, 0.045)
      paintPolarCaps(context)
      paintMountainChains(context, bumpContext, roughnessContext, random)
      paintCoastGlow(context, random)
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
      paintPolarDustCaps(context, random)
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
        paintPlutoSurface(context, random)
        paintCanyonStreaks(context, random, '#f0d2ae', 12, 0.08)
      }
      paintRockRelief(bumpContext, roughnessContext, random, '#828282', '#d6d6d6')
      paintGasGlow(emissiveContext, random, '#241b13', 0.008)
      break
    default:
      break
  }

  addVignette(context, canvas.width, canvas.height, planet.id)
  paintPhotographicContrast(context, planet.id)
  paintMicroScratches(context, random, planet.type === 'rocky' || planet.type === 'dwarf-planet' ? 180 : 80)
  paintFineNoise(context, random, 420, 0.04)
  paintFineNoise(bumpContext, random, 520, 0.06)
  paintFineNoise(roughnessContext, random, 360, 0.04)
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
  canvas.width = 2048
  canvas.height = 1024

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
          ? 0.018 + random() * 0.032
          : 0.03 + random() * 0.05
    context.fillStyle = applyAlpha(cloudColor, alpha)
    context.fillRect(0, y, canvas.width, height)
  }

  const cloudCount = seedLabel === 'earth' ? 260 : 120

  for (let index = 0; index < cloudCount; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const radius = seedLabel === 'earth' ? 10 + random() * 62 : 14 + random() * 60
    const gradient = context.createRadialGradient(x, y, radius * 0.25, x, y, radius)
    gradient.addColorStop(0, seedLabel === 'earth' ? `${cloudColor}f2` : `${cloudColor}cc`)
    gradient.addColorStop(0.58, seedLabel === 'earth' ? `${cloudColor}68` : `${cloudColor}33`)
    gradient.addColorStop(1, `${cloudColor}00`)
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  if (seedLabel === 'earth') {
    for (let index = 0; index < 46; index += 1) {
      const startY = random() * canvas.height
      context.strokeStyle = applyAlpha(cloudColor, 0.09 + random() * 0.08)
      context.lineWidth = 2 + random() * 9
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

    for (let index = 0; index < 42; index += 1) {
      const x = random() * canvas.width
      const y = random() * canvas.height
      const radius = 22 + random() * 72
      context.strokeStyle = applyAlpha(cloudColor, 0.045 + random() * 0.045)
      context.lineWidth = 2 + random() * 5
      context.beginPath()
      context.arc(x, y, radius, random() * Math.PI, Math.PI * (1.2 + random() * 1.4))
      context.stroke()
    }
  }

  const rimFade = context.createLinearGradient(0, 0, 0, canvas.height)
  rimFade.addColorStop(0, seedLabel === 'earth' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)')
  rimFade.addColorStop(0.22, 'rgba(255,255,255,0)')
  rimFade.addColorStop(0.78, 'rgba(255,255,255,0)')
  rimFade.addColorStop(1, seedLabel === 'earth' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)')
  context.fillStyle = rimFade
  context.fillRect(0, 0, canvas.width, canvas.height)

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
    const t = index / canvas.width
    const banding = Math.sin(index * 0.018) * 0.08 + Math.sin(index * 0.071) * 0.035
    const fineBanding = Math.sin(index * 0.19) * 0.018
    const cassiniDivision = t > 0.61 && t < 0.66 ? -0.22 : 0
    const innerFade = THREE.MathUtils.smoothstep(t, 0.02, 0.12)
    const outerFade = 1 - THREE.MathUtils.smoothstep(t, 0.9, 1)
    const alpha = (0.34 + banding + fineBanding + cassiniDivision + random() * 0.018) * innerFade * outerFade
    context.fillStyle = applyAlpha(color, THREE.MathUtils.clamp(alpha, 0.02, 0.52))
    context.fillRect(index, 0, 1, canvas.height)
  }

  const sheen = context.createLinearGradient(0, 0, 0, canvas.height)
  sheen.addColorStop(0, 'rgba(255,255,255,0.12)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)')
  sheen.addColorStop(1, 'rgba(255,255,255,0.1)')
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

function paintEarthOceanBase(context: CanvasRenderingContext2D, random: () => number) {
  const width = context.canvas.width
  const height = context.canvas.height
  const ocean = context.createLinearGradient(0, 0, width, height)
  ocean.addColorStop(0, '#0c2f60')
  ocean.addColorStop(0.2, '#12508e')
  ocean.addColorStop(0.5, '#1fb3cf')
  ocean.addColorStop(0.74, '#0b6a8c')
  ocean.addColorStop(1, '#041c39')
  context.fillStyle = ocean
  context.fillRect(0, 0, width, height)

  for (let index = 0; index < 180; index += 1) {
    const x = random() * width
    const y = random() * height
    const radius = 18 + random() * 180
    const shade = context.createRadialGradient(x, y, radius * 0.1, x, y, radius)
    shade.addColorStop(0, `rgba(92,220,220,${0.05 + random() * 0.06})`)
    shade.addColorStop(0.72, `rgba(16,120,180,${0.03 + random() * 0.04})`)
    shade.addColorStop(1, 'rgba(3,15,42,0)')
    context.fillStyle = shade
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

function paintContinents(context: CanvasRenderingContext2D, random: () => number) {
  const width = context.canvas.width
  const height = context.canvas.height

  const continentLayers = [
    { color: '#5f9440', alpha: 0.98, scale: 1 },
    { color: '#88b25b', alpha: 0.58, scale: 0.9 },
    { color: '#3e7238', alpha: 0.42, scale: 0.76 },
    { color: '#e2cf96', alpha: 0.24, scale: 0.58 },
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

  paintSoftBlobs(context, random, '#cfe39a', 18, 0.06)
}

function paintSatelliteLandDetails(context: CanvasRenderingContext2D, random: () => number) {
  const width = context.canvas.width
  const height = context.canvas.height
  const regions = [
    { x: 0.19, y: 0.28, w: 0.18, h: 0.18, green: '#3a7039', sand: '#c1b06d' },
    { x: 0.23, y: 0.58, w: 0.13, h: 0.28, green: '#4c843c', sand: '#d0a968' },
    { x: 0.59, y: 0.31, w: 0.28, h: 0.19, green: '#5d813d', sand: '#d9be76' },
    { x: 0.55, y: 0.61, w: 0.16, h: 0.28, green: '#3c7238', sand: '#b89a61' },
    { x: 0.82, y: 0.8, w: 0.15, h: 0.11, green: '#748644', sand: '#d8c08a' },
  ]

  for (const region of regions) {
    for (let index = 0; index < 92; index += 1) {
      const x = (region.x + (random() - 0.5) * region.w) * width
      const y = (region.y + (random() - 0.5) * region.h) * height
      const radiusX = (6 + random() * 42) * (region.w > 0.2 ? 1.25 : 1)
      const radiusY = 3 + random() * 22
      const color = random() > 0.35 ? region.green : region.sand

      context.save()
      context.translate(x, y)
      context.rotate(random() * Math.PI)
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusX)
      gradient.addColorStop(0, applyAlpha(color, 0.2 + random() * 0.14))
      gradient.addColorStop(0.68, applyAlpha(color, 0.06 + random() * 0.08))
      gradient.addColorStop(1, applyAlpha(color, 0))
      context.fillStyle = gradient
      context.beginPath()
      context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }

  for (let index = 0; index < 95; index += 1) {
    const x = random() * width
    const y = random() * height
    const radius = 3 + random() * 14
    context.fillStyle = `rgba(245,242,212,${0.03 + random() * 0.05})`
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

function paintEarthCurrents(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 26; index += 1) {
    const y = random() * context.canvas.height
    context.strokeStyle = applyAlpha('#c3f3ff', 0.04 + random() * 0.02)
    context.lineWidth = 1.2 + random() * 2.8
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
    gradient.addColorStop(0, 'rgba(54, 160, 214, 0.18)')
    gradient.addColorStop(1, 'rgba(10, 68, 132, 0)')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const oceanShade = context.createLinearGradient(0, 0, context.canvas.width, context.canvas.height)
  oceanShade.addColorStop(0, 'rgba(34,146,205,0.1)')
  oceanShade.addColorStop(0.5, 'rgba(0,0,0,0)')
  oceanShade.addColorStop(1, 'rgba(4,34,76,0.08)')
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

function paintMountainChains(
  context: CanvasRenderingContext2D,
  bumpContext: CanvasRenderingContext2D,
  roughnessContext: CanvasRenderingContext2D,
  random: () => number,
) {
  const chains = [
    { x: 0.23, y: 0.48, length: 0.22, color: '#d2c19c' },
    { x: 0.55, y: 0.36, length: 0.18, color: '#c7b48d' },
    { x: 0.61, y: 0.58, length: 0.2, color: '#bfa477' },
  ]

  for (const chain of chains) {
    const startX = chain.x * context.canvas.width
    const startY = chain.y * context.canvas.height
    const length = chain.length * context.canvas.width

    for (let index = 0; index < 34; index += 1) {
      const t = index / 33
      const x = startX + length * t + (random() - 0.5) * 34
      const y = startY + Math.sin(t * Math.PI * 3.2) * 32 + (random() - 0.5) * 26
      const radius = 5 + random() * 12

      context.fillStyle = applyAlpha(chain.color, 0.08 + random() * 0.06)
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()

      bumpContext.fillStyle = `rgba(245,245,245,${0.16 + random() * 0.12})`
      bumpContext.beginPath()
      bumpContext.arc(x, y, radius * 0.8, 0, Math.PI * 2)
      bumpContext.fill()

      roughnessContext.fillStyle = `rgba(255,255,255,${0.12 + random() * 0.08})`
      roughnessContext.beginPath()
      roughnessContext.arc(x, y, radius, 0, Math.PI * 2)
      roughnessContext.fill()
    }
  }
}

function paintCoastGlow(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 80; index += 1) {
    const radiusX = 16 + random() * 68
    const radiusY = 3 + random() * 12
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height

    context.save()
    context.translate(x, y)
    context.rotate(random() * Math.PI)
    context.strokeStyle = applyAlpha('#c5f1ff', 0.04 + random() * 0.035)
    context.lineWidth = 1 + random() * 2
    context.beginPath()
    context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
    context.stroke()
    context.restore()
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

function paintPlutoSurface(context: CanvasRenderingContext2D, random: () => number) {
  paintCrateredSurface(context, random)
  paintSoftBlobs(context, random, '#e8d9c8', 90, 0.09)
  paintSoftBlobs(context, random, '#6a4a3b', 74, 0.11)

  const heartX = context.canvas.width * 0.44
  const heartY = context.canvas.height * 0.48
  const gradient = context.createRadialGradient(heartX, heartY, 20, heartX, heartY, context.canvas.width * 0.16)
  gradient.addColorStop(0, 'rgba(238,226,212,0.32)')
  gradient.addColorStop(0.72, 'rgba(204,176,156,0.13)')
  gradient.addColorStop(1, 'rgba(204,176,156,0)')
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(heartX, heartY, context.canvas.width * 0.11, context.canvas.height * 0.13, -0.18, 0, Math.PI * 2)
  context.fill()
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

function paintPolarDustCaps(context: CanvasRenderingContext2D, random: () => number) {
  const caps = [
    { y: 0.06, alpha: 0.34 },
    { y: 0.94, alpha: 0.22 },
  ]

  for (const cap of caps) {
    const gradient = context.createRadialGradient(
      context.canvas.width * 0.5,
      context.canvas.height * cap.y,
      0,
      context.canvas.width * 0.5,
      context.canvas.height * cap.y,
      context.canvas.width * 0.32,
    )
    gradient.addColorStop(0, `rgba(255,226,186,${cap.alpha})`)
    gradient.addColorStop(0.45, `rgba(245,190,136,${cap.alpha * 0.42})`)
    gradient.addColorStop(1, 'rgba(245,190,136,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
  }

  paintSoftBlobs(context, random, '#ffd8b0', 36, 0.045)
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
  paintTurbulentGasKnots(context, random, ['#fff1d8', '#b66b3f', '#7d432d'], 120)

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
  paintTurbulentGasKnots(context, random, ['#fff0c7', '#c5a877', '#8a704d'], 56)

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
  paintDarkVortex(context, random)

  for (let index = 0; index < 10; index += 1) {
    const y = random() * context.canvas.height
    const h = 10 + random() * 18
    context.fillStyle = applyAlpha('#7ca6ff', 0.045 + random() * 0.025)
    context.fillRect(0, y, context.canvas.width, h)
  }
}

function paintTurbulentGasKnots(
  context: CanvasRenderingContext2D,
  random: () => number,
  colors: string[],
  count: number,
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const radiusX = 10 + random() * 52
    const radiusY = 3 + random() * 16
    const color = colors[index % colors.length]

    context.save()
    context.translate(x, y)
    context.rotate((random() - 0.5) * 0.35)
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusX)
    gradient.addColorStop(0, applyAlpha(color, 0.07 + random() * 0.08))
    gradient.addColorStop(0.62, applyAlpha(color, 0.025 + random() * 0.035))
    gradient.addColorStop(1, applyAlpha(color, 0))
    context.fillStyle = gradient
    context.beginPath()
    context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

function paintDarkVortex(context: CanvasRenderingContext2D, random: () => number) {
  const x = context.canvas.width * (0.58 + random() * 0.12)
  const y = context.canvas.height * (0.42 + random() * 0.16)
  const gradient = context.createRadialGradient(x, y, 12, x, y, 92)
  gradient.addColorStop(0, 'rgba(9,20,80,0.38)')
  gradient.addColorStop(0.5, 'rgba(18,46,130,0.16)')
  gradient.addColorStop(1, 'rgba(80,140,255,0)')
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(x, y, 120, 54, -0.12, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = 'rgba(170,205,255,0.08)'
  context.lineWidth = 3
  context.beginPath()
  context.ellipse(x, y, 132, 62, -0.12, 0, Math.PI * 2)
  context.stroke()
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

function paintMicroScratches(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const length = 10 + random() * 54

    context.save()
    context.translate(x, y)
    context.rotate(random() * Math.PI)
    context.strokeStyle = `rgba(255,255,255,${0.012 + random() * 0.022})`
    context.lineWidth = 0.6 + random() * 1.1
    context.beginPath()
    context.moveTo(-length * 0.5, 0)
    context.lineTo(length * 0.5, (random() - 0.5) * 4)
    context.stroke()
    context.restore()
  }
}

function paintCrateredSurface(context: CanvasRenderingContext2D, random: () => number) {
  for (let index = 0; index < 260; index += 1) {
    const radius = 4 + random() * 26
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height

    const shadow = context.createRadialGradient(x, y, radius * 0.25, x, y, radius * 1.35)
    shadow.addColorStop(0, `rgba(18, 14, 12, ${0.08 + random() * 0.11})`)
    shadow.addColorStop(0.62, `rgba(42, 32, 26, ${0.05 + random() * 0.07})`)
    shadow.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = shadow
    context.beginPath()
    context.arc(x, y, radius * 1.35, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = `rgba(240, 223, 204, ${0.04 + random() * 0.1})`
    context.lineWidth = 1.2
    context.beginPath()
    context.arc(x - radius * 0.08, y - radius * 0.08, radius * 0.86, 0, Math.PI * 2)
    context.stroke()
  }
}

function addVignette(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  planetId?: string,
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
  gradient.addColorStop(1, planetId === 'earth' ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0.22)')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

function paintPhotographicContrast(context: CanvasRenderingContext2D, planetId: string) {
  const width = context.canvas.width
  const height = context.canvas.height
  const contrast = context.createLinearGradient(0, 0, width, height)
  contrast.addColorStop(0, planetId === 'earth' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.045)')
  contrast.addColorStop(0.34, 'rgba(255,255,255,0)')
  contrast.addColorStop(0.66, 'rgba(0,0,0,0.02)')
  contrast.addColorStop(1, planetId === 'earth' ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.12)')
  context.fillStyle = contrast
  context.fillRect(0, 0, width, height)

  if (planetId === 'earth') {
    context.globalCompositeOperation = 'soft-light'
    context.fillStyle = 'rgba(120,190,255,0.04)'
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'source-over'
  }
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
