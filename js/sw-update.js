let refreshingNow = false;
let fakeProgressTimer = null;

function getEl(id) {
  return document.getElementById(id);
}

function showLoadingOverlay() {
  const loadingOverlay = getEl("loadingOverlay");
  if (!loadingOverlay) return;
  loadingOverlay.classList.add("show");
  loadingOverlay.setAttribute("aria-hidden", "false");
}

function hideLoadingOverlay() {
  const loadingOverlay = getEl("loadingOverlay");
  if (!loadingOverlay) return;
  loadingOverlay.classList.remove("show");
  loadingOverlay.setAttribute("aria-hidden", "true");
}

function setLoadingText(text) {
  const loadingText = getEl("loadingText");
  if (loadingText) loadingText.textContent = text;
}

function showUpdateToast() {
  const updateToast = getEl("updateToast");
  if (!updateToast) return;
  updateToast.classList.add("show");
  updateToast.setAttribute("aria-hidden", "false");
}

function hideUpdateToast() {
  const updateToast = getEl("updateToast");
  if (!updateToast) return;
  updateToast.classList.remove("show");
  updateToast.setAttribute("aria-hidden", "true");
}

function startFakeProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  let progress = 0;
  let stage = "Checking update...";

  setLoadingText(`${stage} 0%`);

  fakeProgressTimer = setInterval(() => {
    if (progress < 25) {
      stage = "Checking update...";
      progress += 5;
    } else if (progress < 55) {
      stage = "Downloading files...";
      progress += 4;
    } else if (progress < 85) {
      stage = "Applying update...";
      progress += 2;
    } else if (progress < 95) {
      stage = "Finalizing...";
      progress += 1;
    }

    if (progress > 95) progress = 95;
    setLoadingText(`${stage} ${progress}%`);
  }, 160);
}

function finishFakeProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  setLoadingText("Update complete 🚀 100%");
}

function isUserBusy() {
  return window.location.pathname.includes("quiz.html");
}

function showBusyUpdateMessage() {
  hideUpdateToast();
  setTimeout(() => {
    if (typeof window.showToast === "function") {
      window.showToast("Finish quiz first ⚠️");
    }
  }, 80);
}

async function performSafeUpdate() {
  if (refreshingNow) return;
  refreshingNow = true;

  showLoadingOverlay();
  startFakeProgress();

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        await registration.update();

        if (registration.waiting) {
          setLoadingText("Applying update... 95%");
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          return;
        }
      }
    }

    finishFakeProgress();
    setTimeout(() => {
      window.location.reload();
    }, 250);
  } catch (error) {
    console.log("Safe update error:", error);
    finishFakeProgress();
    setTimeout(() => {
      window.location.reload();
    }, 250);
  }
}

async function registerServiceWorker(appPath = "") {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register(
      `${appPath}/service-worker.js`,
    );
    console.log("✅ Service Worker registered:", registration.scope);

    await registration.update();

    setTimeout(() => {
      registration.update().catch((error) => {
        console.log("SW immediate recheck failed:", error);
      });
    }, 1200);

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          showUpdateToast();
        }
      });
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data) return;

      if (event.data.type === "SW_UPDATED") {
        console.log("✅ Service worker updated:", event.data.version);
        if (typeof window.showToast === "function") {
          window.showToast("🚀 Updating app...");
        }
        setTimeout(() => {
          window.location.reload();
        }, 300);
        return;
      }

      if (event.data.type === "SW_VERSION_READY") {
        console.log("✅ Service worker ready:", event.data.version);
        return;
      }

      if (event.data.type === "FORCE_RELOAD") {
        window.location.reload();
      }
    });
  } catch (error) {
    console.log("❌ Service Worker failed:", error);
  }
}

function setupRefreshActions() {
  const refreshBtn = getEl("refreshBtn");
  const toastRefreshBtn = getEl("toastRefreshBtn");
  const toastDismissBtn = getEl("toastDismissBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      if (isUserBusy()) {
        showBusyUpdateMessage();
        return;
      }
      await performSafeUpdate();
    });
  }

  if (toastRefreshBtn) {
    toastRefreshBtn.addEventListener("click", async () => {
      if (isUserBusy()) {
        showBusyUpdateMessage();
        return;
      }

      hideUpdateToast();
      await performSafeUpdate();
    });
  }

  if (toastDismissBtn) {
    toastDismissBtn.addEventListener("click", () => {
      hideUpdateToast();
    });
  }
}

export {
  hideLoadingOverlay,
  hideUpdateToast,
  isUserBusy,
  performSafeUpdate,
  registerServiceWorker,
  setupRefreshActions,
  setLoadingText,
  showBusyUpdateMessage,
  showLoadingOverlay,
  showUpdateToast,
  startFakeProgress,
  finishFakeProgress,
};
