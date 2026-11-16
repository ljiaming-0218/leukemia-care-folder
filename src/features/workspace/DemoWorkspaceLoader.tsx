import { useEffect, useRef } from "react";
import { useDocuments } from "@/src/features/documents/DocumentsContext";
import { useLedger } from "@/src/features/ledger/LedgerContext";
import { usePlace } from "@/src/features/place/PlaceContext";
import { usePrepareState } from "@/src/features/prepare/PrepareStateContext";
import { buildDemoWorkspace } from "./demoWorkspace";
import { useWorkspace } from "./WorkspaceContext";

export function DemoWorkspaceLoader() {
  const { mode, demoStatus, beginDemoLoad, finishDemoLoad, failDemoLoad } = useWorkspace();
  const { loadDemoDocuments } = useDocuments();
  const { loadDemoEntries } = useLedger();
  const { loadDemoPrepare } = usePrepareState();
  const { loadDemoPlace } = usePlace();
  const loadingRef = useRef(false);

  useEffect(() => {
    if (mode !== "demo" || demoStatus !== "idle" || loadingRef.current) return;
    loadingRef.current = true;
    beginDemoLoad();
    buildDemoWorkspace()
      .then((data) => {
        loadDemoDocuments(data.docs);
        loadDemoEntries(data.entries);
        loadDemoPrepare(data.prepareStates, data.prepareLinks);
        loadDemoPlace();
        finishDemoLoad();
      })
      .catch((error: unknown) => {
        failDemoLoad(
          error instanceof Error
            ? `${error.message}，请检查网络后重试。`
            : "演示数据加载失败，请重试。",
        );
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [
    mode,
    demoStatus,
    beginDemoLoad,
    failDemoLoad,
    finishDemoLoad,
    loadDemoDocuments,
    loadDemoEntries,
    loadDemoPrepare,
    loadDemoPlace,
  ]);

  return null;
}
