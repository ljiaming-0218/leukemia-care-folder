import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const workspaceModes = ["real", "demo"] as const;
export type WorkspaceMode = (typeof workspaceModes)[number];

export type DemoStatus = "idle" | "loading" | "ready" | "error";

type WorkspaceValue = {
  mode: WorkspaceMode;
  isDemo: boolean;
  modeLabel: string;
  setMode: (mode: WorkspaceMode) => void;
  enterDemo: () => void;
  exitDemo: () => void;
  reloadDemo: () => void;
  demoStatus: DemoStatus;
  demoError: string;
  beginDemoLoad: () => void;
  finishDemoLoad: () => void;
  failDemoLoad: (message: string) => void;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function workspaceLabel(mode: WorkspaceMode): string {
  return mode === "demo" ? "演示工作区" : "真实工作区";
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>("real");
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [demoError, setDemoError] = useState("");

  const enterDemo = useCallback(() => {
    setModeState("demo");
    setDemoStatus((previous) => (previous === "error" ? "idle" : previous));
    setDemoError("");
  }, []);

  const exitDemo = useCallback(() => {
    setModeState("real");
  }, []);

  const reloadDemo = useCallback(() => {
    setModeState("demo");
    setDemoStatus("idle");
    setDemoError("");
  }, []);

  const beginDemoLoad = useCallback(() => {
    setDemoStatus("loading");
    setDemoError("");
  }, []);

  const finishDemoLoad = useCallback(() => {
    setDemoStatus("ready");
  }, []);

  const failDemoLoad = useCallback((message: string) => {
    setDemoStatus("error");
    setDemoError(message);
  }, []);

  const value = useMemo<WorkspaceValue>(
    () => ({
      mode,
      isDemo: mode === "demo",
      modeLabel: workspaceLabel(mode),
      setMode: setModeState,
      enterDemo,
      exitDemo,
      reloadDemo,
      demoStatus,
      demoError,
      beginDemoLoad,
      finishDemoLoad,
      failDemoLoad,
    }),
    [
      mode,
      enterDemo,
      exitDemo,
      reloadDemo,
      demoStatus,
      demoError,
      beginDemoLoad,
      finishDemoLoad,
      failDemoLoad,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) {
    throw new Error("useWorkspace 必须在 WorkspaceProvider 内使用");
  }
  return value;
}
