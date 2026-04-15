let refreshingNow = false;
let fakeProgressTimer = null;
let currentProgress = 0;
let forceReloadTimer = null;
let controllerChangeBound = false;
let stageRotateTimer = null;
let updateReady = false;
let lastKnownRegistration = null;

const UPDATE_TOTAL_BYTES = 2.8 * 1024 * 1024;

const STAGE_GROUPS = {
  early: [
    "Scanning update package...",
    "Checking core files...",
    "Reading version manifest...",
  ],
  download: [
    "Downloading core assets...",
    "Updating interface files...",
    "Refreshing app resources...",
  ],
  install: [
    "Installing update package...",
    "Applying new files...",
    "Updating cached resources...",
  ],
  optimize: [
    "Optimizing startup assets...",
    "Refreshing offline cache...",
    "Aligning app modules...",
  ],
  final: [
    "Preparing restart...",
    "Reconnecting services...",
    "Finalizing update...",
  ],
};

function getEl(id) {
  return document.getElementById(id);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function pickStage(groupName) {
  const list = STAGE_GROUPS[groupName] || ["Updating app..."];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
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

function stopStageRotation() {
  if (stageRotateTimer) {
    clearInterval(stageRotateTimer);
    stageRotateTimer = null;
  }
}

function startStageRotation() {
  stopStageRotation();

  stageRotateTimer = setInterval(() => {
    if (currentProgress < 18) {
      setUpdateProgress(currentProgress, pickStage("early"));
      return;
    }
    if (currentProgress < 42) {
      setUpdateProgress(currentProgress, pickStage("download"));
      return;
    }
    if (currentProgress < 68) {
      setUpdateProgress(currentProgress, pickStage("install"));
      return;
    }
    if (currentProgress < 94) {
      setUpdateProgress(currentProgress, pickStage("optimize"));
      return;
    }
    if (currentProgress < 100) {
      setUpdateProgress(currentProgress, pickStage("final"));
    }
  }, 900);
}

function startGameStyleProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  currentProgress = 0;
  setUpdateProgress(0, "Preparing update...");
  startStageRotation();

  fakeProgressTimer = setInterval(() => {
    let stage = "Preparing update...";

    if (currentProgress < 18) {
      currentProgress += 3;
      stage = pickStage("early");
    } else if (currentProgress < 42) {
      currentProgress += 2.8;
      stage = pickStage("download");
    } else if (currentProgress < 68) {
      currentProgress += 2.1;
      stage = pickStage("install");
    } else if (currentProgress < 88) {
      currentProgress += 1.2;
      stage = pickStage("optimize");
    } else if (currentProgress < 94) {
      currentProgress += 0.5;
      stage = pickStage("final");
    }

    if (currentProgress > 94) currentProgress = 94;
    setUpdateProgress(currentProgress, stage);
  }, 180);
}

function stopGameStyleProgress() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }
  stopStageRotation();
}

function finishGameStyleProgress() {
  stopGameStyleProgress();
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

function clearForceReloadTimer() {
  if (forceReloadTimer) {
    clearTimeout(forceReloadTimer);
    forceReloadTimer = null;
  }
}

function safeReloadNow() {
  clearForceReloadTimer();
  updateReady = false;
  finishGameStyleProgress();

  setTimeout(() => {
    window.location.reload();
  }, 650);
}

function bindControllerChangeReload() {
  if (controllerChangeBound || !("serviceWorker" in navigator)) return;
  controllerChangeBound = true;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshingNow) return;
    setUpdateProgress(99, "Reconnecting services...");
    safeReloadNow();
  });
}

async function hasWaitingUpdate() {
  try {
    if (!("serviceWorker" in navigator)) return false;

    const registration =
      lastKnownRegistration || (await navigator.serviceWorker.getRegistration());

    if (!registration) return false;

    lastKnownRegistration = registration;

    await registration.update();

    if (registration.waiting) {
      updateReady = true;
      return true;
    }

    updateReady = false;
    return false;
  } catch (error) {
    console.warn("Update check failed");
    return false;
  }
}

async function performSafeUpdate() {
  if (refreshingNow) return;

  const hasUpdate = await hasWaitingUpdate();

  if (!hasUpdate) {
    hideUpdateModal();
    hideLoadingOverlay();
    refreshingNow = false;

    if (typeof window.showToast === "function") {
      window.showToast("✅ App is already up to date");
    }
    return;
  }

  refreshingNow = true;

  showUpdateModal();
  showLoadingOverlay();
  startGameStyleProgress();
  bindControllerChangeReload();

  try {
    const registration =
      lastKnownRegistration || (await navigator.serviceWorker.getRegistration());

    if (registration) {
      lastKnownRegistration = registration;

      if (registration.waiting) {
        setUpdateProgress(96, "Applying final patch...");
        registration.waiting.postMessage({ type: "SKIP_WAITING" });

        clearForceReloadTimer();
        forceReloadTimer = setTimeout(() => {
          setUpdateProgress(99, "Restoring connection...");
          safeReloadNow();
        }, 8000);

        return;
      }
    }

    setUpdateProgress(98, "Completing update...");
    safeReloadNow();
  } catch (error) {
    console.log("Safe update error:", error);
    setUpdateProgress(98, "Recovering update...");
    safeReloadNow();
  }
}

async function registerServiceWorker(appPath = "") {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register(
      `${appPath}/service-worker.js`,
    );
    lastKnownRegistration = registration;
    console.log("✅ Service Worker registered:", registration.scope);

    bindControllerChangeReload();
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
          navigator.serviceWorker.controller &&
          registration.waiting
        ) {
          updateReady = true;
          showUpdateModal();
          setUpdateProgress(0, "Update ready to install");
        }
      });
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data) return;

      if (event.data.type === "SW_UPDATED") {
        console.log("✅ Service worker updated:", event.data.version);
        setUpdateProgress(99, "Reconnecting services...");
        safeReloadNow();
        return;
      }

      if (event.data.type === "SW_VERSION_READY") {
        console.log("✅ Service worker ready:", event.data.version);
        return;
      }

      if (event.data.type === "FORCE_RELOAD") {
        safeReloadNow();
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

      setTimeout(() => {
        if (!refreshingNow) {
          hideUpdateModal();
          hideLoadingOverlay();
        }
      }, 1500);
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
