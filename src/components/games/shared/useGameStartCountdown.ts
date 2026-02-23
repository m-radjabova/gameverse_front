import { useCallback, useEffect, useRef, useState } from "react";

type CountdownStep = 3 | 2 | 1 | "BOSHLANDI";

const COUNTDOWN_STEPS: CountdownStep[] = [3, 2, 1, "BOSHLANDI"];
const STEP_DURATION_MS = 700;
const FINAL_STEP_DURATION_MS = 500;

export function useGameStartCountdown() {
  const [countdownValue, setCountdownValue] = useState<CountdownStep | null>(null);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const runStartCountdown = useCallback(
    (onStart: () => void) => {
      if (timeoutRef.current !== null || countdownVisible) return;

      setCountdownVisible(true);
      setCountdownValue(COUNTDOWN_STEPS[0]);

      let stepIndex = 0;

      const tick = () => {
        stepIndex += 1;

        if (stepIndex < COUNTDOWN_STEPS.length) {
          setCountdownValue(COUNTDOWN_STEPS[stepIndex]);
          timeoutRef.current = window.setTimeout(
            tick,
            stepIndex === COUNTDOWN_STEPS.length - 1 ? FINAL_STEP_DURATION_MS : STEP_DURATION_MS,
          );
          return;
        }

        clearTimer();
        setCountdownVisible(false);
        setCountdownValue(null);
        onStart();
      };

      timeoutRef.current = window.setTimeout(tick, STEP_DURATION_MS);
    },
    [clearTimer, countdownVisible],
  );

  return { countdownValue, countdownVisible, runStartCountdown };
}
