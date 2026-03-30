import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { useDarkMode } from "./ColorMode";
import { THEME_DARK, THEME_LIGHT } from "../config";

/**
 * mui 主题配置
 * @param {*} param0
 * @returns
 */
export default function Theme({ children, options = {}, styles = {} }) {
  const { darkMode } = useDarkMode();
  const [systemMode, setSystemMode] = useState(THEME_LIGHT);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemMode(mediaQuery.matches ? THEME_DARK : THEME_LIGHT);
    };
    handleChange(); // Set initial value
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme = useMemo(() => {
    let htmlFontSize = 16;
    try {
      const s = window.getComputedStyle(document.documentElement).fontSize;
      htmlFontSize = parseInt(s.replace("px", ""));
    } catch (err) {
      //
    }

    const isDarkMode =
      darkMode === "dark" || (darkMode === "auto" && systemMode === THEME_DARK);

    const baseTheme = createTheme({
      palette: {
        mode: isDarkMode ? THEME_DARK : THEME_LIGHT,
        primary: {
          main: "#FF9500", // Apple System Orange
          light: "#FFAA33",
          dark: "#CC7700",
        },
        secondary: {
          main: "#FF3B30", // Apple System Red
        },
        background: {
          default: isDarkMode ? "#000000" : "#F2F2F7", // Apple System Backgrounds
          paper: isDarkMode ? "#1C1C1E" : "#FFFFFF",
        },
        divider: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
      },
      typography: {
        htmlFontSize,
        fontSize: 13,
        fontFamily: '"SF Pro Text", "SF Pro Icons", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 16, // Smoother, iOS-like squircle approximation
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 16,
            },
            containedPrimary: {
              background: "#FF9500",
              color: "#FFFFFF",
              boxShadow: "none",
              "&:hover": {
                background: "#E58600",
                boxShadow: "none",
              },
            },
            contained: {
              transition: "all 0.2s ease-in-out",
              boxShadow: "none",
              "&:active": {
                transform: "scale(0.96)",
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            elevation1: {
              boxShadow: isDarkMode
                ? "0 4px 20px rgba(0,0,0,0.6)"
                : "0 4px 20px rgba(0,0,0,0.06)",
            },
            elevation2: {
              boxShadow: isDarkMode
                ? "0 8px 30px rgba(0,0,0,0.7)"
                : "0 8px 30px rgba(0,0,0,0.08)",
            },
            elevation3: {
              boxShadow: isDarkMode
                ? "0 12px 40px rgba(0,0,0,0.8)"
                : "0 12px 40px rgba(0,0,0,0.12)",
            },
            root: {
              backgroundImage: "none",
              backgroundColor: isDarkMode ? "rgba(28, 28, 30, 0.85)" : "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)", // iOS glassmorphism effect
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: "none",
              boxShadow: isDarkMode
                ? "0 2px 10px rgba(0, 0, 0, 0.4)"
                : "0 2px 10px rgba(0, 0, 0, 0.04)",
              backgroundColor: isDarkMode ? "#1C1C1E" : "#FFFFFF",
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: "none",
              backgroundColor: isDarkMode ? "rgba(28, 28, 30, 0.8)" : "rgba(242, 242, 247, 0.8)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: isDarkMode 
                ? "4px 0 24px rgba(0,0,0,0.5)" 
                : "4px 0 24px rgba(0,0,0,0.02)",
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              margin: "4px 12px",
              padding: "10px 16px",
              "&.Mui-selected": {
                background: isDarkMode 
                  ? "rgba(255, 149, 0, 0.15)"
                  : "rgba(255, 149, 0, 0.1)",
                color: "#FF9500",
                "& .MuiListItemIcon-root": {
                  color: "#FF9500",
                },
              },
            },
          },
        },
      },
      ...options,
    });

    return baseTheme;
  }, [darkMode, options, systemMode]);

  const globalStyles = {
    ...styles,
    "*::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "*::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "*::-webkit-scrollbar-thumb": {
      background: theme.palette.mode === THEME_DARK ? "#475569" : "#cbd5e1",
      borderRadius: "4px",
    },
    "*::-webkit-scrollbar-thumb:hover": {
      background: theme.palette.mode === THEME_DARK ? "#64748b" : "#94a3b8",
    },
    "body": {
      transition: "background-color 0.3s ease",
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      {children}
    </ThemeProvider>
  );
}
