import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { ThemeProvider } from "./theme";

async function prepare() {
  if (process.env.REACT_APP_USE_MOCKS === "true") {
    try {
      const { worker } = await import("./mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      console.log("[MSW] Mocking enabled");
    } catch (e) {
      console.error(
        "[MSW] Failed to start mock service worker, continuing without mocks.",
        e
      );
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

prepare().finally(() => {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
});

reportWebVitals();
