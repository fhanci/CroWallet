import { createContext, useContext, useState, useEffect, useRef } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const observerRef = useRef(null);

  // Prevent body padding-right from being added by MUI
  useEffect(() => {
    const preventBodyShift = () => {
      document.body.style.paddingRight = "0px";
      document.body.style.marginRight = "0px";
    };

    // Create a MutationObserver to watch for style changes on body
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const paddingRight = document.body.style.paddingRight;
          if (paddingRight && paddingRight !== "0px") {
            document.body.style.paddingRight = "0px";
          }
        }
      });
    });

    observerRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    preventBodyShift();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    
    // Update CSS variables and body styles for dark mode
    const bgColor = isDarkMode ? "#1a2332" : "#f5f7f6";
    
    if (isDarkMode) {
      document.documentElement.style.setProperty("--bg-primary", "#1a2332");
      document.documentElement.style.setProperty("--bg-secondary", "#1e2a3a");
      document.documentElement.style.setProperty("--bg-tertiary", "#162029");
      document.documentElement.style.setProperty("--text-primary", "#ffffff");
      document.documentElement.style.setProperty("--text-secondary", "rgba(255, 255, 255, 0.7)");
      document.documentElement.style.setProperty("--border-color", "rgba(255, 255, 255, 0.12)");
      document.documentElement.style.setProperty("--card-bg", "rgba(30, 42, 58, 0.90)");
      document.documentElement.style.setProperty("--color-bg", "#1a2332");
    } else {
      document.documentElement.style.setProperty("--bg-primary", "#f5f7f6");
      document.documentElement.style.setProperty("--bg-secondary", "#ffffff");
      document.documentElement.style.setProperty("--bg-tertiary", "#f0f2f1");
      document.documentElement.style.setProperty("--text-primary", "#1a1a1a");
      document.documentElement.style.setProperty("--text-secondary", "rgba(0, 0, 0, 0.6)");
      document.documentElement.style.setProperty("--border-color", "rgba(0, 0, 0, 0.08)");
      document.documentElement.style.setProperty("--card-bg", "rgba(255, 255, 255, 0.90)");
      document.documentElement.style.setProperty("--color-bg", "#f5f7f6");
    }
    
    // Set body and html background
    document.body.style.backgroundColor = bgColor;
    document.documentElement.style.backgroundColor = bgColor;
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

