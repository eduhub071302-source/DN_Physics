let refreshingNow = false;
let fakeProgressTimer = null;
let currentProgress = 0;

const UPDATE_TOTAL_BYTES = 2.8 * 1024 * 1024;

function getEl(id) {
  return document.getElementById(id);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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

function showUpdateModal() {
  const modal = getEl("updateModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function hideUpdateModal() {
  const modal = getEl("updateModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setUpdateProgress(progress, stageText = "Updating app...") {
  const safeProgress = Math.max(0, Math.min(100, progress));
  currentProgress = safeProgress;

  const fill = getEl("updateProgressFill");
  const percent = getEl("updatePercentText");
  const stage = getEl("updateStageText");
  const size = getEl("updateSizeText");

  if (fill) fill.style.width = `${safeProgress}%`;
  if (percent) percent.textContent = `${Math.round(safeProgress)}%`;
  if (stage) stage.textContent = stageText;

  const doneBytes = (UPDATE_TOTAL_BYTES * safeProgress) / 100;
  if (size) {
    size.textContent = `${formatBytes(doneBytes)} / ${formatBytes(UPDATE_TOTAL_BYTES)}`;
  }

  setLoadingText(`${stageText} ${Math.round(safeProgress)}%`);
}

function startGameStyleProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  currentProgress = 0;
  setUpdateProgress(0, "Preparing update...");

  fakeProgressTimer = setInterval(() => {
    let stage = "Preparing update...";

    if (currentProgress < 18) {
      currentProgress += 3;
      stage = "Checking package...";
    } else if (currentProgress < 42) {
      currentProgress += 2.8;
      stage = "Downloading assets...";
    } else if (currentProgress < 68) {
      currentProgress += 2.1;
      stage = "Installing files...";
    } else if (currentProgress < 88) {
      currentProgress += 1.2;
      stage = "Optimizing resources...";
    } else if (currentProgress < 96) {
      currentProgress += 0.6;
      stage = "Finalizing update...";
    }

    if (currentProgress > 96) currentProgress = 96;
    setUpdateProgress(currentProgress, stage);
  }, 180);
}

function finishGameStyleProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  setUpdateProgress(100, "Reconnect complete 🚀");
}

function isUserBusy() {
  return window.location.pathname.includes("quiz.html");
}

function showBusyUpdateMessage() {
  setTimeout(() => {
    if (typeof window.showToast === "function") {
      window.showToast("Finish quiz first ⚠️");
    }
  }, 80);
}

async function performSafeUpdate() {
  if (refreshingNow) return;
  refreshingNow = true;

  showUpdateModal();
  showLoadingOverlay();
  startGameStyleProgress();

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        await registration.update();

        if (registration.waiting) {
          setUpdateProgress(97, "Applying update...");
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          return;
        }
      }
    }

    finishGameStyleProgress();

    setTimeout(() => {
      window.location.reload();
    }, 700);
  } catch (error) {
    console.log("Safe update error:", error);
    finishGameStyleProgress();

    setTimeout(() => {
      window.location.reload();
    }, 700);
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
          showUpdateModal();
          setUpdateProgress(0, "Update ready to install");
        }
      });
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data) return;

      if (event.data.type === "SW_UPDATED") {
        console.log("✅ Service worker updated:", event.data.version);
        finishGameStyleProgress();

        setTimeout(() => {
          window.location.reload();
        }, 700);
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
  const updateNowBtn = getEl("updateNowBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      if (isUserBusy()) {
        showBusyUpdateMessage();
        return;
      }
      await performSafeUpdate();
    });
  }

  if (updateNowBtn) {
    updateNowBtn.addEventListener("click", async () => {
      if (isUserBusy()) {
        showBusyUpdateMessage();
        return;
      }

      await performSafeUpdate();
    });
  }
}

export {
  hideLoadingOverlay,
  hideUpdateModal,
  isUserBusy,
  performSafeUpdate,
  registerServiceWorker,
  setupRefreshActions,
  setLoadingText,
  setUpdateProgress,
  showBusyUpdateMessage,
  showLoadingOverlay,
  showUpdateModal,
  startGameStyleProgress,
  finishGameStyleProgress,
};
