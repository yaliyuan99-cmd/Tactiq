import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReducedMotionProvider from "./app/components/ReducedMotionProvider.tsx";
import App from "./app/App.tsx";
import { applyA11yPrefs } from "./lib/a11yPrefs";
import "./styles/index.css";

// Apply saved accessibility preferences (text size, reduced motion) before
// first paint so the user's settings hold on every page, not just the
// dashboard page that edits them.
applyA11yPrefs();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReducedMotionProvider>
      <App />
    </ReducedMotionProvider>
  </StrictMode>
);
