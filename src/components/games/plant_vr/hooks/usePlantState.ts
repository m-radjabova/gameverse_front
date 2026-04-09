import { useEffect, useMemo, useState } from "react";
import { getStageDefinition, getStageForProgress } from "../data/stages";
import type {
  FeedbackMessage,
  InteractionType,
  PlantCareCounts,
  PlantStage,
  PlantStats,
} from "../types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const initialStats: PlantStats = {
  waterLevel: 10,
  sunlightLevel: 12,
  soilQuality: 32,
  health: 68,
  growthProgress: 0,
};

const initialCareCounts: PlantCareCounts = {
  waterActions: 0,
  sunlightActions: 0,
  soilActions: 0,
};

const createFeedback = (
  title: string,
  body: string,
  tone: FeedbackMessage["tone"],
  interactionType: InteractionType,
): FeedbackMessage => ({
  id: `${interactionType}-${Date.now()}`,
  title,
  body,
  tone,
  interactionType,
});

const evaluatePlant = (stats: PlantStats): PlantStats => {
  const hydrated = stats.waterLevel >= 35 && stats.waterLevel <= 72;
  const sunReady = stats.sunlightLevel >= 36 && stats.sunlightLevel <= 82;
  const soilReady = stats.soilQuality >= 48;

  const waterPenalty =
    stats.waterLevel < 20 ? 16 : stats.waterLevel > 88 ? 13 : stats.waterLevel < 35 ? 7 : 0;
  const sunlightPenalty =
    stats.sunlightLevel < 24
      ? 12
      : stats.sunlightLevel < 36
        ? 5
        : stats.sunlightLevel > 92
          ? 4
          : 0;
  const soilPenalty = stats.soilQuality < 28 ? 10 : stats.soilQuality < 48 ? 5 : 0;

  const careBonus = (hydrated ? 8 : 0) + (sunReady ? 8 : 0) + (soilReady ? 8 : 0);
  const health = clamp(58 + careBonus - waterPenalty - sunlightPenalty - soilPenalty);

  const progressBoost =
    stats.growthProgress >= 100
      ? 0
      : (hydrated ? 7 : 1) + (sunReady ? 6 : 1) + (soilReady ? 5 : 1) + (health >= 75 ? 4 : 0);

  return {
    waterLevel: clamp(stats.waterLevel),
    sunlightLevel: clamp(stats.sunlightLevel),
    soilQuality: clamp(stats.soilQuality),
    health,
    growthProgress: clamp(stats.growthProgress + progressBoost),
  };
};

export function usePlantState() {
  const [seedPlanted, setSeedPlanted] = useState(false);
  const [stats, setStats] = useState<PlantStats>(initialStats);
  const [stage, setStage] = useState<PlantStage>("seed");
  const [feedback, setFeedback] = useState<FeedbackMessage>(
    createFeedback(
      "VR issiqxona tayyor",
      "Avval urug'ni eking. Keyin suv, quyosh va tuproqni navbat bilan bering.",
      "lesson",
      "inspect",
    ),
  );
  const [careCounts, setCareCounts] = useState<PlantCareCounts>(initialCareCounts);

  useEffect(() => {
    if (!seedPlanted) {
      return;
    }

    const interval = window.setInterval(() => {
      setStats((current) => ({
        ...current,
        waterLevel: clamp(current.waterLevel - 1.5),
        sunlightLevel: clamp(current.sunlightLevel - 1.2),
        soilQuality: clamp(current.soilQuality - 0.4),
      }));
    }, 6500);

    return () => window.clearInterval(interval);
  }, [seedPlanted]);

  useEffect(() => {
    if (!seedPlanted) {
      return;
    }

    const nextStage = getStageForProgress(stats.growthProgress).stage;
    setStage((current) => {
      if (current === nextStage) {
        return current;
      }

      const definition = getStageDefinition(nextStage);
      setFeedback(
        createFeedback(
          `${definition.label} ochildi`,
          definition.tip,
          "mission",
          "inspect",
        ),
      );
      return nextStage;
    });
  }, [seedPlanted, stats.growthProgress]);

  const stageTip = useMemo(() => getStageDefinition(stage).tip, [stage]);

  const plantSeed = () => {
    if (seedPlanted) {
      setFeedback(
        createFeedback(
          "Urug' allaqachon ekilgan",
          "Endi parvarish omillarini muvozanatlab, urug'ni niholga aylantiring.",
          "lesson",
          "seed",
        ),
      );
      return;
    }

    setSeedPlanted(true);
    setStats(initialStats);
    setStage("seed");
    setFeedback(
        createFeedback(
          "Urug' ekildi",
          "Endi urug'ga suv, quyosh va yaxshi tuproq kerak.",
          "success",
          "seed",
        ),
    );
  };

  const addWater = () => {
    if (!seedPlanted) {
      setFeedback(
        createFeedback(
          "Avval urug'ni eking",
          "Sug'orish foydali bo'lishi uchun urug' pot ichiga joylashtirilgan bo'lishi kerak.",
          "warning",
          "water",
        ),
      );
      return;
    }

    setCareCounts((current) => ({
      ...current,
      waterActions: current.waterActions + 1,
    }));

    setStats((current) => {
      const nextStats = evaluatePlant({
        ...current,
        waterLevel: current.waterLevel + 20,
        sunlightLevel: current.sunlightLevel - 3,
        soilQuality: current.soilQuality - 1,
      });

      if (nextStats.waterLevel > 88) {
        setFeedback(
          createFeedback(
            "Suv ortiqcha bo'ldi",
            "Juda ko'p suv ildizga zarar yetkazishi mumkin.",
            "warning",
            "water",
          ),
        );
      } else {
        setFeedback(
          createFeedback(
            "Sug'orish bajarildi",
            "Suv urug'ning unib chiqishiga yordam beradi.",
            "success",
            "water",
          ),
        );
      }

      return nextStats;
    });
  };

  const addSunlight = () => {
    if (!seedPlanted) {
        setFeedback(
        createFeedback(
          "Urug' hali ekilmagan",
          "Avval urug'ni tuvakka eking.",
          "warning",
          "sunlight",
          ),
      );
      return;
    }

    setCareCounts((current) => ({
      ...current,
      sunlightActions: current.sunlightActions + 1,
    }));

    setStats((current) => {
      const nextStats = evaluatePlant({
        ...current,
        sunlightLevel: current.sunlightLevel + 18,
        waterLevel: current.waterLevel - 4,
      });

      if (nextStats.sunlightLevel < 30) {
        setFeedback(
          createFeedback(
            "Yorug'lik hali ham kam",
            "Quyosh kam bo'lsa o'simlik sekin o'sadi.",
            "warning",
            "sunlight",
          ),
        );
      } else {
        setFeedback(
          createFeedback(
            "Quyosh nuri berildi",
            "Quyosh o'simlikka oziqa tayyorlashga yordam beradi.",
            "success",
            "sunlight",
          ),
        );
      }

      return nextStats;
    });
  };

  const improveSoil = () => {
    if (!seedPlanted) {
      setFeedback(
        createFeedback(
          "Tuproqni tayyorlashdan oldin eking",
          "Urug' ekilgach, tuproqdagi oziqa sifati o'simlik rivojiga bevosita ta'sir qiladi.",
          "warning",
          "soil",
        ),
      );
      return;
    }

    setCareCounts((current) => ({
      ...current,
      soilActions: current.soilActions + 1,
    }));

    setStats((current) => {
      const nextStats = evaluatePlant({
        ...current,
        soilQuality: current.soilQuality + 16,
      });

      setFeedback(
        createFeedback(
          "Tuproq boyitildi",
          "Yaxshi tuproq o'simlikni tezroq o'stiradi.",
          "success",
          "soil",
        ),
      );

      return nextStats;
    });
  };

  const inspectPlant = () => {
    if (!seedPlanted) {
      setFeedback(
        createFeedback(
          "Mission boshlanishi",
          "Urug'ni eking va o'simlik holatini kuzating.",
          "lesson",
          "inspect",
        ),
      );
      return;
    }

    let body = stageTip;

    if (stats.waterLevel < 30) {
      body += " Suv kam.";
    } else if (stats.waterLevel > 85) {
      body += " Suv ortiqcha.";
    }

    if (stats.sunlightLevel < 35) {
      body += " Quyosh yetarli emas.";
    }

    if (stats.soilQuality < 45) {
      body += " Tuproq sifati past.";
    }

    if (stats.health >= 76) {
      body += " Holati yaxshi.";
    }

    setFeedback(createFeedback("O'simlik holati tekshirildi", body.trim(), "lesson", "inspect"));
  };

  const resetPlant = () => {
    setSeedPlanted(false);
    setStats(initialStats);
    setStage("seed");
    setCareCounts(initialCareCounts);
    setFeedback(
      createFeedback(
        "Simulyator reset qilindi",
        "Yana boshidan boshlang va bu safar suv, quyosh va tuproq orasidagi balansni yanada yaxshi ushlang.",
        "lesson",
        "inspect",
      ),
    );
  };

  return {
    addSunlight,
    addWater,
    careCounts,
    feedback,
    improveSoil,
    inspectPlant,
    plantSeed,
    resetPlant,
    seedPlanted,
    stage,
    stageTip,
    stats,
  };
}
