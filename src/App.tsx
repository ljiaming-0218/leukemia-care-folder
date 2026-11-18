import { lazy, Suspense, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SiteHeader } from "@/src/components/story/SiteHeader";
import { SiteTabBar } from "@/src/components/story/SiteTabBar";
import { scrollToElement } from "@/src/lib/scrollToElement";
import { SITE_NAME } from "@/src/lib/usePageTitle";

const MapPage = lazy(() => import("@/src/pages/MapPage"));
const ChapterPage = lazy(() => import("@/src/pages/ChapterPage"));
const ExplorePage = lazy(() => import("@/src/pages/ExplorePage"));
const PeersPage = lazy(() => import("@/src/pages/PeersPage"));
const RecoveryPage = lazy(() => import("@/src/pages/RecoveryPage"));
const FeelingsPage = lazy(() => import("@/src/pages/FeelingsPage"));
const WordsPage = lazy(() => import("@/src/pages/WordsPage"));
const GrownUpsPage = lazy(() => import("@/src/pages/GrownUpsPage"));
const SchoolPage = lazy(() => import("@/src/pages/SchoolPage"));
const CheckupPage = lazy(() => import("@/src/pages/CheckupPage"));
const PatrolGamePage = lazy(() => import("@/src/pages/PatrolGamePage"));

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

export default function App() {
  return (
    <>
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
        <main id="main-content" className="site-main" tabIndex={-1}>
          <Suspense
            fallback={
              <p className="route-loading" role="status">
                正在打开…
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/story/:id" element={<ChapterPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/stories" element={<PeersPage />} />
              <Route path="/recovery" element={<RecoveryPage />} />
              <Route path="/feelings" element={<FeelingsPage />} />
              <Route path="/words" element={<WordsPage />} />
              <Route path="/grown-ups" element={<GrownUpsPage />} />
              <Route path="/school" element={<SchoolPage />} />
              <Route path="/checkup" element={<CheckupPage />} />
              <Route path="/game/patrol" element={<PatrolGamePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <SiteTabBar />
        <footer className="site-footer">
          <div className="site-footer__inner">
            <span>{SITE_NAME} · 讲给孩子听的白血病</span>
            <Link to="/words">词语卡</Link>
            <Link to="/grown-ups">来源与说明</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
