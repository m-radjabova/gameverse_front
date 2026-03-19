const FAVORITES_KEY = "gameverse-favorites";
const FAVORITES_EVENT = "gameverse:favorites-updated";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getFavoriteGameIds(): string[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function setFavoriteGameIds(ids: string[]) {
  if (!canUseStorage()) return;
  const next = Array.from(new Set(ids));
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: next }));
}

export function toggleFavoriteGame(gameId: string) {
  const current = getFavoriteGameIds();
  const next = current.includes(gameId) ? current.filter((item) => item !== gameId) : [...current, gameId];
  setFavoriteGameIds(next);
  return next;
}

export function subscribeFavoriteGames(listener: (ids: string[]) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== FAVORITES_KEY) return;
    listener(getFavoriteGameIds());
  };

  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<string[]>).detail;
    listener(Array.isArray(detail) ? detail : getFavoriteGameIds());
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FAVORITES_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FAVORITES_EVENT, handleCustom);
  };
}
