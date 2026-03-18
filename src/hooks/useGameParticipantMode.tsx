import useContextPro from "./useContextPro";
import { getGameSessionConfig } from "./gameSession";

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

  const session = getGameSessionConfig(gameId);
  const isSinglePlayer = session?.participantCount === 1;
  const participantCount = isSinglePlayer ? 1 : 2;
  const primaryName =
    session?.participantLabels[0]?.trim() || user?.username?.trim() || fallbackPrimaryName;
  const secondaryName =
    session?.participantLabels[1]?.trim() || fallbackSecondaryName;

  return {
    session,
    isSinglePlayer,
    participantCount,
    primaryName,
    secondaryName,
    modeLabel: isSinglePlayer ? singleModeLabel : multiModeLabel,
  };
}
