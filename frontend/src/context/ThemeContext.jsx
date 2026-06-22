import { createContext, useContext, useState, useEffect } from "react";

export const ACCENT_MAP = {
  Blue:   { primary:"#3b82f6", dark:"#1d4ed8", glow:"rgba(59,130,246,.4)"  },
  Green:  { primary:"#22c55e", dark:"#16a34a", glow:"rgba(34,197,94,.4)"   },
  Purple: { primary:"#8b5cf6", dark:"#7c3aed", glow:"rgba(139,92,246,.4)"  },
  Cyan:   { primary:"#06b6d4", dark:"#0891b2", glow:"rgba(6,182,212,.4)"   },
  Orange: { primary:"#f97316", dark:"#ea6c00", glow:"rgba(249,115,22,.4)"  },
};

export const SCHEME_MAP = {
  "Dark Navy": { bg:"#020817", surface:"#0d1f3c", border:"#1a3356", alt:"#071628", text:"#cbd5e1", textStrong:"#f1f5f9", textMuted:"#64748b" },
  "Dark":      { bg:"#0a0a0a", surface:"#141414", border:"#2a2a2a", alt:"#1a1a1a", text:"#cbd5e1", textStrong:"#f1f5f9", textMuted:"#6b7280" },
  "Midnight":  { bg:"#080812", surface:"#0f0f24", border:"#1e1e40", alt:"#0a0a1a", text:"#cbd5e1", textStrong:"#f1f5f9", textMuted:"#64748b" },
};

// ── 4 Preset themes ────────────────────────────────────────────────────────
export const PRESET_THEMES = {
  "Dark Mode": {
    colorScheme:"Dark Navy", accentColor:"Blue", fontSize:"Medium",
    fontFamily:"System", primaryColor:"#3b82f6", secondaryColor:"#1d4ed8",
    cardStyle:"default", borderRadius:"medium",
    compactMode:false, animationsEnabled:true,
  },
  "Light Mode": {
    colorScheme:"Light", accentColor:"Blue", fontSize:"Medium",
    fontFamily:"System", primaryColor:"#2563eb", secondaryColor:"#1d4ed8",
    cardStyle:"elevated", borderRadius:"medium",
    compactMode:false, animationsEnabled:true,
  },
  "Railway Theme": {
    colorScheme:"Dark Navy", accentColor:"Green", fontSize:"Medium",
    fontFamily:"System", primaryColor:"#22c55e", secondaryColor:"#f97316",
    cardStyle:"default", borderRadius:"large",
    compactMode:false, animationsEnabled:true,
  },
  "Corporate Theme": {
    colorScheme:"Corporate", accentColor:"Blue", fontSize:"Medium",
    fontFamily:"Serif", primaryColor:"#1e40af", secondaryColor:"#334155",
    cardStyle:"flat", borderRadius:"small",
    compactMode:false, animationsEnabled:true,
  },
};

// Extended SCHEME_MAP including Light and Corporate
export const FULL_SCHEME_MAP = {
  ...SCHEME_MAP,
  "Light":     { bg:"#f1f5f9", surface:"#ffffff", border:"#e2e8f0", alt:"#f8fafc", text:"#334155", textStrong:"#0f172a", textMuted:"#64748b" },
  "Corporate": { bg:"#f8fafc", surface:"#ffffff", border:"#cbd5e1", alt:"#f1f5f9", text:"#334155", textStrong:"#0f172a", textMuted:"#64748b" },
};

export const FONT_FAMILY_MAP = {
  System:  "'Segoe UI', 'Inter', system-ui, sans-serif",
  Sans:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
  Serif:   "'Georgia', 'Times New Roman', serif",
  Mono:    "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

export const BORDER_RADIUS_MAP = {
  small:  { card:"8px",  btn:"6px",  input:"6px"  },
  medium: { card:"16px", btn:"10px", input:"10px" },
  large:  { card:"24px", btn:"14px", input:"14px" },
  pill:   { card:"32px", btn:"999px",input:"999px"},
};

export const CARD_STYLE_MAP = {
  default:  { shadow:"none",                             extraBorder:"" },
  elevated: { shadow:"0 4px 24px rgba(0,0,0,.18)",       extraBorder:"" },
  flat:     { shadow:"none",                             extraBorder:"" },
  glass:    { shadow:"0 8px 32px rgba(0,0,0,.22)",       extraBorder:"" },
};

const FONT_SIZE_MAP = { Small:"12px", Medium:"14px", Large:"16px" };

export function applyTheme(t) {
  const r   = document.documentElement;
  const acc = ACCENT_MAP[t.accentColor] || ACCENT_MAP.Blue;
  const sch = FULL_SCHEME_MAP[t.colorScheme] || FULL_SCHEME_MAP["Dark Navy"];
  const br  = BORDER_RADIUS_MAP[t.borderRadius] || BORDER_RADIUS_MAP.medium;
  const cs  = CARD_STYLE_MAP[t.cardStyle] || CARD_STYLE_MAP.default;
  const ff  = FONT_FAMILY_MAP[t.fontFamily] || FONT_FAMILY_MAP.System;

  // Mark light vs dark for CSS scoping
  const isLight = t.colorScheme === "Light" || t.colorScheme === "Corporate";
  r.setAttribute("data-scheme", isLight ? "light" : "dark");

  // Accent — use custom primaryColor if set, else ACCENT_MAP
  const primary   = t.primaryColor   || acc.primary;
  const secondary = t.secondaryColor || acc.dark;

  // Derive glow from primary
  const glowHex = primary.replace("#","");
  const gr = parseInt(glowHex.slice(0,2),16);
  const gg = parseInt(glowHex.slice(2,4),16);
  const gb = parseInt(glowHex.slice(4,6),16);
  const glow = `rgba(${gr},${gg},${gb},.4)`;

  r.style.setProperty("--accent",          primary);
  r.style.setProperty("--accent-dark",     secondary);
  r.style.setProperty("--accent-glow",     glow);
  r.style.setProperty("--bg",              sch.bg);
  r.style.setProperty("--surface",         sch.surface);
  r.style.setProperty("--border-color",    sch.border);
  r.style.setProperty("--surface-alt",     sch.alt);
  r.style.setProperty("--text",            sch.text);
  r.style.setProperty("--text-strong",     sch.textStrong);
  r.style.setProperty("--text-muted",      sch.textMuted);
  r.style.setProperty("--font-base",       FONT_SIZE_MAP[t.fontSize] || "14px");
  r.style.setProperty("--font-family",     ff);
  r.style.setProperty("--radius-card",     br.card);
  r.style.setProperty("--radius-btn",      br.btn);
  r.style.setProperty("--radius-input",    br.input);
  r.style.setProperty("--card-shadow",     cs.shadow);
  r.style.setProperty("--card-pad",        t.compactMode ? "14px" : "22px");
  r.style.setProperty("--content-pad",     t.compactMode ? "14px" : "24px");
  r.style.setProperty("--transition",      t.animationsEnabled ? ".18s" : "0s");

  // Light-aware surface tokens
  r.style.setProperty("--navbar-bg",      isLight ? sch.surface  : "#060e1e");
  r.style.setProperty("--navbar-border",  isLight ? sch.border   : "#0f2040");
  r.style.setProperty("--dropdown-bg",    isLight ? sch.surface  : "#0d1f3c");
  r.style.setProperty("--nav-label",      isLight ? sch.textMuted : "#1e3a5f");
  r.style.setProperty("--nav-item",       isLight ? sch.text      : "#5a7a9e");
  r.style.setProperty("--nav-footer-sub", isLight ? sch.textMuted : "#2a4a6e");
  r.style.setProperty("--nav-footer-dim", isLight ? sch.border    : "#1a3356");
  r.style.setProperty("--search-bg",      isLight ? sch.alt       : "#0a1628");
  r.style.setProperty("--search-text",    isLight ? sch.textMuted : "#3a5a7c");
  r.style.setProperty("--kbd-bg",         isLight ? sch.border    : "#1a3356");
  r.style.setProperty("--kbd-text",       isLight ? sch.textMuted : "#4a6fa5");

  // Card glass style vars
  if (t.cardStyle === "glass") {
    r.style.setProperty("--card-bg",  `rgba(${parseInt(sch.surface.slice(1,3),16)},${parseInt(sch.surface.slice(3,5),16)},${parseInt(sch.surface.slice(5,7),16)},.75)`);
    r.style.setProperty("--card-backdrop", "blur(14px)");
  } else {
    r.style.setProperty("--card-bg",       sch.surface);
    r.style.setProperty("--card-backdrop", "none");
  }

  // Light scheme: update body text color
  document.body.style.color = sch.text;
  document.body.style.background = sch.bg;
  document.body.style.fontFamily = ff;
}

const DEFAULT = {
  colorScheme:"Dark Navy", accentColor:"Blue", fontSize:"Medium",
  fontFamily:"System", primaryColor:"", secondaryColor:"",
  cardStyle:"default", borderRadius:"medium",
  compactMode:false, animationsEnabled:true,
};

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem("rcc_theme")) }; }
    catch { return DEFAULT; }
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  const saveTheme = (next) => {
    const merged = { ...DEFAULT, ...next };
    setTheme(merged);
    localStorage.setItem("rcc_theme", JSON.stringify(merged));
    applyTheme(merged);
  };

  return <Ctx.Provider value={{ theme, saveTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
