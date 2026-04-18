const DN_THEME_STORAGE_KEY = "dn_theme_settings_v2";

const DN_THEME_DEFAULT = {
  wallpaper: "",
  accent: "blue",
};

const DN_THEME_DEFAULT_SETTINGS = {
  global: { ...DN_THEME_DEFAULT },
  home: { ...DN_THEME_DEFAULT },
  notes: { ...DN_THEME_DEFAULT },
  quiz: { ...DN_THEME_DEFAULT },
  viewer: { ...DN_THEME_DEFAULT },
};

const DN_THEME_WALLPAPERS = [
  { id: "gradient-1", type: "css" },
  { id: "gradient-2", type: "css" },
  { id: "gradient-3", type: "css" },
  { id: "gradient-4", type: "css" },
  { id: "gradient-5", type: "css" },
  { id: "gradient-6", type: "css" },
  { id: "dark-1", type: "css" },
  { id: "dark-2", type: "css" },
  { id: "dark-3", type: "css" },
  { id: "space-1", type: "css" },
  { id: "space-2", type: "css" },
  { id: "nature-1", type: "css" },
  { id: "nature-2", type: "css" },

  { id: "pattern-1", type: "image", src: "/assets/wallpapers/pattern-1.png" },
  { id: "pattern-2", type: "image", src: "/assets/wallpapers/pattern-2.png" },
  { id: "pattern-3", type: "image", src: "/assets/wallpapers/pattern-3.png" },
  { id: "pattern-4", type: "image", src: "/assets/wallpapers/pattern-4.png" },
  { id: "pattern-5", type: "image", src: "/assets/wallpapers/pattern-5.png" },
  { id: "pattern-6", type: "image", src: "/assets/wallpapers/pattern-6.png" },
  { id: "pattern-7", type: "image", src: "/assets/wallpapers/pattern-7.png" },
  { id: "pattern-8", type: "image", src: "/assets/wallpapers/pattern-8.png" },
  { id: "pattern-9", type: "image", src: "/assets/wallpapers/pattern-9.png" }
];

function dnThemeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dnThemeLoadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(DN_THEME_STORAGE_KEY) || "null");
    return {
      global: { ...DN_THEME_DEFAULT, ...(raw?.global || {}) },
      home: { ...DN_THEME_DEFAULT, ...(raw?.home || {}) },
      notes: { ...DN_THEME_DEFAULT, ...(raw?.notes || {}) },
      quiz: { ...DN_THEME_DEFAULT, ...(raw?.quiz || {}) },
      viewer: { ...DN_THEME_DEFAULT, ...(raw?.viewer || {}) },
    };
  } catch (error) {
    console.warn("Theme load failed:", error);
    return dnThemeClone(DN_THEME_DEFAULT_SETTINGS);
  }
}

function dnThemeSaveSettings(settings) {
  try {
    localStorage.setItem(DN_THEME_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Theme save failed:", error);
  }
}

function dnThemeResetAll() {
  const settings = dnThemeClone(DN_THEME_DEFAULT_SETTINGS);
  dnThemeSaveSettings(settings);
  return settings;
}

function dnThemeGetPageScope() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("/pp-quiz/")) return "quiz";
  if (path.includes("/topics/viewer")) return "viewer";
  if (path.includes("/topics/topic")) return "notes";
  if (path.includes("/subjects/")) return "notes";
  if (path.includes("/notes/")) return "notes";
  if (path === "/" || path.endsWith("/index.html") || path === "/index.html") return "home";

  return "global";
}

function dnThemeGetEffectiveTheme(scope, settings = dnThemeLoadSettings()) {
  const scoped = settings[scope] || DN_THEME_DEFAULT;
  const global = settings.global || DN_THEME_DEFAULT;

  return {
    wallpaper: scoped.wallpaper || global.wallpaper || "",
    accent: scoped.accent || global.accent || "blue",
  };
}

function dnThemeWallpaperIds() {
  return DN_THEME_WALLPAPERS.map((item) => item.id);
}

function dnThemeClearWallpaperClasses() {
  const body = document.body;
  dnThemeWallpaperIds().forEach((id) => {
    body.classList.remove(`wallpaper-${id}`);
  });
}

function dnThemeClearAccentClasses() {
  const body = document.body;
  body.classList.remove(
    "accent-purple",
    "accent-pink",
    "accent-gold",
    "accent-green",
    "accent-orange"
  );
}

function dnThemeApplyToCurrentPage() {
  const settings = dnThemeLoadSettings();
  const scope = dnThemeGetPageScope();
  const theme = dnThemeGetEffectiveTheme(scope, settings);
  const body = document.body;

  dnThemeClearWallpaperClasses();
  dnThemeClearAccentClasses();

  body.style.backgroundImage = "";
  body.style.backgroundSize = "";
  body.style.backgroundPosition = "";
  body.style.backgroundRepeat = "";
  body.style.backgroundAttachment = "";

  if (theme.wallpaper) {
    const wallpaperMeta = DN_THEME_WALLPAPERS.find((item) => item.id === theme.wallpaper);

    if (wallpaperMeta?.type === "image" && wallpaperMeta.src) {
      body.classList.add(`wallpaper-${theme.wallpaper}`);
      body.style.backgroundImage = `
        linear-gradient(rgba(5,10,18,0.72), rgba(5,10,18,0.78)),
        url("${wallpaperMeta.src}")
      `;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundAttachment = "fixed";
    } else {
      body.classList.add(`wallpaper-${theme.wallpaper}`);
    }
  }

  if (theme.accent && theme.accent !== "blue") {
    body.classList.add(`accent-${theme.accent}`);
  }
}

function dnThemeBuildWallpaperPreview(item) {
  const preview = document.createElement("div");
  preview.className = `wallpaper-preview wallpaper-${item.id}`;

  if (item.type === "image" && item.src) {
    preview.style.backgroundImage = `
      linear-gradient(rgba(10,16,28,0.18), rgba(10,16,28,0.18)),
      url("${item.src}")
    `;
    preview.style.backgroundSize = "cover";
    preview.style.backgroundPosition = "center";
    preview.style.backgroundRepeat = "no-repeat";
  }

  return preview;
}

window.DN_THEME_WALLPAPERS = DN_THEME_WALLPAPERS;
window.dnThemeLoadSettings = dnThemeLoadSettings;
window.dnThemeSaveSettings = dnThemeSaveSettings;
window.dnThemeResetAll = dnThemeResetAll;
window.dnThemeGetPageScope = dnThemeGetPageScope;
window.dnThemeGetEffectiveTheme = dnThemeGetEffectiveTheme;
window.dnThemeApplyToCurrentPage = dnThemeApplyToCurrentPage;
window.dnThemeBuildWallpaperPreview = dnThemeBuildWallpaperPreview;
