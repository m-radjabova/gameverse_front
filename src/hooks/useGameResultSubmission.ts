import { useEffect, useRef } from "react";
import { useSubmitGameResultMutation } from "./useGameLeaderboard";
import useContextPro from "./useContextPro";

type Entry = {
  participant_name: string;
  participant_mode: string;
  score: number;
  metadata?: Record<string, unknown>;
};

export function useGameResultSubmission(
  enabled: boolean,
  gameKey: string,
  entries: Entry[],
) {
  const { state: { user, isLoading: isUserLoading } } = useContextPro();
  const submittedRef = useRef<string | null>(null);
  const submitResultMutation = useSubmitGameResultMutation(gameKey);
  const canSubmit = enabled && !isUserLoading && Boolean(user?.id);

  useEffect(() => {
    if (!canSubmit || entries.length === 0) {
      submittedRef.current = null;
      return;
    }

    const fingerprint = JSON.stringify(
      entries.map((entry) => ({
        n: entry.participant_name,
        m: entry.participant_mode,
        s: entry.score,
      })),
    );

    if (submittedRef.current === fingerprint) {
      return;
    }

    submittedRef.current = fingerprint;
    void Promise.all(entries.map((entry) => submitResultMutation.mutateAsync(entry)));
  }, [canSubmit, entries, submitResultMutation]);
}
