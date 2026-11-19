import { useCallback, useEffect, useState } from "react";

/* Themes and accents match Sigmund:re. Colors themselves live in index.css under :root[data-theme="…"].
   Keep SETTINGS_DEFAULTS in sync with the pre-paint script in client/index.html. */

export interface Theme {
  id: string;
  name: string;
  note: string;
  swatch: [string, string, string];
}

export const THEMES: Theme[] = [
  { id: "black", name: "Black", note: "Deep black with bright accents. The default.", swatch: ["#0b0b0c", "#18181b", "#f2f0ea"] },
  { id: "paper", name: "Paper", note: "Warm off-white with bold ink outlines.", swatch: ["#f4efe6", "#fffaf1", "#17130f"] },
  { id: "system", name: "Match device", note: "Black or Paper, following your device.", swatch: ["#0b0b0c", "#f4efe6", "#ffc93c"] },
  { id: "midnight", name: "Midnight", note: "Deep navy, late-night study session.", swatch: ["#0d1321", "#18223a", "#e8ecf6"] },
  { id: "forest", name: "Forest", note: "Dark pine greens, soft moss text.", swatch: ["#0e1712", "#19281f", "#e7f0e6"] },
  { id: "mocha", name: "Mocha", note: "Warm coffee browns. Cozy.", swatch: ["#1a1411", "#2a211c", "#f3e9df"] },
  { id: "slate", name: "Slate", note: "Calm, cool grays.", swatch: ["#1e2226", "#2c3238", "#eceff2"] },
  { id: "terminal", name: "Terminal", note: "Green on black, all monospace.", swatch: ["#000000", "#07150b", "#7dff9b"] },
  { id: "arcade", name: "Arcade", note: "Neon pink outlines on purple.", swatch: ["#140a24", "#231440", "#ff4fd8"] },
  { id: "vampire", name: "Vampire", note: "Dark purple, spooky all year.", swatch: ["#16111c", "#241b2e", "#f4ecff"] },
  { id: "oled", name: "OLED", note: "True black everywhere.", swatch: ["#000000", "#000000", "#ffffff"] },
  { id: "candy", name: "Candy", note: "Bubblegum pink, bold outlines.", swatch: ["#fff0f6", "#fffafc", "#3a1030"] },
  { id: "seafoam", name: "Seafoam", note: "Light, breezy blue-greens.", swatch: ["#e9f6f4", "#f7fdfc", "#0d2b33"] },
  { id: "sunset", name: "Sunset", note: "Peach and orange.", swatch: ["#ffe9d6", "#fff6ee", "#3a1a0c"] },
  { id: "lavender", name: "Lavender", note: "Soft purple, light and relaxing.", swatch: ["#efe9fb", "#faf7ff", "#2a1d45"] },
];

export const ACCENTS: [string, string][] = [
  ["mustard", "#ffc93c"], ["tomato", "#ff5a36"], ["teal", "#1fc7b2"], ["lilac", "#b39cff"],
  ["sky", "#57b7ff"], ["lime", "#b8e05a"], ["pink", "#ff8ad8"],
];

export interface Settings {
  theme: string;
  accent: string;
  motion: boolean;
}

export const SETTINGS_DEFAULTS: Settings = { theme: "black", accent: "mustard", motion: true };
const KEY = "sigrbx:settings";

function load(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") return { ...SETTINGS_DEFAULTS, ...saved };
  } catch {
    /* storage blocked or corrupt: fall back to defaults */
  }
  return { ...SETTINGS_DEFAULTS };
}

export function applySettings(s: Settings) {
  const root = document.documentElement;
  let theme = s.theme;
  if (theme === "system") theme = matchMedia("(prefers-color-scheme: light)").matches ? "paper" : "black";
  if (!THEMES.some((t) => t.id === theme)) theme = "black";
  root.dataset.theme = theme;
  root.dataset.accent = ACCENTS.some(([id]) => id === s.accent) ? s.accent : "mustard";
  root.dataset.motion = s.motion ? "on" : "off";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--paper").trim() || "#0b0b0c");
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    if (settings.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applySettings(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...SETTINGS_DEFAULTS }), []);
  return { settings, update, reset };
}
