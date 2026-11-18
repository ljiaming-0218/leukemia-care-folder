import { useCallback, useSyncExternalStore } from "react";

const queries = new Map<string, MediaQueryList>();

function getQuery(query: string): MediaQueryList {
  let match = queries.get(query);
  if (!match) {
    match = window.matchMedia(query);
    queries.set(query, match);
  }
  return match;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const match = getQuery(query);
      match.addEventListener("change", onChange);
      return () => match.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => getQuery(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
