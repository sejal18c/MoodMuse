import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; 

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">MoodMuse</h2>
      <ul>
        <li>
          <NavLink to="/diary" className={({ isActive }) => (isActive ? "active" : "")}>
            Diary
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendar" className={({ isActive }) => (isActive ? "active" : "")}>
            Calendar
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
            Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
