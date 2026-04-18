import {
  registerServiceWorker,
  setupRefreshActions,
  performSafeUpdate,
  isUserBusy,
  showBusyUpdateMessage,
} from "/js/sw-update.js";
import { renderDashboard, checkCatalogVersion } from "/js/dashboard.js";
import { setupOnboarding, startOnboarding } from "/js/onboarding.js";

const APP_PATH = window.APP_BASE_PATH || "";

let deferredPrompt = null;
let touchStartY = 0;
let pullTriggered = false;

function getEl(id) {
  return document.getElementById(id);
}

function getAppMode() {
  try {
    return localStorage.getItem("dn_app_mode") || "guest";
  } catch {
    return "guest";
  }
}

function hasSeenEntryChoice() {
  try {
    return localStorage.getItem("dn_entry_seen") === "1";
  } catch {
    return false;
  }
}

function setEntryChoiceSeen() {
  try {
    localStorage.setItem("dn_entry_seen", "1");
  } catch (error) {
    console.warn("Could not persist entry choice:", error);
  }
}

function openEntryModal() {
  const modal = getEl("entryModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeEntryModal() {
  const modal = getEl("entryModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function shouldShowEntryModal() {
  const firebaseUser = window.firebaseAuth?.currentUser || null;
  const appMode = getAppMode();

  if (firebaseUser) return false;
  if (appMode === "account") return false;
  return !hasSeenEntryChoice();
}

function shouldUseLowPerformanceMode() {
  try {
    const saveDataEnabled =
      navigator.connection &&
      typeof navigator.connection.saveData === "boolean" &&
      navigator.connection.saveData;

    const lowMemoryDevice =
      typeof navigator.deviceMemory === "number" &&
      navigator.deviceMemory > 0 &&
      navigator.deviceMemory <= 4;

    const lowCpuDevice =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency > 0 &&
      navigator.hardwareConcurrency <= 4;

    const smallMobileViewport = window.matchMedia("(max-width: 768px)").matches;

    return Boolean(
      saveDataEnabled ||
      (smallMobileViewport && lowMemoryDevice) ||
      (smallMobileViewport && lowCpuDevice),
    );
  } catch (error) {
    console.warn("Performance detection fallback:", error);
    return false;
  }
}

function applyPerformanceMode() {
  const root = document.documentElement;

  if (shouldUseLowPerformanceMode()) {
    root.classList.add("perf-low");
  } else {
    root.classList.remove("perf-low");
  }
}

function showToast(message = "Done") {
  let toast = getEl("globalToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

window.showToast = showToast;
window.renderDashboard = renderDashboard;
window.refreshWholeAppUi = function refreshWholeAppUi() {
  try {
    updateUnlockButton();
  } catch (error) {
    console.warn("updateUnlockButton refresh failed:", error);
  }

  try {
    renderDashboard();
  } catch (error) {
    console.warn("renderDashboard refresh failed:", error);
  }

  try {
    const firebaseUser = window.firebaseAuth?.currentUser || null;
    updateProfileUI(firebaseUser);
  } catch (error) {
    console.warn("updateProfileUI refresh failed:", error);
  }
};

function setupEntryModal() {
  const entryLoginBtn = getEl("entryLoginBtn");
  const entrySignupBtn = getEl("entrySignupBtn");
  const entryGuestBtn = getEl("entryGuestBtn");

  if (entryLoginBtn) {
    entryLoginBtn.addEventListener("click", () => {
      setEntryChoiceSeen();
      closeEntryModal();

      if (typeof window.openDnAuthModal === "function") {
        window.openDnAuthModal();
      }
    });
  }

  if (entrySignupBtn) {
    entrySignupBtn.addEventListener("click", () => {
      setEntryChoiceSeen();
      closeEntryModal();

      if (typeof window.openDnAuthModal === "function") {
        window.openDnAuthModal();

        setTimeout(() => {
          const toggle = document.getElementById("authToggleBtn");
          if (toggle) toggle.click();
        }, 80);
      }
    });
  }

  if (entryGuestBtn) {
    entryGuestBtn.addEventListener("click", () => {
      try {
        localStorage.setItem("dn_app_mode", "guest");
      } catch (error) {
        console.warn("Could not set guest mode:", error);
      }

      setEntryChoiceSeen();
      closeEntryModal();

      if (typeof window.showToast === "function") {
        window.showToast("👤 Continuing in Guest Mode");
      }
    });
  }
}

function setupInstallPrompt() {
  const installBtn = getEl("installBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) {
      installBtn.classList.remove("is-hidden");
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;

      deferredPrompt = null;
      installBtn.classList.add("is-hidden");
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installBtn) {
      installBtn.classList.add("is-hidden");
    }
  });
}

function setupPullToRefresh() {
  const pullRefreshIndicator = getEl("pullRefreshIndicator");

  window.addEventListener(
    "touchstart",
    (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        pullTriggered = false;
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (window.scrollY !== 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY;

      if (pullRefreshIndicator && distance > 25 && !pullTriggered) {
        pullRefreshIndicator.classList.add("show");
      }

      if (pullRefreshIndicator && distance > 90 && !pullTriggered) {
        pullTriggered = true;
        pullRefreshIndicator.textContent = "↻ Release to refresh";
      }
    },
    { passive: true },
  );

  window.addEventListener("touchend", async () => {
    if (!pullRefreshIndicator) return;

    if (pullTriggered) {
      pullRefreshIndicator.classList.remove("show");
      pullRefreshIndicator.textContent = "↓ Pull to refresh";

      if (isUserBusy()) {
        showBusyUpdateMessage();
        return;
      }

      await performSafeUpdate();
    } else {
      pullRefreshIndicator.classList.remove("show");
      pullRefreshIndicator.textContent = "↓ Pull to refresh";
    }
  });
}

function setupSplash() {
  const appSplash = getEl("appSplash");
  const skipSplashBtn = getEl("skipSplashBtn");
  const isLowPerf = document.documentElement.classList.contains("perf-low");
  const SPLASH_TOTAL_MS = isLowPerf ? 4400 : 5200;
  const SPLASH_FADE_MS = 700;

  let splashFinished = false;
  let fadeTimer = null;
  let doneTimer = null;

  function finishSplashNow() {
    if (!appSplash || splashFinished) return;
    splashFinished = true;

    if (fadeTimer) clearTimeout(fadeTimer);
    if (doneTimer) clearTimeout(doneTimer);

    appSplash.classList.add("hide");

    setTimeout(() => {
      document.body.classList.add("app-ready");

      if (shouldShowEntryModal()) {
        openEntryModal();
        return;
      }

      setTimeout(() => {
        startOnboarding();
      }, 250);
    }, 120);
  }

  window.addEventListener("load", () => {
    if (!appSplash) {
      document.body.classList.add("app-ready");
      setTimeout(() => {
        startOnboarding();
      }, 300);
      return;
    }

    document.body.classList.remove("app-ready");

    fadeTimer = setTimeout(() => {
      appSplash.classList.add("hide");
    }, SPLASH_TOTAL_MS - SPLASH_FADE_MS);

    doneTimer = setTimeout(() => {
      finishSplashNow();
    }, SPLASH_TOTAL_MS);
  });

  if (skipSplashBtn) {
    skipSplashBtn.addEventListener("click", () => {
      finishSplashNow();
    });
  }
}

function setupSettingsModal() {
  const settingsBtn = document.getElementById("settingsBtn");
  const modal = document.getElementById("settingsModal");
  const closeBtn = document.getElementById("closeSettingsBtn");

  if (!settingsBtn || !modal) return;

  settingsBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // connect existing actions
  document.getElementById("refreshFromSettingsBtn")?.addEventListener("click", () => {
    document.getElementById("refreshBtn")?.click();
  });

  document.getElementById("openProfileBtn")?.addEventListener("click", () => {
    document.getElementById("loginBtn")?.click();
  });

  document.getElementById("switchAccountSettingsBtn")?.addEventListener("click", () => {
    document.getElementById("switchAccountBtn")?.click();
  });
}

function openSubjectModal() {
  const subjectModal = getEl("subjectSelectModal");
  if (!subjectModal) return;

  subjectModal.classList.remove("hidden");
  subjectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSubjectChooser() {
  const subjectModal = getEl("subjectSelectModal");
  if (!subjectModal) return;

  subjectModal.classList.add("hidden");
  subjectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setupSubjectChooser() {
  const practiceBtn = getEl("onboardPractice");
  const subjectModal = getEl("subjectSelectModal");
  const closeSubjectModal = getEl("closeSubjectModal");

  if (practiceBtn) {
    practiceBtn.addEventListener("click", openSubjectModal);
  }

  if (closeSubjectModal) {
    closeSubjectModal.addEventListener("click", closeSubjectChooser);
  }

  if (subjectModal) {
    const backdrop = subjectModal.querySelector(".subject-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeSubjectChooser);
    }
  }

  document.querySelectorAll(".subject-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const subject = btn.dataset.subject;
      if (!subject) return;

      window.location.href = `${APP_PATH}/pp-quiz/index.html?subject=${encodeURIComponent(subject)}`;
    });
  });

  window.addEventListener("keydown", (e) => {
    const modal = getEl("subjectSelectModal");
    if (
      e.key === "Escape" &&
      modal &&
      !modal.classList.contains("hidden")
    ) {
      closeSubjectChooser();
    }
  });
}

function updateUnlockButton() {
  const unlockProBtn = getEl("unlockProBtn");
  if (!unlockProBtn) return;

  if (
    typeof window.hasPaidAccess === "function" &&
    window.hasPaidAccess()
  ) {
    unlockProBtn.classList.add("is-hidden");
  } else {
    unlockProBtn.classList.remove("is-hidden");
  }
}

async function initProfileState() {
  try {
    const firebaseUser = window.firebaseAuth?.currentUser || null;

    if (typeof window.updateProfileUI === "function") {
      window.updateProfileUI(firebaseUser);
    }
  } catch (error) {
    console.warn("initProfileState warning:", error);
  }
}

function updateProfileUI(user) {
  const loginBtn = getEl("loginBtn");
  const emailDisplay = getEl("userEmailDisplay");
  const topProfileAvatar = getEl("topProfileAvatar");
  const topProfileAvatarImg = getEl("topProfileAvatarImg");

  if (!loginBtn || !emailDisplay) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  try {
    const cachedProfile =
      JSON.parse(localStorage.getItem("dn_profile")) || null;

    const appMode = localStorage.getItem("dn_app_mode") || "guest";
    const isGuest = appMode === "guest";

    if (user?.email) {
      const displayName =
        cachedProfile?.name || user.email.split("@")[0] || "Profile";

      if (isMobile) {
        emailDisplay.textContent = "";
      } else {
        emailDisplay.textContent = cachedProfile?.name
          ? `${cachedProfile.name} · ${user.email}`
          : user.email;
      }

      loginBtn.innerHTML = isMobile ? "👤" : "🧑 Profile";
      loginBtn.setAttribute("title", displayName);

      if (topProfileAvatar && topProfileAvatarImg) {
        const avatarUrl =
          cachedProfile?.profile_photo_url ||
          "/assets/avatars/avatar-01.png";

        const freshAvatarUrl = avatarUrl.includes("?")
          ? `${avatarUrl}&t=${Date.now()}`
          : `${avatarUrl}?t=${Date.now()}`;

        topProfileAvatarImg.src = freshAvatarUrl;
        topProfileAvatar.classList.remove("is-hidden");
        topProfileAvatar.setAttribute("aria-hidden", "false");
      }

      return;
    }

    if (isGuest) {
      if (isMobile) {
        emailDisplay.textContent = "";
      } else {
        emailDisplay.textContent = "Guest Mode";
      }

      loginBtn.innerHTML = isMobile ? "👤" : "👤 Guest";
      loginBtn.setAttribute("title", "Guest Mode");

      if (topProfileAvatar && topProfileAvatarImg) {
        const avatarUrl =
          cachedProfile?.profile_photo_url ||
          "/assets/avatars/avatar-01.png";

        const freshAvatarUrl = avatarUrl.includes("?")
          ? `${avatarUrl}&t=${Date.now()}`
          : `${avatarUrl}?t=${Date.now()}`;

        topProfileAvatarImg.src = freshAvatarUrl;
        topProfileAvatar.classList.remove("is-hidden");
        topProfileAvatar.setAttribute("aria-hidden", "false");
      }

      return;
    }

    emailDisplay.textContent = "";
    loginBtn.innerHTML = isMobile ? "👤" : "👤 Profile";

    if (topProfileAvatar) {
      topProfileAvatar.classList.add("is-hidden");
      topProfileAvatar.setAttribute("aria-hidden", "true");
    }
  } catch (error) {
    emailDisplay.textContent = "";
    loginBtn.innerHTML = isMobile ? "👤" : "👤 Profile";

    if (topProfileAvatar) {
      topProfileAvatar.classList.add("is-hidden");
      topProfileAvatar.setAttribute("aria-hidden", "true");
    }
  }
}

window.updateProfileUI = updateProfileUI;

function setupUnlockButton() {
  const unlockProBtn = getEl("unlockProBtn");

  if (unlockProBtn) {
    unlockProBtn.addEventListener("click", () => {
      if (typeof window.openUnlockModal === "function") {
        window.openUnlockModal();
      } else {
        console.error("Unlock modal not available");
      }
    });
  }
}

function setupCustomizeApp() {
  const openBtn = document.getElementById("openCustomizeBtn");
  const settingsModal = document.getElementById("settingsModal");
  const modal = document.getElementById("customizeModal");
  const closeBtn = document.getElementById("closeCustomizeBtn");
  const wallpaperGrid = document.getElementById("wallpaperGrid");
  const saveBtn = document.getElementById("saveCustomizeBtn");
  const resetAllBtn = document.getElementById("resetAllThemesBtn");
  const resetScopeBtn = document.getElementById("resetScopeThemeBtn");
  const scopeButtons = Array.from(document.querySelectorAll(".customize-tab-btn"));
  const accentButtons = Array.from(document.querySelectorAll(".accent-swatch"));

  if (!openBtn || !modal || !wallpaperGrid) return;

  const STORAGE_KEY = "dn_theme_settings";

  const WALLPAPERS = [
    "gradient-1",
    "gradient-2",
    "gradient-3",
    "gradient-4",
    "gradient-5",
    "gradient-6",
    "dark-1",
    "dark-2",
    "dark-3",
    "space-1",
    "space-2",
    "nature-1",
    "nature-2",
  ];

  const DEFAULT_THEME = {
    wallpaper: "",
    accent: "blue",
  };

  const DEFAULT_SETTINGS = {
    global: { ...DEFAULT_THEME },
    home: { ...DEFAULT_THEME },
    notes: { ...DEFAULT_THEME },
    quiz: { ...DEFAULT_THEME },
    viewer: { ...DEFAULT_THEME },
  };

  let currentScope = "global";
  let settings = loadSettings();

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return {
        global: { ...DEFAULT_THEME, ...(raw?.global || {}) },
        home: { ...DEFAULT_THEME, ...(raw?.home || {}) },
        notes: { ...DEFAULT_THEME, ...(raw?.notes || {}) },
        quiz: { ...DEFAULT_THEME, ...(raw?.quiz || {}) },
        viewer: { ...DEFAULT_THEME, ...(raw?.viewer || {}) },
      };
    } catch (error) {
      console.warn("Theme settings load failed:", error);
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Theme settings save failed:", error);
    }
  }

  function getPageScope() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("/notes/") || path.includes("/subjects/")) return "notes";
    if (path.includes("/pp-quiz/")) return "quiz";
    if (path.includes("/topics/viewer")) return "viewer";
    if (path.includes("/index.html") || path === "/" || path.endsWith("/")) return "home";

    return "global";
  }

  function getEffectiveTheme(scope) {
    const scoped = settings[scope] || DEFAULT_THEME;
    const global = settings.global || DEFAULT_THEME;

    return {
      wallpaper: scoped.wallpaper || global.wallpaper || "",
      accent: scoped.accent || global.accent || "blue",
    };
  }

  function applyThemeToPage() {
    const pageScope = getPageScope();
    const theme = getEffectiveTheme(pageScope);

    document.body.classList.remove(
      "wallpaper-gradient-1",
      "wallpaper-gradient-2",
      "wallpaper-gradient-3",
      "wallpaper-gradient-4",
      "wallpaper-gradient-5",
      "wallpaper-gradient-6",
      "wallpaper-dark-1",
      "wallpaper-dark-2",
      "wallpaper-dark-3",
      "wallpaper-space-1",
      "wallpaper-space-2",
      "wallpaper-nature-1",
      "wallpaper-nature-2",
      "accent-purple",
      "accent-pink",
      "accent-gold",
      "accent-green",
      "accent-orange"
    );

    if (theme.wallpaper) {
      document.body.classList.add(`wallpaper-${theme.wallpaper}`);
    }

    if (theme.accent && theme.accent !== "blue") {
      document.body.classList.add(`accent-${theme.accent}`);
    }
  }

  function renderWallpapers() {
    wallpaperGrid.innerHTML = "";

    const activeWallpaper = settings[currentScope]?.wallpaper || "";

    WALLPAPERS.forEach((wallpaper) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "wallpaper-tile";
      tile.dataset.wallpaper = wallpaper;
      tile.setAttribute("aria-label", wallpaper);

      if (activeWallpaper === wallpaper) {
        tile.classList.add("active");
      }

      const preview = document.createElement("div");
      preview.className = `wallpaper-preview wallpaper-${wallpaper}`;
      tile.appendChild(preview);

      tile.addEventListener("click", () => {
        settings[currentScope].wallpaper = wallpaper;
        renderWallpapers();
      });

      wallpaperGrid.appendChild(tile);
    });
  }

  function renderAccents() {
    const activeAccent = settings[currentScope]?.accent || "blue";

    accentButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accent === activeAccent);
    });
  }

  function renderScopeButtons() {
    scopeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scope === currentScope);
    });
  }

  function renderCustomizeUi() {
    renderScopeButtons();
    renderWallpapers();
    renderAccents();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", () => {
    if (settingsModal) {
      settingsModal.classList.add("hidden");
      settingsModal.setAttribute("aria-hidden", "true");
    }

    renderCustomizeUi();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  closeBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  scopeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentScope = btn.dataset.scope || "global";
      renderCustomizeUi();
    });
  });

  accentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      settings[currentScope].accent = btn.dataset.accent || "blue";
      renderAccents();
    });
  });

  saveBtn?.addEventListener("click", () => {
    saveSettings();
    applyThemeToPage();

    if (window.showToast) {
      window.showToast("🎨 Theme updated");
    }

    closeModal();
  });

  resetScopeBtn?.addEventListener("click", () => {
    settings[currentScope] = { ...DEFAULT_THEME };
    renderCustomizeUi();
  });

  resetAllBtn?.addEventListener("click", () => {
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    renderCustomizeUi();
    saveSettings();
    applyThemeToPage();

    if (window.showToast) {
      window.showToast("↺ All themes reset");
    }
  });

  applyThemeToPage();
}

async function initPage() {
  applyPerformanceMode();

  setupEntryModal();
  setupInstallPrompt();
  setupRefreshActions();
  setupPullToRefresh();
  setupOnboarding();
  setupSplash();
  setupSubjectChooser();
  setupUnlockButton();

  updateUnlockButton();
  await initProfileState();
  renderDashboard();
  await checkCatalogVersion();

  setupSettingsModal();

  setupCustomizeApp();
}

registerServiceWorker(APP_PATH);
initPage();
