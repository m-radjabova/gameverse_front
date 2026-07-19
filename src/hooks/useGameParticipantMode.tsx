import { useState } from "react";
import useContextPro from "./useContextPro";
import { getGameSessionConfig, saveGameSessionConfig } from "./gameSession";

type Options = {
  gameId: string;
  fallbackPrimaryName?: string;
  fallbackSecondaryName?: string;
  singleModeLabel?: string;
  multiModeLabel?: string;
};

export function useGameParticipantMode({
  gameId,
  fallbackPrimaryName = "O'YINCHI 1",
  fallbackSecondaryName = "O'YINCHI 2",
  singleModeLabel = "1 o'yinchi",
  multiModeLabel = "2 o'yinchi",
}: Options) {
  const {
    state: { user },
  } = useContextPro();

  const initialSession = getGameSessionConfig(gameId);
  const [selectedParticipantCount, setSelectedParticipantCount] = useState<number>(
    Math.max(1, initialSession?.participantCount ?? 2),
  );
  const session = getGameSessionConfig(gameId);
  const isSinglePlayer = selectedParticipantCount === 1;
  const participantCount = Math.max(1, selectedParticipantCount);
  const registeredName = user?.username?.trim();
  const primaryName =
    (isSinglePlayer ? registeredName : session?.participantLabels[0]?.trim()) ||
    registeredName ||
    fallbackPrimaryName;
  const secondaryName =
    session?.participantLabels[1]?.trim() || fallbackSecondaryName;

  const selectParticipantCount = (count: number) => {
    const normalizedCount = Math.max(1, Math.floor(count));
    const currentSession = getGameSessionConfig(gameId);
    const nextPrimaryName =
      currentSession?.participantLabels[0]?.trim() || registeredName || fallbackPrimaryName;
    const nextSecondaryName =
      currentSession?.participantLabels[1]?.trim() || fallbackSecondaryName;
    const participantLabel = currentSession?.participantLabel ?? "o'yinchi";
    const participantLabels = Array.from({ length: normalizedCount }, (_, index) => {
      if (index === 0) return nextPrimaryName;
      if (index === 1) return nextSecondaryName;
      return currentSession?.participantLabels[index]?.trim()
        || `${participantLabel.toUpperCase()} ${index + 1}`;
    });

    saveGameSessionConfig({
      gameId,
      participantCount: normalizedCount,
      participantType: currentSession?.participantType ?? "player",
      participantLabel,
      participantLabels,
      questionDifficulty: currentSession?.questionDifficulty ?? "easy",
      selectedAt: new Date().toISOString(),
    });
    setSelectedParticipantCount(normalizedCount);
  };

  return {
    session,
    isSinglePlayer,
    participantCount,
    primaryName,
    secondaryName,
    modeLabel: isSinglePlayer ? singleModeLabel : multiModeLabel,
    selectParticipantCount,
  };
}
