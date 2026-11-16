import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DemoBanner } from "@/src/components/DemoBanner";
import { SiteHeader } from "@/src/components/SiteHeader";
import { AssistantLauncher, AssistantPanel } from "@/src/components/AssistantPanel";
import { AssistantProvider } from "@/src/features/assistant/AssistantContext";
import { DocumentsProvider } from "@/src/features/documents/DocumentsContext";
import { LedgerProvider } from "@/src/features/ledger/LedgerContext";
import { PrepareStateProvider } from "@/src/features/prepare/PrepareStateContext";
import { DemoWorkspaceLoader } from "@/src/features/workspace/DemoWorkspaceLoader";
import { WorkspaceProvider } from "@/src/features/workspace/WorkspaceContext";
import HomePage from "@/src/pages/HomePage";
import LearnPage from "@/src/pages/LearnPage";
import ResourcesPage from "@/src/pages/ResourcesPage";
import ReceiptsPage from "@/src/pages/ReceiptsPage";
import LedgerPage from "@/src/pages/LedgerPage";
import PreparePage from "@/src/pages/PreparePage";
import StoriesPage from "@/src/pages/StoriesPage";
import AboutPage from "@/src/pages/AboutPage";
import { scrollToElement } from "@/src/lib/scrollToElement";

function ScrollToAnchor() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        scrollToElement(target);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <AssistantProvider>
      <WorkspaceProvider>
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
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/learn" element={<LearnPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/receipts" element={<ReceiptsPage />} />
                  <Route path="/ledger" element={<LedgerPage />} />
                  <Route path="/prepare" element={<PreparePage />} />
                  <Route path="/stories" element={<StoriesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
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
    </WorkspaceProvider>
  </AssistantProvider>
  );
}
