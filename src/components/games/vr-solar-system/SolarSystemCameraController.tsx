import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { XROrigin, useXR } from '@react-three/xr'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { SolarSystemPlanet } from './data'
import type { SolarOverviewPerspective, SolarSystemView } from './hooks/useSolarSystemState'
import {
  computeDampFactor,
  createOverviewPose,
  createPlanetPose,
  createTopOverviewPose,
  isPoseSettled,
} from './lib/cameraFlight'

interface SolarSystemCameraControllerProps {
  overviewPerspective: SolarOverviewPerspective
  selectedPlanet: SolarSystemPlanet | null
  view: SolarSystemView
  getPlanetPosition: (planetId: string) => THREE.Vector3 | null
}

export function SolarSystemCameraController({
  overviewPerspective,
  selectedPlanet,
  view,
  getPlanetPosition,
}: SolarSystemCameraControllerProps) {
  const session = useXR((state) => state.session)
  const camera = useThree((state) => state.camera)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const xrRigRef = useRef<THREE.Group>(null)
  const overviewPose = useMemo(() => createOverviewPose(), [])
  const topOverviewPose = useMemo(() => createTopOverviewPose(), [])
  const desiredPoseRef = useRef(createOverviewPose())
  const isTransitioningRef = useRef(true)
  const isTopDownOverview = view === 'overview' && overviewPerspective === 'top'

  useEffect(() => {
    let nextPose = overviewPerspective === 'top' ? topOverviewPose : overviewPose

    if (view === 'focus' && selectedPlanet) {
      const selectedPosition = getPlanetPosition(selectedPlanet.id)

      if (selectedPosition) {
        nextPose = createPlanetPose(
          selectedPosition,
          selectedPlanet.focusDistance,
          selectedPlanet.orbitRadius,
        )
      }
    }

    desiredPoseRef.current = {
      maxDistance: nextPose.maxDistance,
      minDistance: nextPose.minDistance,
      position: nextPose.position.clone(),
      target: nextPose.target.clone(),
    }
    isTransitioningRef.current = true
  }, [getPlanetPosition, overviewPerspective, overviewPose, selectedPlanet, topOverviewPose, view])

  useFrame((_, delta) => {
    const desiredPose = desiredPoseRef.current

    if (session) {
      const xrRig = xrRigRef.current

      if (!xrRig) {
        return
      }

      const desiredRigPosition = desiredPose.position.clone()
      desiredRigPosition.y = Math.max(desiredRigPosition.y - 1.55, 0.25)
      xrRig.position.lerp(desiredRigPosition, computeDampFactor(delta, 2.4))
      xrRig.lookAt(desiredPose.target)

      if (xrRig.position.distanceToSquared(desiredRigPosition) < 0.08) {
        isTransitioningRef.current = false
      }

      return
    }

    const controls = controlsRef.current

    if (!controls) {
      return
    }

    const factor = computeDampFactor(delta, isTransitioningRef.current ? 3.8 : 2.2)
    camera.position.lerp(desiredPose.position, factor)
    controls.target.lerp(desiredPose.target, factor)
    controls.minDistance = THREE.MathUtils.damp(
      controls.minDistance,
      desiredPose.minDistance,
      4,
      delta,
    )
    controls.maxDistance = THREE.MathUtils.damp(
      controls.maxDistance,
      desiredPose.maxDistance,
      4,
      delta,
    )
    controls.update()

    if (isPoseSettled(camera.position, controls.target, desiredPose)) {
      isTransitioningRef.current = false
    }
  })

  return (
    <>
      <group ref={xrRigRef}>
        <XROrigin position={[0, 0, 0]} />
      </group>

      {!session && (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          enableRotate={!isTopDownOverview}
          enablePan={view === 'overview'}
          makeDefault
          maxDistance={isTopDownOverview ? topOverviewPose.maxDistance : overviewPose.maxDistance}
          maxPolarAngle={isTopDownOverview ? 0.12 : Math.PI / 1.96}
          minDistance={isTopDownOverview ? topOverviewPose.minDistance : overviewPose.minDistance}
          minPolarAngle={isTopDownOverview ? 0.01 : Math.PI / 10}
          target={[overviewPose.target.x, overviewPose.target.y, overviewPose.target.z]}
        />
      )}
    </>
  )
}
