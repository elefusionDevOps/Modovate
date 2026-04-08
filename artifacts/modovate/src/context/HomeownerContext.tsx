import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";
import type { HomeProfile, IntakeAnswers, UpgradeCategory } from "@/lib/energy-calculator";

export interface HomeownerState {
  address: string;
  lat: number | null;
  lng: number | null;
  intakeAnswers: IntakeAnswers | null;
  homeProfile: HomeProfile | null;
  selectedUpgrades: UpgradeCategory[];
  selectedProducts: Record<string, string>;
  currentScreen: number;
}

interface HomeownerContextType extends HomeownerState {
  setAddress: (address: string, lat?: number, lng?: number) => void;
  setIntakeAnswers: (answers: IntakeAnswers) => void;
  setHomeProfile: (profile: HomeProfile) => void;
  addUpgrade: (category: UpgradeCategory) => void;
  removeUpgrade: (category: UpgradeCategory) => void;
  toggleUpgrade: (category: UpgradeCategory) => void;
  setSelectedProduct: (category: string, productId: string) => void;
  setCurrentScreen: (screen: number) => void;
  resetState: () => void;
}

const STORAGE_KEY = "modovate_homeowner_state";

const defaultState: HomeownerState = {
  address: "",
  lat: null,
  lng: null,
  intakeAnswers: null,
  homeProfile: null,
  selectedUpgrades: [],
  selectedProducts: {},
  currentScreen: 1,
};

function loadState(): HomeownerState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: HomeownerState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const HomeownerContext = createContext<HomeownerContextType | null>(null);

export function HomeownerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HomeownerState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setAddress = useCallback((address: string, lat?: number, lng?: number) => {
    setState((prev) => ({ ...prev, address, lat: lat ?? null, lng: lng ?? null }));
  }, []);

  const setIntakeAnswers = useCallback((answers: IntakeAnswers) => {
    setState((prev) => ({ ...prev, intakeAnswers: answers }));
  }, []);

  const setHomeProfile = useCallback((profile: HomeProfile) => {
    setState((prev) => ({ ...prev, homeProfile: profile }));
  }, []);

  const addUpgrade = useCallback((category: UpgradeCategory) => {
    setState((prev) => {
      if (prev.selectedUpgrades.includes(category)) return prev;
      return { ...prev, selectedUpgrades: [...prev.selectedUpgrades, category] };
    });
  }, []);

  const removeUpgrade = useCallback((category: UpgradeCategory) => {
    setState((prev) => ({
      ...prev,
      selectedUpgrades: prev.selectedUpgrades.filter((u) => u !== category),
    }));
  }, []);

  const toggleUpgrade = useCallback((category: UpgradeCategory) => {
    setState((prev) => {
      if (prev.selectedUpgrades.includes(category)) {
        return { ...prev, selectedUpgrades: prev.selectedUpgrades.filter((u) => u !== category) };
      }
      return { ...prev, selectedUpgrades: [...prev.selectedUpgrades, category] };
    });
  }, []);

  const setSelectedProduct = useCallback((category: string, productId: string) => {
    setState((prev) => ({
      ...prev,
      selectedProducts: { ...prev.selectedProducts, [category]: productId },
    }));
  }, []);

  const setCurrentScreen = useCallback((screen: number) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <HomeownerContext.Provider
      value={{
        ...state,
        setAddress,
        setIntakeAnswers,
        setHomeProfile,
        addUpgrade,
        removeUpgrade,
        toggleUpgrade,
        setSelectedProduct,
        setCurrentScreen,
        resetState,
      }}
    >
      {children}
    </HomeownerContext.Provider>
  );
}

export function useHomeowner(): HomeownerContextType {
  const context = useContext(HomeownerContext);
  if (!context) {
    throw new Error("useHomeowner must be used within HomeownerProvider");
  }
  return context;
}
