import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { applyMotion } from "./lib/motion";
import "./globals.css";
import "./story.css";
import "./comic.css";
import "./explore.css";
import "./patrol.css";
import "./community.css";
import "./ui.css";

applyMotion();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
