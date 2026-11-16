import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  demoPlace,
  emptyPlace,
  formatPlace,
  placePolicyRegions,
  routeStoreKey,
  treatedPlaces,
  type InsuredPlace,
  type TreatedPlace,
} from "@/src/domain/route";
import type { PolicyRegion } from "@/src/domain/schemas";
import { useWorkspace, type WorkspaceMode } from "@/src/features/workspace/WorkspaceContext";
import { loadValue, saveValue } from "@/src/lib/localStore";

export const placeStoreKey = "real:place";

type FamilyPlace = { place: InsuredPlace; treated: TreatedPlace };

const emptyFamilyPlace: FamilyPlace = { place: emptyPlace, treated: "本省医院" };
const demoFamilyPlace: FamilyPlace = { place: demoPlace, treated: "本省医院" };

function readStored(value: Partial<FamilyPlace> | null | undefined): FamilyPlace | null {
  if (!value?.place) return null;
  const treated = treatedPlaces.includes(value.treated as TreatedPlace)
    ? (value.treated as TreatedPlace)
    : "本省医院";
  return { place: { ...emptyPlace, ...value.place }, treated };
}

type PlaceValue = {
  place: InsuredPlace;
  treated: TreatedPlace;
  placeLabel: string;
  regions: Set<PolicyRegion> | null;
  setPlace: (place: InsuredPlace) => void;
  setTreated: (treated: TreatedPlace) => void;
  clearPlace: () => void;
  loadDemoPlace: () => void;
};

const PlaceContext = createContext<PlaceValue | null>(null);

export function PlaceProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const [byMode, setByMode] = useState<Record<WorkspaceMode, FamilyPlace>>({
    real: emptyFamilyPlace,
    demo: demoFamilyPlace,
  });
  const [hydrated, setHydrated] = useState(false);
  const touchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored =
        readStored(await loadValue<FamilyPlace>(placeStoreKey)) ??
        readStored(await loadValue<FamilyPlace>(routeStoreKey));
      if (cancelled) return;
      if (stored && !touchedRef.current) setByMode((previous) => ({ ...previous, real: stored }));
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveValue(placeStoreKey, byMode.real);
  }, [hydrated, byMode.real]);

  const update = useCallback(
    (change: (current: FamilyPlace) => FamilyPlace) => {
      if (mode === "real") touchedRef.current = true;
      setByMode((previous) => ({ ...previous, [mode]: change(previous[mode]) }));
    },
    [mode],
  );

  const value = useMemo<PlaceValue>(() => {
    const current = byMode[mode];
    return {
      place: current.place,
      treated: current.treated,
      placeLabel: formatPlace(current.place),
      regions: placePolicyRegions(current.place),
      setPlace: (place) => update((previous) => ({ ...previous, place })),
      setTreated: (treated) => update((previous) => ({ ...previous, treated })),
      clearPlace: () => update(() => emptyFamilyPlace),
      loadDemoPlace: () => setByMode((previous) => ({ ...previous, demo: demoFamilyPlace })),
    };
  }, [byMode, mode, update]);

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>;
}

export function usePlace(): PlaceValue {
  const value = useContext(PlaceContext);
  if (!value) throw new Error("usePlace 必须在 PlaceProvider 内使用");
  return value;
}
