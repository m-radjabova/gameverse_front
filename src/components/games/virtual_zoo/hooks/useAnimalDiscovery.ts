import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "gameverse-virtual-zoo-discovery";

function readStoredDiscoveries() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useAnimalDiscovery() {
  const [discoveredAnimalIds, setDiscoveredAnimalIds] = useState<string[]>(() => readStoredDiscoveries());
  const [lastDiscoveredAnimalId, setLastDiscoveredAnimalId] = useState<string | null>(null);

  const discoveredAnimalSet = useMemo(() => new Set(discoveredAnimalIds), [discoveredAnimalIds]);

  const discoverAnimal = useCallback((animalId: string) => {
    let discovered = false;

    setDiscoveredAnimalIds((current) => {
      if (current.includes(animalId)) {
        return current;
      }

      discovered = true;
      const next = [...current, animalId];

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }

      return next;
    });

    if (discovered) {
      setLastDiscoveredAnimalId(animalId);
    }
  }, []);

  const resetDiscovery = useCallback(() => {
    setDiscoveredAnimalIds([]);
    setLastDiscoveredAnimalId(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    discoveredAnimalIds,
    discoveredAnimalSet,
    discoverAnimal,
    lastDiscoveredAnimalId,
    resetDiscovery,
  };
}
