import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

async function prepare() {
  // Enable mock server calls for development (as required in assignment)
  // Run app with mocks:
  // - Windows (PowerShell): use npm script with cross-env, or set .env
  // - Example scripts: "start": "cross-env REACT_APP_USE_MOCKS=true react-scripts start"
  if (process.env.REACT_APP_USE_MOCKS === "true") {
    try {
      const { worker } = await import("./mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      // eslint-disable-next-line no-console
      console.log("[MSW] Mocking enabled");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[MSW] Failed to start mock service worker, continuing without mocks.", e);
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

prepare().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
