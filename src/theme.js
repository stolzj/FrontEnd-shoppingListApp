import React from "react";

const ThemeContext = React.createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => {
    const saved = window.localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}