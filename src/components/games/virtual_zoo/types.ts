export type AnimalData = {
  id: string;
  name: string;
  food: string;
  habitat: string;
  behavior: string;
  fact: string;
  position: [number, number, number];
};

export type ZooAnimal = AnimalData & {
  accent: string;
  secondaryAccent: string;
  zoneLabel: string;
  speciesGroup: "mammal" | "bird" | "reptile";
  dietType: "carnivore" | "herbivore" | "omnivore";
};

export type DiscoveryMission = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

export type ZooSceneMode = "day" | "night";
