import { useEffect, useMemo, useState } from "react";
import { PLANT_VR_MISSIONS } from "../data/missions";
import type { FeedbackMessage, Mission, MissionSnapshot } from "../types";

const createMissionFeedback = (mission: Mission): FeedbackMessage => ({
  id: `mission-${mission.id}-${Date.now()}`,
  title: `Vazifa bajarildi: ${mission.title}`,
  body: `${mission.description} ${mission.learningGoal}`,
  tone: "mission",
  interactionType: "inspect",
});

const missionCompleted = (missionId: string, snapshot: MissionSnapshot) => {
  switch (missionId) {
    case "plant-seed":
      return snapshot.seedPlanted;
    case "first-water":
      return snapshot.careCounts.waterActions > 0;
    case "first-sun":
      return snapshot.careCounts.sunlightActions > 0;
    case "soil-upgrade":
      return snapshot.careCounts.soilActions > 0;
    case "reach-sprout":
      return (
        snapshot.stage === "sprout" ||
        snapshot.stage === "young plant" ||
        snapshot.stage === "mature plant" ||
        snapshot.stage === "flowering plant"
      );
    case "healthy-growth":
      return snapshot.stats.health >= 75 && snapshot.stats.growthProgress >= 55;
    case "full-bloom":
      return snapshot.stage === "flowering plant";
    default:
      return false;
  }
};

export function useMissionProgress(snapshot: MissionSnapshot) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [missionFeedback, setMissionFeedback] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    const nextMission = PLANT_VR_MISSIONS[completedIds.length];

    if (!nextMission || !missionCompleted(nextMission.id, snapshot)) {
      return;
    }

    setCompletedIds((current) => {
      if (current.includes(nextMission.id)) {
        return current;
      }
      return [...current, nextMission.id];
    });
    setMissionFeedback(createMissionFeedback(nextMission));
  }, [completedIds, snapshot]);

  const missions = useMemo(
    () =>
      PLANT_VR_MISSIONS.map((mission, index) => ({
        ...mission,
        completed: completedIds.includes(mission.id),
        active: index === completedIds.length,
      })),
    [completedIds],
  );

  const activeMission = missions.find((mission) => mission.active) ?? null;

  return {
    activeMission,
    completedCount: completedIds.length,
    completedIds,
    missionFeedback,
    missions,
    setMissionFeedback,
  };
}
