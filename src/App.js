import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShoppingListRoute from "./ShoppingListRoute";
import ShoppingListDetailRoute from "./ShoppingListDetailRoute";
import TopBar from "./components/TopBar";

function App() {
  return (
    <BrowserRouter>
      <div className="appShell">
        <TopBar />
        <main className="content">
          <Routes>
            <Route path="/" element={<ShoppingListRoute />} />
            <Route path="/shopping-list/:id" element={<ShoppingListDetailRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
