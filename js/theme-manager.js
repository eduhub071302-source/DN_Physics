const DN_THEME_BASE_KEY = "dn_theme_settings_v3";

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

  { id: "pattern-1", type: "image", src: "/assets/wallpapers/pattern-1.svg" },
  { id: "pattern-2", type: "image", src: "/assets/wallpapers/pattern-2.svg" },
  { id: "pattern-3", type: "image", src: "/assets/wallpapers/pattern-3.svg" },
  { id: "pattern-4", type: "image", src: "/assets/wallpapers/pattern-4.svg" },
  { id: "pattern-5", type: "image", src: "/assets/wallpapers/pattern-5.svg" },
  { id: "pattern-6", type: "image", src: "/assets/wallpapers/pattern-6.svg" },
  { id: "pattern-7", type: "image", src: "/assets/wallpapers/pattern-7.svg" },
  { id: "pattern-8", type: "image", src: "/assets/wallpapers/pattern-8.svg" },
  { id: "pattern-9", type: "image", src: "/assets/wallpapers/pattern-9.svg" },
  { id: "pattern-10", type: "image", src: "/assets/wallpapers/pattern-10.svg" },
  { id: "pattern-11", type: "image", src: "/assets/wallpapers/pattern-11.svg" },
  { id: "pattern-12", type: "image", src: "/assets/wallpapers/pattern-12.svg" },
  { id: "pattern-13", type: "image", src: "/assets/wallpapers/pattern-13.svg" },
  { id: "pattern-14", type: "image", src: "/assets/wallpapers/pattern-14.svg" },
  { id: "pattern-15", type: "image", src: "/assets/wallpapers/pattern-15.svg" },
  { id: "pattern-16", type: "image", src: "/assets/wallpapers/pattern-16.svg" },
  { id: "pattern-17", type: "image", src: "/assets/wallpapers/pattern-17.svg" },
  { id: "pattern-18", type: "image", src: "/assets/wallpapers/pattern-18.svg" },
  { id: "pattern-19", type: "image", src: "/assets/wallpapers/pattern-19.svg" },
  { id: "pattern-20", type: "image", src: "/assets/wallpapers/pattern-20.svg" },
  { id: "pattern-21", type: "image", src: "/assets/wallpapers/pattern-21.svg" },
  { id: "pattern-22", type: "image", src: "/assets/wallpapers/pattern-22.svg" },
  { id: "pattern-23", type: "image", src: "/assets/wallpapers/pattern-23.svg" },
  { id: "pattern-24", type: "image", src: "/assets/wallpapers/pattern-24.svg" },
  { id: "pattern-25", type: "image", src: "/assets/wallpapers/pattern-25.svg" },
  { id: "pattern-26", type: "image", src: "/assets/wallpapers/pattern-26.svg" },
  { id: "pattern-27", type: "image", src: "/assets/wallpapers/pattern-27.svg" },
  { id: "pattern-28", type: "image", src: "/assets/wallpapers/pattern-28.svg" },
  { id: "pattern-29", type: "image", src: "/assets/wallpapers/pattern-29.svg" },
  { id: "pattern-30", type: "image", src: "/assets/wallpapers/pattern-30.svg" }
];

function dnThemeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dnThemeNormalizeSettings(raw) {
  return {
    global: { ...DN_THEME_DEFAULT, ...(raw?.global || {}) },
    home: { ...DN_THEME_DEFAULT, ...(raw?.home || {}) },
    notes: { ...DN_THEME_DEFAULT, ...(raw?.notes || {}) },
    quiz: { ...DN_THEME_DEFAULT, ...(raw?.quiz || {}) },
    viewer: { ...DN_THEME_DEFAULT, ...(raw?.viewer || {}) },
  };
}

function dnThemeGetCurrentUserId() {
  try {
    const firebaseUid = window.firebaseAuth?.currentUser?.uid;
    if (firebaseUid) return firebaseUid;

    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.uid) return cachedUser.uid;
    if (cachedUser?.id) return cachedUser.id;
  } catch (error) {
    console.warn("Theme user detect failed:", error);
  }

  return "guest";
}

function dnThemeGetStorageKey() {
  return `${DN_THEME_BASE_KEY}__${dnThemeGetCurrentUserId()}`;
}

function dnThemeLoadLocalSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(dnThemeGetStorageKey()) || "null");
    return dnThemeNormalizeSettings(raw);
  } catch (error) {
    console.warn("Theme local load failed:", error);
    return dnThemeClone(DN_THEME_DEFAULT_SETTINGS);
  }
}

function dnThemeSaveLocalSettings(settings) {
  try {
    localStorage.setItem(
      dnThemeGetStorageKey(),
      JSON.stringify(dnThemeNormalizeSettings(settings))
    );
  } catch (error) {
    console.warn("Theme local save failed:", error);
  }
}

async function dnThemePullCloudForCurrentUser() {
  const uid = dnThemeGetCurrentUserId();

  if (!uid || uid === "guest") {
    return dnThemeLoadLocalSettings();
  }

  try {
    const sdk = window.firebaseSdk;
    const db = window.firebaseDb;

    if (!sdk || !db || typeof sdk.ref !== "function" || typeof sdk.get !== "function") {
      return dnThemeLoadLocalSettings();
    }

    const snapshot = await sdk.get(sdk.ref(db, `/profiles/${uid}/theme`));

    if (snapshot.exists()) {
      const cloudSettings = dnThemeNormalizeSettings(snapshot.val());
      dnThemeSaveLocalSettings(cloudSettings);
      return cloudSettings;
    }

    return dnThemeLoadLocalSettings();
  } catch (error) {
    console.warn("Theme cloud pull failed:", error);
    return dnThemeLoadLocalSettings();
  }
}

async function dnThemePushCloudForCurrentUser(settings) {
  const uid = dnThemeGetCurrentUserId();

  if (!uid || uid === "guest") return;

  try {
    const sdk = window.firebaseSdk;
    const db = window.firebaseDb;

    if (!sdk || !db || typeof sdk.ref !== "function" || typeof sdk.set !== "function") {
      return;
    }

    await sdk.set(
      sdk.ref(db, `/profiles/${uid}/theme`),
      dnThemeNormalizeSettings(settings)
    );
  } catch (error) {
    console.warn("Theme cloud push failed:", error);
  }
}

function dnThemeLoadSettings() {
  return dnThemeLoadLocalSettings();
}

function dnThemeSaveSettings(settings) {
  const normalized = dnThemeNormalizeSettings(settings);
  dnThemeSaveLocalSettings(normalized);
  dnThemePushCloudForCurrentUser(normalized);
}

function dnThemeResetAll() {
  const settings = dnThemeClone(DN_THEME_DEFAULT_SETTINGS);
  dnThemeSaveSettings(settings);
  return settings;
}

async function dnThemeLoadForCurrentUser() {
  const settings = await dnThemePullCloudForCurrentUser();
  dnThemeSaveLocalSettings(settings);
  return settings;
}

function dnThemeGetPageScope() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("/pp-quiz/")) return "quiz";
  if (path.includes("/topics/viewer")) return "viewer";
  if (path.includes("/topics/topic")) return "notes";
  if (path.includes("/subjects/")) return "notes";
  if (path.includes("/notes/")) return "notes";
  if (path === "/" || path === "/index.html" || path.endsWith("/index.html")) return "home";

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
  body.style.backgroundColor = "";

  if (theme.wallpaper) {
    const wallpaperMeta = DN_THEME_WALLPAPERS.find((item) => item.id === theme.wallpaper);

    if (wallpaperMeta?.type === "image" && wallpaperMeta.src) {
      body.classList.add(`wallpaper-${theme.wallpaper}`);
      body.style.backgroundImage = `
        radial-gradient(circle at top, rgba(78,161,255,0.10), transparent 28%),
        linear-gradient(rgba(5,10,18,0.68), rgba(5,10,18,0.80)),
        url("${wallpaperMeta.src}")
      `;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundAttachment = "fixed";
      body.style.backgroundColor = "#09101c";
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

function dnThemeInitAuthWatcher() {
  if (window.__dnThemeAuthWatcherBound) return true;

  const sdk = window.firebaseSdk;
  const auth = window.firebaseAuth;

  if (!sdk || !auth || typeof sdk.onAuthStateChanged !== "function") {
    return false;
  }

  window.__dnThemeAuthWatcherBound = true;

  sdk.onAuthStateChanged(auth, async () => {
    await dnThemeLoadForCurrentUser();
    dnThemeApplyToCurrentPage();
  });

  return true;
}

function dnThemeBootWatcher(retries = 20) {
  if (dnThemeInitAuthWatcher()) return;
  if (retries <= 0) return;

  setTimeout(() => {
    dnThemeBootWatcher(retries - 1);
  }, 300);
}

window.DN_THEME_WALLPAPERS = DN_THEME_WALLPAPERS;
window.dnThemeLoadSettings = dnThemeLoadSettings;
window.dnThemeSaveSettings = dnThemeSaveSettings;
window.dnThemeResetAll = dnThemeResetAll;
window.dnThemeLoadForCurrentUser = dnThemeLoadForCurrentUser;
window.dnThemeGetPageScope = dnThemeGetPageScope;
window.dnThemeGetEffectiveTheme = dnThemeGetEffectiveTheme;
window.dnThemeApplyToCurrentPage = dnThemeApplyToCurrentPage;
window.dnThemeBuildWallpaperPreview = dnThemeBuildWallpaperPreview;

dnThemeBootWatcher();
