import { useMemo, useState } from "react";
import type { InteractionType, ToolState } from "../types";

type InteractionCallbacks = {
  inspectPlant: () => void;
  onPlantSeed: () => void;
  onImproveSoil: () => void;
  onAddSunlight: () => void;
  onAddWater: () => void;
};

const toolMap: Record<Exclude<InteractionType, "inspect">, ToolState> = {
  seed: {
    id: "seed",
    label: "Urug'",
    instruction: "Urug'ni tanlang, keyin markazdagi tuvakka qo'llang.",
  },
  water: {
    id: "water",
    label: "Suv",
    instruction: "Suv idishini tanlang va tuvak ustida sug'orishni bajaring.",
  },
  sunlight: {
    id: "sunlight",
    label: "Quyosh",
    instruction: "Quyosh nurini tanlang va o'simlikka yorug'lik bering.",
  },
  soil: {
    id: "soil",
    label: "Tuproq",
    instruction: "Tuproq qopini tanlang va tuvakka qo'shing.",
  },
};

export function useVRInteractions(callbacks: InteractionCallbacks) {
  const [selectedTool, setSelectedTool] = useState<Exclude<InteractionType, "inspect"> | null>(
    "seed",
  );
  const [recentEffect, setRecentEffect] = useState<{
    token: number;
    type: Exclude<InteractionType, "inspect">;
  } | null>(null);

  const selectedToolMeta = useMemo(
    () => (selectedTool == null ? null : toolMap[selectedTool]),
    [selectedTool],
  );

  const activateTool = (tool: Exclude<InteractionType, "inspect">) => {
    setSelectedTool(tool);
  };

  const applySelectedToolToPot = () => {
    if (selectedTool == null) {
      callbacks.inspectPlant();
      return;
    }

    switch (selectedTool) {
      case "seed":
        callbacks.onPlantSeed();
        break;
      case "water":
        callbacks.onAddWater();
        break;
      case "sunlight":
        callbacks.onAddSunlight();
        break;
      case "soil":
        callbacks.onImproveSoil();
        break;
    }

    setRecentEffect({
      token: Date.now(),
      type: selectedTool,
    });

    if (selectedTool === "seed") {
      setSelectedTool("water");
    }
  };

  return {
    activateTool,
    applySelectedToolToPot,
    inspectPlant: callbacks.inspectPlant,
    recentEffect,
    selectedTool,
    selectedToolMeta,
    tools: Object.values(toolMap),
  };
}
