import { useCallback, useMemo, useState } from 'react'
import {
  primarySolarSystemPlanets,
  solarSystemPlanets,
  type SolarSystemPlanet,
} from '../data'
import {
  readSolarProgress,
  touchSolarProgress,
  writeSolarProgress,
  type SolarProgress,
} from '../lib/solarProgress'

export type SolarSystemView = 'overview' | 'focus'
export type SolarOverviewPerspective = 'angled' | 'top'

interface UseSolarSystemStateResult {
  planets: SolarSystemPlanet[]
  overviewPerspective: SolarOverviewPerspective
  progress: SolarProgress
  selectedPlanet: SolarSystemPlanet | null
  selectedPlanetId: string | null
  view: SolarSystemView
  visitedPlanetIds: string[]
  visitedPrimaryCount: number
  markSessionActive: () => void
  selectPlanet: (planetId: string) => void
  returnToSystem: () => void
  goToNextPlanet: () => void
  goToPreviousPlanet: () => void
  setOverviewPerspective: (perspective: SolarOverviewPerspective) => void
}

export function useSolarSystemState(): UseSolarSystemStateResult {
  const [progress, setProgress] = useState<SolarProgress>(() => readSolarProgress())
  const [overviewPerspective, setOverviewPerspective] = useState<SolarOverviewPerspective>('angled')
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null)
  const [view, setView] = useState<SolarSystemView>('overview')

  const selectedPlanet = useMemo(
    () => solarSystemPlanets.find((planet) => planet.id === selectedPlanetId) ?? null,
    [selectedPlanetId],
  )

  const visitedPrimaryCount = useMemo(
    () =>
      progress.visitedPlanetIds.filter((planetId) =>
        primarySolarSystemPlanets.some((planet) => planet.id === planetId),
      ).length,
    [progress.visitedPlanetIds],
  )

  const updateProgress = useCallback((updater: (current: SolarProgress) => SolarProgress) => {
    setProgress((current) => {
      const nextProgress = updater(current)
      writeSolarProgress(nextProgress)
      return nextProgress
    })
  }, [])

  const persistSelection = useCallback((planetId: string) => {
    updateProgress((current) => {
      const nextVisitedPlanetIds = current.visitedPlanetIds.includes(planetId)
        ? current.visitedPlanetIds
        : [...current.visitedPlanetIds, planetId]

      return touchSolarProgress({
        lastVisitedPlanetId: planetId,
        visitedPlanetIds: nextVisitedPlanetIds,
        lastPlayedAt: current.lastPlayedAt,
      })
    })
  }, [updateProgress])

  const selectPlanet = useCallback((planetId: string) => {
    if (!solarSystemPlanets.some((planet) => planet.id === planetId)) {
      return
    }

    setSelectedPlanetId(planetId)
    setView('focus')
    persistSelection(planetId)
  }, [persistSelection])

  const returnToSystem = useCallback(() => {
    setView('overview')
    setSelectedPlanetId(null)
  }, [])

  const moveSelection = useCallback((direction: 'next' | 'previous') => {
    const list = solarSystemPlanets
    const currentIndex = list.findIndex((planet) => planet.id === selectedPlanetId)
    const baseIndex = currentIndex >= 0 ? currentIndex : 0
    const nextIndex =
      direction === 'next'
        ? (baseIndex + 1) % list.length
        : (baseIndex - 1 + list.length) % list.length

    selectPlanet(list[nextIndex].id)
  }, [selectPlanet, selectedPlanetId])

  const markSessionActive = useCallback(
    () => updateProgress((current) => touchSolarProgress(current)),
    [updateProgress],
  )

  return {
    goToNextPlanet: () => moveSelection('next'),
    goToPreviousPlanet: () => moveSelection('previous'),
    markSessionActive,
    overviewPerspective,
    planets: solarSystemPlanets,
    progress,
    returnToSystem,
    selectPlanet,
    selectedPlanet,
    selectedPlanetId,
    setOverviewPerspective,
    view,
    visitedPlanetIds: progress.visitedPlanetIds,
    visitedPrimaryCount,
  }
}
