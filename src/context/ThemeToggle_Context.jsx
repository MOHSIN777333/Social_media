import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const lightTheme = () => setThemeMode("light");
  const darkTheme = () => setThemeMode("dark");

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove("light", "dark");
    html.classList.add(themeMode);

    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      lightTheme,
      darkTheme,
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}