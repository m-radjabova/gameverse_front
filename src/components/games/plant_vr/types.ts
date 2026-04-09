export type PlantStage =
  | "seed"
  | "sprout"
  | "young plant"
  | "mature plant"
  | "flowering plant";

export type InteractionType =
  | "seed"
  | "water"
  | "sunlight"
  | "soil"
  | "inspect";

export type FeedbackTone = "success" | "warning" | "lesson" | "mission";

export type PlantStats = {
  waterLevel: number;
  sunlightLevel: number;
  soilQuality: number;
  health: number;
  growthProgress: number;
};

export type PlantCareCounts = {
  waterActions: number;
  sunlightActions: number;
  soilActions: number;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  learningGoal: string;
};

export type FeedbackMessage = {
  id: string;
  title: string;
  body: string;
  tone: FeedbackTone;
  interactionType: InteractionType;
};

export type StageDefinition = {
  stage: PlantStage;
  minProgress: number;
  label: string;
  tip: string;
  milestone: string;
};

export type ToolState = {
  id: InteractionType;
  label: string;
  instruction: string;
};

export type MissionSnapshot = {
  seedPlanted: boolean;
  stage: PlantStage;
  stats: PlantStats;
  careCounts: PlantCareCounts;
};
