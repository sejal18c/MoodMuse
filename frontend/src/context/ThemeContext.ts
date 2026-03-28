import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("darkMode"));
    if (saved !== null) setDarkMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
