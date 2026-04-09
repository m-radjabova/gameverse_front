import * as THREE from 'three'

export interface CameraPose {
  position: THREE.Vector3
  target: THREE.Vector3
  minDistance: number
  maxDistance: number
}

const OVERVIEW_POSITION = new THREE.Vector3(0, 34, 118)
const OVERVIEW_TOP_POSITION = new THREE.Vector3(0, 146, 0.12)
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0)

export function createOverviewPose(): CameraPose {
  return {
    maxDistance: 180,
    minDistance: 34,
    position: OVERVIEW_POSITION.clone(),
    target: OVERVIEW_TARGET.clone(),
  }
}

export function createTopOverviewPose(): CameraPose {
  return {
    maxDistance: 210,
    minDistance: 54,
    position: OVERVIEW_TOP_POSITION.clone(),
    target: OVERVIEW_TARGET.clone(),
  }
}

export function createPlanetPose(
  planetPosition: THREE.Vector3,
  focusDistance: number,
  orbitRadius: number,
): CameraPose {
  const radialDirection = planetPosition.clone().normalize()

  if (radialDirection.lengthSq() < 0.001) {
    radialDirection.set(0.24, 0.18, 1).normalize()
  }

  const sideDirection = new THREE.Vector3(-radialDirection.z, 0, radialDirection.x)
    .normalize()
    .multiplyScalar(focusDistance * 0.34)

  const lift = new THREE.Vector3(0, focusDistance * 0.2, 0)
  const offset = radialDirection
    .clone()
    .multiplyScalar(focusDistance * 1.28)
    .add(sideDirection)
    .add(lift)

  return {
    maxDistance: Math.max(focusDistance * 3.4, Math.min(orbitRadius * 0.9, focusDistance * 5.4)),
    minDistance: Math.max(2.8, focusDistance * 0.84),
    position: planetPosition.clone().add(offset),
    target: planetPosition.clone(),
  }
}

export function computeDampFactor(delta: number, smoothing = 3.4) {
  return 1 - Math.exp(-smoothing * delta)
}

export function isPoseSettled(
  currentPosition: THREE.Vector3,
  currentTarget: THREE.Vector3,
  desiredPose: CameraPose,
) {
  return (
    currentPosition.distanceToSquared(desiredPose.position) < 0.02 &&
    currentTarget.distanceToSquared(desiredPose.target) < 0.02
  )
}
