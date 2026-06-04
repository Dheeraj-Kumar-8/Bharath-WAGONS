import { createContext, useContext, useState, useEffect } from "react";

export const ACCENT_MAP = {
  Blue:   { primary:"#3b82f6", dark:"#1d4ed8", glow:"rgba(59,130,246,.4)"  },
  Green:  { primary:"#22c55e", dark:"#16a34a", glow:"rgba(34,197,94,.4)"   },
  Purple: { primary:"#8b5cf6", dark:"#7c3aed", glow:"rgba(139,92,246,.4)"  },
  Cyan:   { primary:"#06b6d4", dark:"#0891b2", glow:"rgba(6,182,212,.4)"   },
  Orange: { primary:"#f97316", dark:"#ea6c00", glow:"rgba(249,115,22,.4)"  },
};

export const SCHEME_MAP = {
  "Dark Navy": { bg:"#020817", surface:"#0d1f3c", border:"#1a3356", alt:"#071628" },
  "Dark":      { bg:"#0a0a0a", surface:"#141414", border:"#2a2a2a", alt:"#1a1a1a" },
  "Midnight":  { bg:"#080812", surface:"#0f0f24", border:"#1e1e40", alt:"#0a0a1a" },
};

const FONT_MAP = { Small:"12px", Medium:"14px", Large:"16px" };

export function applyTheme(t) {
  const r = document.documentElement;
  const a = ACCENT_MAP[t.accentColor] || ACCENT_MAP.Blue;
  const s = SCHEME_MAP[t.colorScheme] || SCHEME_MAP["Dark Navy"];
  r.style.setProperty("--accent",        a.primary);
  r.style.setProperty("--accent-dark",   a.dark);
  r.style.setProperty("--accent-glow",   a.glow);
  r.style.setProperty("--bg",            s.bg);
  r.style.setProperty("--surface",       s.surface);
  r.style.setProperty("--border-color",  s.border);
  r.style.setProperty("--surface-alt",   s.alt);
  r.style.setProperty("--font-base",     FONT_MAP[t.fontSize] || "14px");
  r.style.setProperty("--card-pad",      t.compactMode ? "14px" : "22px");
  r.style.setProperty("--content-pad",   t.compactMode ? "14px" : "24px");
  r.style.setProperty("--transition",    t.animationsEnabled ? ".18s" : "0s");
}

const DEFAULT = { colorScheme:"Dark Navy", accentColor:"Blue", fontSize:"Medium", compactMode:false, animationsEnabled:true };

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rcc_theme")) || DEFAULT; }
    catch { return DEFAULT; }
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  const saveTheme = (next) => {
    setTheme(next);
    localStorage.setItem("rcc_theme", JSON.stringify(next));
    applyTheme(next);
  };

  return <Ctx.Provider value={{ theme, saveTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
