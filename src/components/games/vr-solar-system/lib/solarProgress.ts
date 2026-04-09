export interface SolarProgress {
  lastVisitedPlanetId: string | null
  visitedPlanetIds: string[]
  lastPlayedAt: number | null
}

const STORAGE_KEY = 'solar-system-vr-progress'

const DEFAULT_PROGRESS: SolarProgress = {
  lastVisitedPlanetId: null,
  visitedPlanetIds: [],
  lastPlayedAt: null,
}

export function readSolarProgress(): SolarProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return DEFAULT_PROGRESS
    }

    const parsed = JSON.parse(raw) as Partial<SolarProgress>

    return {
      lastVisitedPlanetId: parsed.lastVisitedPlanetId ?? null,
      visitedPlanetIds: Array.isArray(parsed.visitedPlanetIds) ? parsed.visitedPlanetIds : [],
      lastPlayedAt: typeof parsed.lastPlayedAt === 'number' ? parsed.lastPlayedAt : null,
    }
  } catch {
    return DEFAULT_PROGRESS
  }
}

export function writeSolarProgress(progress: SolarProgress) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function touchSolarProgress(progress: SolarProgress): SolarProgress {
  return {
    ...progress,
    lastPlayedAt: Date.now(),
  }
}
