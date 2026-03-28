// src/App.js
import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Diary from "./pages/Diary";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import CatBot from "./components/CatBot";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <CatBot />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route element={<AppLayout />}>
        <Route path="/journal" element={<Diary />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
