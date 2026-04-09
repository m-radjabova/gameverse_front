import { useEffect, useMemo, useRef, useState } from "react";
import type { Vector3 } from "three";
import type { ZooAnimal } from "../types";

type UseProximityTriggerParams = {
  animals: ZooAnimal[];
  playerPosition: Vector3;
  threshold?: number;
  onEnterAnimal?: (animal: ZooAnimal) => void;
};

export function useProximityTrigger({
  animals,
  playerPosition,
  threshold = 3,
  onEnterAnimal,
}: UseProximityTriggerParams) {
  const [activeAnimalId, setActiveAnimalId] = useState<string | null>(null);
  const lastActiveAnimalIdRef = useRef<string | null>(null);

  const nearestAnimal = useMemo(() => {
    let currentNearest: { animal: ZooAnimal; distance: number } | null = null;

    for (const animal of animals) {
      const dx = animal.position[0] - playerPosition.x;
      const dz = animal.position[2] - playerPosition.z;
      const distance = Math.hypot(dx, dz);

      if (distance <= threshold && (!currentNearest || distance < currentNearest.distance)) {
        currentNearest = { animal, distance };
      }
    }

    return currentNearest;
  }, [animals, playerPosition, threshold]);

  useEffect(() => {
    const nextId = nearestAnimal?.animal.id ?? null;
    setActiveAnimalId(nextId);

    if (nearestAnimal && lastActiveAnimalIdRef.current !== nearestAnimal.animal.id) {
      onEnterAnimal?.(nearestAnimal.animal);
    }

    lastActiveAnimalIdRef.current = nextId;
  }, [nearestAnimal, onEnterAnimal]);

  return {
    activeAnimalId,
    activeDistance: nearestAnimal?.distance ?? null,
  };
}
