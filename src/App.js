import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShoppingListRoute from "./ShoppingListRoute";
import ShoppingListDetailRoute from "./ShoppingListDetailRoute";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <Routes>
          <Route path="/" element={<ShoppingListRoute />} />
          <Route path="/shopping-list/:id" element={<ShoppingListDetailRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
