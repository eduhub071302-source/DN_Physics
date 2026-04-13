import {
  registerServiceWorker,
  setupRefreshActions,
  performSafeUpdate,
  isUserBusy,
  showBusyUpdateMessage,
} from "/js/sw-update.js";
import { renderDashboard, checkCatalogVersion } from "/js/dashboard.js";
import { setupOnboarding, startOnboarding } from "/js/onboarding.js";

const APP_PATH = "";

let deferredPrompt = null;
let touchStartY = 0;
let pullTriggered = false;

function getEl(id) {
  return document.getElementById(id);
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
  const SPLASH_TOTAL_MS = 5200;
  const SPLASH_FADE_MS = 700;

  window.addEventListener("load", () => {
    if (!appSplash) {
      document.body.classList.add("app-ready");
      setTimeout(() => {
        startOnboarding();
      }, 300);
      return;
    }

    document.body.classList.remove("app-ready");

    setTimeout(() => {
      appSplash.classList.add("hide");
    }, SPLASH_TOTAL_MS - SPLASH_FADE_MS);

    setTimeout(() => {
      document.body.classList.add("app-ready");
      setTimeout(() => {
        startOnboarding();
      }, 250);
    }, SPLASH_TOTAL_MS);
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
    } else {
      emailDisplay.textContent = "";
      loginBtn.innerHTML = isMobile ? "👤" : "👤 Profile";

      if (topProfileAvatar) {
        topProfileAvatar.classList.add("is-hidden");
        topProfileAvatar.setAttribute("aria-hidden", "true");
      }
    }
  } catch (error) {
    if (user?.email) {
      emailDisplay.textContent = isMobile ? "" : user.email;
      loginBtn.innerHTML = isMobile ? "👤" : "🧑 Profile";
    } else {
      emailDisplay.textContent = "";
      loginBtn.innerHTML = isMobile ? "👤" : "👤 Profile";
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
        console.error("openUnlockModal missing");
      }
    });
  }
}

async function initPage() {
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
}

registerServiceWorker(APP_PATH);
initPage();
