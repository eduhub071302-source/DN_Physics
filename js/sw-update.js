const SW_VERSION = "368";

let refreshingNow = false;
let fakeProgressTimer = null;
let currentProgress = 0;
let forceReloadTimer = null;
let controllerChangeBound = false;
let updateReady = false;
let lastKnownRegistration = null;

const SEEN_UPDATE_KEY = "dn_seen_update_version";

function getSeenUpdateVersion() {
  try {
    return localStorage.getItem(SEEN_UPDATE_KEY) || "";
  } catch {
    return "";
  }
}

function setSeenUpdateVersion(version) {
  try {
    localStorage.setItem(SEEN_UPDATE_KEY, version || "");
  } catch {}
}

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

function setUpdateProgress(progress, stageText = "Updating app", detailText = "Please wait") {
  const safeProgress = Math.max(0, Math.min(100, progress));
  currentProgress = safeProgress;

  const fill = getEl("updateProgressFill");
  const percent = getEl("updatePercentText");
  const stage = getEl("updateStageText");
  const size = getEl("updateSizeText");

  if (fill) fill.style.width = `${safeProgress}%`;
  if (percent) percent.textContent = `${Math.round(safeProgress)}%`;
  if (stage) stage.textContent = stageText;
  if (size) size.textContent = detailText;

  setLoadingText(`${stageText} ${Math.round(safeProgress)}%`);
}

function startUpdateProgressFlow() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  currentProgress = 10;
  setUpdateProgress(10, "Checking for update", "Preparing app update");

  fakeProgressTimer = setInterval(() => {
    if (currentProgress < 30) {
      currentProgress += 10;
      setUpdateProgress(currentProgress, "Checking for update", "Preparing app update");
      return;
    }

    if (currentProgress < 55) {
      currentProgress += 5;
      setUpdateProgress(currentProgress, "Installing update", "Updating app files");
      return;
    }

    if (currentProgress < 80) {
      currentProgress += 5;
      setUpdateProgress(currentProgress, "Installing update", "Finalizing update files");
      return;
    }

    if (currentProgress < 90) {
      currentProgress += 2;
      setUpdateProgress(currentProgress, "Restarting app", "Preparing refreshed version");
      return;
    }

    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }, 350);
}

function finishUpdateProgressFlow() {
  if (fakeProgressTimer) {
    clearInterval(fakeProgressTimer);
    fakeProgressTimer = null;
  }

  setUpdateProgress(100, "Updated", "Reloading app");
}

function isUserBusy() {
  return window.location.pathname.includes("quiz.html");
}

function showBusyUpdateMessage() {
  setTimeout(() => {
    if (typeof window.showToast === "function") {
      window.showToast("Finish quiz first");
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
  finishUpdateProgressFlow();

  setTimeout(() => {
    window.location.reload();
  }, 650);
}

function bindControllerChangeReload() {
  if (controllerChangeBound || !("serviceWorker" in navigator)) return;
  controllerChangeBound = true;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshingNow) return;
    setUpdateProgress(99, "Restarting app", "Loading updated version");
    safeReloadNow();
  });
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) return null;

  const registration =
    lastKnownRegistration || (await navigator.serviceWorker.getRegistration());

  if (!registration) return null;

  lastKnownRegistration = registration;
  return registration;
}

async function detectUpdateState() {
  try {
    const registration = await getRegistration();
    if (!registration) {
      updateReady = false;
      return { registration: null, hasWaiting: false, hasReadySignal: false };
    }

    await registration.update();

    const hasWaiting = Boolean(registration.waiting);
    const hasReadySignal = Boolean(updateReady);

    return { registration, hasWaiting, hasReadySignal };
  } catch (error) {
    console.warn("Update check failed:", error);
    return { registration: null, hasWaiting: false, hasReadySignal: false };
  }
}

async function performSafeUpdate() {
  if (refreshingNow) return;

  showUpdateModal();
  showLoadingOverlay();
  setUpdateProgress(10, "Checking for update", "Preparing app update");

  const { registration, hasWaiting, hasReadySignal } = await detectUpdateState();

  if (!hasWaiting && !hasReadySignal) {
    hideUpdateModal();
    hideLoadingOverlay();
    refreshingNow = false;

    if (typeof window.showToast === "function") {
      window.showToast("App is already up to date");
    }
    return;
  }

  refreshingNow = true;
  bindControllerChangeReload();
  startUpdateProgressFlow();

  try {
    if (registration && registration.waiting) {
      setUpdateProgress(92, "Restarting app", "Applying updated version");
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      clearForceReloadTimer();
      forceReloadTimer = setTimeout(() => {
        setUpdateProgress(96, "Restarting app", "Reloading updated version");
        safeReloadNow();
      }, 8000);

      return;
    }

    if (hasReadySignal) {
      setUpdateProgress(96, "Restarting app", "Loading updated version");
      safeReloadNow();
      return;
    }

    setUpdateProgress(96, "Restarting app", "Reloading updated version");
    safeReloadNow();
  } catch (error) {
    console.warn("Update process error:", error);
    setUpdateProgress(96, "Restarting app", "Recovering update");
    safeReloadNow();
  }
}

async function registerServiceWorker(appPath = "") {
  if (!("serviceWorker" in navigator)) return;

  try {
    const swUrl = `${appPath}/service-worker.js?v=${SW_VERSION}`;
    const registration = await navigator.serviceWorker.register(swUrl, {
      updateViaCache: "none",
    });

    lastKnownRegistration = registration;
    console.log("Service worker registered");

    if (registration.active) {
      console.log("SW active script:", registration.active.scriptURL);
    }
    if (registration.installing) {
      console.log("SW installing script:", registration.installing.scriptURL);
    }
    if (registration.waiting) {
      console.log("SW waiting script:", registration.waiting.scriptURL);
    }

    bindControllerChangeReload();
    await registration.update();

    setTimeout(() => {
      registration.update().catch((error) => {
        console.warn("Service worker recheck failed:", error);
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
          setUpdateProgress(0, "Update ready", "A new version is ready to install");
        }
      });
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data) return;

      if (event.data.type === "SW_UPDATED") {
        const version = event.data.version || "";
        if (getSeenUpdateVersion() === version) return;

        setSeenUpdateVersion(version);
        updateReady = true;
        showUpdateModal();
        setUpdateProgress(0, "Update ready", "A new version is ready to install");
        return;
      }

      if (event.data.type === "SW_VERSION_READY") {
        console.log("Service worker ready:", event.data.version || "");
      }
    });
  } catch (error) {
    console.warn("Service worker failed:", error);
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
  startUpdateProgressFlow,
  finishUpdateProgressFlow,
};
