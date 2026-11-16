import { useWorkspace } from "@/src/features/workspace/WorkspaceContext";

export function DemoBanner() {
  const { mode, demoStatus, demoError, exitDemo, reloadDemo } = useWorkspace();
  if (mode !== "demo") return null;

  return (
    <div className="demo-banner" role="region" aria-label="演示工作区">
      <p className="demo-banner__text">
        <span className="demo-banner__tag">演示工作区</span>
        票据、金额和材料均为虚构数据，与真实工作区分开保存和导出。
      </p>
      <div className="demo-banner__actions">
        {demoStatus === "loading" && (
          <span className="demo-banner__state" role="status">
            正在载入示例…
          </span>
        )}
        {demoStatus === "error" && (
          <span className="demo-banner__state" role="alert">
            {demoError}
          </span>
        )}
        <button type="button" className="btn btn--ghost btn--small" onClick={reloadDemo}>
          重新载入示例
        </button>
        <button type="button" className="btn btn--primary btn--small" onClick={exitDemo}>
          返回真实工作区
        </button>
      </div>
    </div>
  );
}
