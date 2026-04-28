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
  const refreshFromSettingsBtn = document.getElementById("refreshFromSettingsBtn");
  const openProfileBtn = document.getElementById("openProfileBtn");
  const switchAccountSettingsBtn = document.getElementById("switchAccountSettingsBtn");

  if (!settingsBtn || !modal) return;

  function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  refreshFromSettingsBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("refreshBtn")?.click();
  });

  openProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
    document.getElementById("loginBtn")?.click();
  });

  switchAccountSettingsBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
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
  const closeMenuBtn = document.getElementById("closeCustomizeMenuBtn");
  const menuPanel = document.getElementById("customizeMenuPanel");
  const menuActions = document.getElementById("customizeMenuActions");
  const editorPanel = document.getElementById("customizeEditorPanel");
  const wallpaperPanel = document.getElementById("customizeWallpaperPanel");
  const glassPanel = document.getElementById("customizeGlassPanel");
  const customizeWallpaperBtn = document.getElementById("customizeWallpaperBtn");
  const customizeGlassBtn = document.getElementById("customizeGlassBtn");
  const backCustomizeMenuBtn = document.getElementById("backCustomizeMenuBtn");
  const wallpaperGrid = document.getElementById("wallpaperGrid");
  const glassPackGrid = document.getElementById("glassPackGrid");
  const glassColorSection = document.getElementById("glassColorSection");
  const glassSliderSection = document.getElementById("glassSliderSection");
  const glassOpacityRange = document.getElementById("glassOpacityRange");
  const glassQualityRange = document.getElementById("glassQualityRange");
  const buttonGlassOpacityRange = document.getElementById("buttonGlassOpacityRange");
  const buttonGlassQualityRange = document.getElementById("buttonGlassQualityRange");
  const glassColorGrid = document.getElementById("glassColorGrid");
  const saveBtn = document.getElementById("saveCustomizeBtn");
  const resetAllBtn = document.getElementById("resetAllThemesBtn");
  const resetScopeBtn = document.getElementById("resetScopeThemeBtn");
  const resetScopeGlassBtn = document.getElementById("resetScopeGlassBtn");
  const scopeButtons = Array.from(document.querySelectorAll(".customize-tab-btn"));
  const accentButtons = Array.from(document.querySelectorAll(".accent-swatch"));
  const glassColorButtons = Array.from(document.querySelectorAll(".glass-color-swatch"));

  if (
    !openBtn ||
    !modal ||
    !wallpaperGrid ||
    !glassPackGrid ||
    typeof window.dnThemeLoadSettings !== "function" ||
    typeof window.dnThemeSaveSettings !== "function" ||
    typeof window.dnThemeApplyToCurrentPage !== "function" ||
    !Array.isArray(window.DN_THEME_WALLPAPERS)
  ) {
    return;
  }

  const DEFAULT_SCOPE_THEME = {
    wallpaper: "",
    accent: "blue",
    glassPack: "",
    glassColor: "blue",
    glassOpacity: 55,
    glassQuality: 18,
    buttonGlassOpacity: 55,
    buttonGlassQuality: 14,
  };

  let settings = window.dnThemeLoadSettings();
  let currentScope = "global";
  let currentPanel = "menu";

  function cloneThemeState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getScopeTheme(scope) {
    if (!settings[scope]) {
      settings[scope] = { ...DEFAULT_SCOPE_THEME };
    }

    settings[scope] = {
      ...DEFAULT_SCOPE_THEME,
      ...settings[scope],
    };

    return settings[scope];
  }

  function getGlassCardPacks() {
    if (typeof window.dnStoreGetGlassCardPacks === "function") {
      return window.dnStoreGetGlassCardPacks();
    }

    return window.DN_CONFIG?.STORE?.GLASS_CARD_PACKS || [];
  }

  function isGlassPackActive(packId) {
    if (typeof window.dnStoreIsGlassPackActive === "function") {
      return window.dnStoreIsGlassPackActive(packId);
    }

    if (typeof window.dnThemeIsGlassPackActive === "function") {
      return window.dnThemeIsGlassPackActive(packId);
    }

    return false;
  }

  function renderScopeButtons() {
    scopeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scope === currentScope);
    });
  }

  function renderAccentButtons() {
    const activeAccent = getScopeTheme(currentScope).accent || "blue";

    accentButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accent === activeAccent);
    });
  }

  function renderWallpaperGrid() {
    const activeWallpaper = getScopeTheme(currentScope).wallpaper || "";
    wallpaperGrid.innerHTML = "";

    const visibleWallpapers = window.DN_THEME_WALLPAPERS.filter((wallpaper) => {
      if (!wallpaper.premium) return true;

      if (typeof window.dnStoreIsWallpaperActive !== "function") {
        return false;
      }

      return window.dnStoreIsWallpaperActive(wallpaper.id);
    });

    visibleWallpapers.forEach((wallpaper) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "wallpaper-tile";
      tile.dataset.wallpaper = wallpaper.id;
      tile.setAttribute("aria-label", wallpaper.id);

      if (wallpaper.id === activeWallpaper) {
        tile.classList.add("active");
      }

      if (typeof window.dnThemeBuildWallpaperPreview === "function") {
        tile.appendChild(window.dnThemeBuildWallpaperPreview(wallpaper));
      }

      tile.addEventListener("click", () => {
        getScopeTheme(currentScope).wallpaper = wallpaper.id;
        renderWallpaperGrid();
        previewCurrentSelectionOnHome();
      });

      wallpaperGrid.appendChild(tile);
    });
  }

  function renderGlassPackGrid() {
    const scopeTheme = getScopeTheme(currentScope);
    const activePack = scopeTheme.glassPack || "";

    glassPackGrid.innerHTML = getGlassCardPacks()
      .map((pack) => {
        const unlocked = isGlassPackActive(pack.id);
        const selected = activePack === pack.id;

        return `
          <button
            class="glass-customize-card ${selected ? "active" : ""} ${unlocked ? "" : "locked"}"
            type="button"
            data-glass-pack="${pack.id}"
            ${unlocked ? "" : "disabled"}
          >
            <span class="glass-customize-icon">${unlocked ? "🪟" : "🔒"}</span>
            <strong>${pack.label}</strong>
            <small>${unlocked ? pack.description : `${pack.cost} DN Tokens · Buy from Store`}</small>
          </button>
        `;
      })
      .join("");

    glassPackGrid.querySelectorAll("[data-glass-pack]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const packId = btn.dataset.glassPack;
        if (!packId || !isGlassPackActive(packId)) return;

        getScopeTheme(currentScope).glassPack = packId;

        if (packId !== "glass_pack_3") {
          getScopeTheme(currentScope).glassColor = "blue";
        }

        renderGlassPackGrid();
        renderGlassColors();
        previewCurrentSelectionOnHome();
      });
    });
  }

  function renderGlassColors() {
    const scopeTheme = getScopeTheme(currentScope);
    const activePack = scopeTheme.glassPack || "";
    const canChangeColor = activePack === "glass_pack_3" && isGlassPackActive("glass_pack_3");

    if (glassColorSection) {
      glassColorSection.classList.toggle("hidden", !canChangeColor);
    }

    if (glassSliderSection) {
      glassSliderSection.classList.toggle("hidden", !activePack);
    }

    if (glassOpacityRange) {
      glassOpacityRange.value = String(scopeTheme.glassOpacity || 55);
    }

    if (glassQualityRange) {
      glassQualityRange.value = String(scopeTheme.glassQuality || 18);
    }

    if (buttonGlassOpacityRange) {
      buttonGlassOpacityRange.value = String(scopeTheme.buttonGlassOpacity || 55);
      buttonGlassOpacityRange.disabled = activePack === "glass_pack_1";
    }

    if (buttonGlassQualityRange) {
      buttonGlassQualityRange.value = String(scopeTheme.buttonGlassQuality || 14);
      buttonGlassQualityRange.disabled = activePack === "glass_pack_1";
    }

    const activeColor = scopeTheme.glassColor || "blue";

    glassColorButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.glassColor === activeColor);
      btn.disabled = !canChangeColor;
    });
  }
  
  [
    glassOpacityRange,
    glassQualityRange,
    buttonGlassOpacityRange,
    buttonGlassQualityRange,
  ].forEach((range) => {
    range?.addEventListener("input", () => {
      const scopeTheme = getScopeTheme(currentScope);

      scopeTheme.glassOpacity = Number(glassOpacityRange?.value || 55);
      scopeTheme.glassQuality = Number(glassQualityRange?.value || 18);
      scopeTheme.buttonGlassOpacity = Number(buttonGlassOpacityRange?.value || 55);
      scopeTheme.buttonGlassQuality = Number(buttonGlassQualityRange?.value || 14);

      previewCurrentSelectionOnHome();
    });
  });

  function previewCurrentSelectionOnHome() {
    if (currentScope === "global" || currentScope === "home") {
      window.dnThemeSaveSettings(cloneThemeState(settings));
      window.dnThemeApplyToCurrentPage();
    }
  }

  function showMenuPanel() {
    currentPanel = "menu";

    menuPanel?.classList.remove("hidden");
    menuActions?.classList.remove("hidden");
    editorPanel?.classList.add("hidden");
    wallpaperPanel?.classList.add("hidden");
    glassPanel?.classList.add("hidden");
  }

  function showWallpaperPanel() {
    currentPanel = "wallpaper";

    menuPanel?.classList.add("hidden");
    menuActions?.classList.add("hidden");
    editorPanel?.classList.remove("hidden");
    wallpaperPanel?.classList.remove("hidden");
    glassPanel?.classList.add("hidden");

    renderCustomizeUi();
  }

  function showGlassPanel() {
    currentPanel = "glass";

    menuPanel?.classList.add("hidden");
    menuActions?.classList.add("hidden");
    editorPanel?.classList.remove("hidden");
    wallpaperPanel?.classList.add("hidden");
    glassPanel?.classList.remove("hidden");

    renderCustomizeUi();
  }

  function renderCustomizeUi() {
    renderScopeButtons();
    renderAccentButtons();

    if (currentPanel === "wallpaper") {
      renderWallpaperGrid();
    }

    if (currentPanel === "glass") {
      renderGlassPackGrid();
      renderGlassColors();
    }
  }

  function openModal() {
    showMenuPanel();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  let originalSettings = cloneThemeState(settings);

  openBtn.addEventListener("click", () => {
    settings = window.dnThemeLoadSettings();
    originalSettings = cloneThemeState(settings);
    currentScope = "home";

    if (settingsModal) {
      settingsModal.classList.add("hidden");
      settingsModal.setAttribute("aria-hidden", "true");
    }

    openModal();
  });

  closeBtn?.addEventListener("click", closeModal);
  closeMenuBtn?.addEventListener("click", closeModal);
  backCustomizeMenuBtn?.addEventListener("click", showMenuPanel);

  customizeWallpaperBtn?.addEventListener("click", showWallpaperPanel);
  customizeGlassBtn?.addEventListener("click", showGlassPanel);

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
      getScopeTheme(currentScope).accent = btn.dataset.accent || "blue";
      renderAccentButtons();
      previewCurrentSelectionOnHome();
    });
  });

  glassColorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const scopeTheme = getScopeTheme(currentScope);

      if (scopeTheme.glassPack !== "glass_pack_3") return;
      if (!isGlassPackActive("glass_pack_3")) return;

      scopeTheme.glassColor = btn.dataset.glassColor || "blue";

      renderGlassColors();
      previewCurrentSelectionOnHome();
    });
  });

  resetScopeBtn?.addEventListener("click", () => {
    getScopeTheme(currentScope).wallpaper = "";
    renderCustomizeUi();
    previewCurrentSelectionOnHome();
  });

  resetScopeGlassBtn?.addEventListener("click", () => {
    getScopeTheme(currentScope).glassPack = "";
    getScopeTheme(currentScope).glassColor = "blue";
    getScopeTheme(currentScope).glassOpacity = 55;
    getScopeTheme(currentScope).glassQuality = 18;
    getScopeTheme(currentScope).buttonGlassOpacity = 55;
    getScopeTheme(currentScope).buttonGlassQuality = 14;
    renderCustomizeUi();
    previewCurrentSelectionOnHome();
  });

  resetAllBtn?.addEventListener("click", () => {
    settings = window.dnThemeResetAll
      ? window.dnThemeResetAll()
      : {
          global: { ...DEFAULT_SCOPE_THEME },
          home: { ...DEFAULT_SCOPE_THEME },
          notes: { ...DEFAULT_SCOPE_THEME },
          quiz: { ...DEFAULT_SCOPE_THEME },
          viewer: { ...DEFAULT_SCOPE_THEME },
        };

    window.dnThemeApplyToCurrentPage();

    if (window.showToast) {
      window.showToast("↺ All themes reset");
    }

    renderCustomizeUi();
  });

  saveBtn?.addEventListener("click", () => {
    window.dnThemeSaveSettings(cloneThemeState(settings));
    originalSettings = cloneThemeState(settings);
    window.dnThemeApplyToCurrentPage();

    if (window.showToast) {
      window.showToast("🎨 Theme updated");
    }

    closeModal();
  });

  window.dnThemeApplyToCurrentPage();
}

function showPaymentSuccessPopup() {
  let type = "";
  let tokens = "";
  let days = "";

  try {
    type = localStorage.getItem("dn_payment_success_type") || "";
    tokens = localStorage.getItem("dn_payment_success_tokens") || "";
    days = localStorage.getItem("dn_payment_success_days") || "";

    localStorage.removeItem("dn_payment_success_type");
    localStorage.removeItem("dn_payment_success_tokens");
    localStorage.removeItem("dn_payment_success_days");
  } catch {
    return;
  }

  if (!type) return;

  if (type === "dn_tokens") {
    showToast(`🪙 Success! You got ${tokens || "DN"} Tokens.`);
    return;
  }

  if (type === "pro") {
    showToast(`✨ DN Physics Pro activated. Notes and MCQs unlocked for ${days || "30"} days.`);
  }
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
  showPaymentSuccessPopup();  

  setupSettingsModal();
  setupCustomizeApp();
}

registerServiceWorker(APP_PATH);
initPage();
