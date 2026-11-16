import { lazy, Suspense, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DemoBanner } from "@/src/components/DemoBanner";
import { SiteHeader } from "@/src/components/SiteHeader";
import { AssistantLauncher, AssistantPanel } from "@/src/components/AssistantPanel";
import { AssistantProvider } from "@/src/features/assistant/AssistantContext";
import { DocumentsProvider } from "@/src/features/documents/DocumentsContext";
import { LedgerProvider } from "@/src/features/ledger/LedgerContext";
import { AidRuleProvider } from "@/src/features/prepare/AidRuleContext";
import { PrepareStateProvider } from "@/src/features/prepare/PrepareStateContext";
import { DemoWorkspaceLoader } from "@/src/features/workspace/DemoWorkspaceLoader";
import { useWorkspace, WorkspaceProvider } from "@/src/features/workspace/WorkspaceContext";
import { scrollToElement } from "@/src/lib/scrollToElement";

const HomePage = lazy(() => import("@/src/pages/HomePage"));
const LearnPage = lazy(() => import("@/src/pages/LearnPage"));
const ResourcesPage = lazy(() => import("@/src/pages/ResourcesPage"));
const RoutePage = lazy(() => import("@/src/pages/RoutePage"));
const ReceiptsPage = lazy(() => import("@/src/pages/ReceiptsPage"));
const LedgerPage = lazy(() => import("@/src/pages/LedgerPage"));
const PreparePage = lazy(() => import("@/src/pages/PreparePage"));
const StoriesPage = lazy(() => import("@/src/pages/StoriesPage"));
const FundraisingPage = lazy(() => import("@/src/pages/FundraisingPage"));
const AboutPage = lazy(() => import("@/src/pages/AboutPage"));

function ScrollToAnchor() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let attempts = 0;
    let timer = 0;
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const target = document.getElementById(hash.slice(1));
      if (target) {
        scrollToElement(target);
        return;
      }
      if (attempts >= 40) return;
      attempts += 1;
      timer = window.setTimeout(tryScroll, 50);
    };
    tryScroll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}

function WorkspaceRoutes() {
  const { mode } = useWorkspace();

  return (
    <Suspense
      fallback={
        <p className="route-loading" role="status">
          正在打开页面…
        </p>
      }
    >
      <Routes key={mode}>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/prepare" element={<PreparePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/fundraising" element={<FundraisingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AssistantProvider>
      <WorkspaceProvider>
        <AidRuleProvider>
        <DocumentsProvider>
          <LedgerProvider>
            <PrepareStateProvider>
            <DemoWorkspaceLoader />
            <a
              className="skip-link"
              href="#main-content"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById("main-content")?.focus();
              }}
            >
              跳到主要内容
            </a>
            <ScrollToAnchor />
            <div className="site-shell">
              <SiteHeader />
              <DemoBanner />
              <main id="main-content" className="site-main" tabIndex={-1}>
                <WorkspaceRoutes />
              </main>
              <footer className="site-footer">
                <div className="site-footer__inner">
                  <span>儿童白血病就医资料夹</span>
                  <span>文件在本机处理 · 公开政策以来源原文为准</span>
                  <Link to="/about">资料来源与说明</Link>
                </div>
              </footer>
              <AssistantLauncher />
              <AssistantPanel />
            </div>
          </PrepareStateProvider>
        </LedgerProvider>
      </DocumentsProvider>
        </AidRuleProvider>
    </WorkspaceProvider>
  </AssistantProvider>
  );
}
