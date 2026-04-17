let onboardingSteps = [];
let onboardingIndex = 0;
let onboardingRepositionTimer = null;

function getEl(id) {
  return document.getElementById(id);
}

function isMobileDevice() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function buildOnboardingSteps() {
  const installBtn = getEl("installBtn");
  const mobile = isMobileDevice();

  const steps = [
    {
      target: "#onboardPractice",
      badge: "Mission 01",
      title: "Start Your First Battle",
      text: "Tap here to launch MCQ practice. This is your main game mode for building speed, accuracy, and exam confidence.",
      action: "Open Practice",
    },
    {
      target: "#onboardNotes",
      badge: "Mission 02",
      title: "Unlock Revision Power",
      text: "Use Notes when you want a cleaner learning path before answering MCQs. Read fast, revise smart, and come back stronger.",
      action: "Explore Notes",
    },
    {
      target: "#musicToggleBtn",
      badge: "Mission 03",
      title: "Activate Focus Mode",
      text: "Open the music player for deep-focus study sessions. Use it like a game buff for concentration.",
      action: "Enable Focus",
    },
    {
      target: "#refreshBtn",
      badge: "Mission 04",
      title: "Sync the Latest Version",
      text: mobile
        ? "Pull down or use this button to refresh the app and load the newest improvements."
        : "Use this button to refresh the app and sync the newest improvements.",
      action: "Refresh App",
    },
  ];

  if (installBtn && !installBtn.classList.contains("is-hidden")) {
    steps.push({
      target: "#installBtn",
      badge: "Mission 05",
      title: "Install for Faster Access",
      text: "Install DinuuNOVA to open it faster like a real app and get a smoother experience on your device.",
      action: "Install App",
    });
  }

  return steps;
}

function setOnboardingSeen() {
  localStorage.setItem("dnPhysicsOnboardingSeen", "true");
}

function hasSeenOnboarding() {
  return localStorage.getItem("dnPhysicsOnboardingSeen") === "true";
}

function hideOnboarding() {
  const onboardingOverlay = getEl("onboardingOverlay");
  if (!onboardingOverlay) return;

  onboardingOverlay.classList.add("is-hidden");
  onboardingOverlay.setAttribute("aria-hidden", "true");
  setOnboardingSeen();
}

function updateProgress() {
  const progressText = getEl("onboardingProgressText");
  const progressFill = getEl("onboardingProgressFill");

  const total = onboardingSteps.length || 1;
  const current = Math.min(onboardingIndex + 1, total);
  const percent = (current / total) * 100;

  if (progressText) progressText.textContent = `${current} / ${total}`;
  if (progressFill) progressFill.style.width = `${percent}%`;
}

function getHeaderOffset() {
  const header =
    document.querySelector(".site-header") ||
    document.querySelector("header");

  return header ? header.offsetHeight : 76;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function scrollTargetIntoView(targetEl) {
  if (!targetEl) return;

  const mobile = isMobileDevice();
  const headerOffset = getHeaderOffset();
  const rect = targetEl.getBoundingClientRect();

  const safeTop = headerOffset + 16;
  const safeBottomReserved = mobile ? 290 : 220;

  let targetScrollY = window.scrollY;

  if (rect.top < safeTop) {
    targetScrollY += rect.top - safeTop;
  } else if (rect.bottom > window.innerHeight - safeBottomReserved) {
    targetScrollY += rect.bottom - (window.innerHeight - safeBottomReserved);
  }

  targetScrollY = Math.max(0, targetScrollY);

  window.scrollTo({
    top: targetScrollY,
    behavior: "smooth",
  });

  await new Promise((resolve) => setTimeout(resolve, 420));
}

function positionOnboarding(targetEl) {
  const onboardingSpotlight = getEl("onboardingSpotlight");
  const onboardingCard = getEl("onboardingCard");
  const onboardingArrow = getEl("onboardingArrow");

  if (!targetEl || !onboardingSpotlight || !onboardingCard || !onboardingArrow) {
    return;
  }

  const mobile = isMobileDevice();
  const headerOffset = getHeaderOffset();
  const viewportPadding = 12;
  const spotlightPadding = mobile ? 8 : 10;

  const rect = targetEl.getBoundingClientRect();

  onboardingSpotlight.style.top = `${rect.top - spotlightPadding}px`;
  onboardingSpotlight.style.left = `${rect.left - spotlightPadding}px`;
  onboardingSpotlight.style.width = `${rect.width + spotlightPadding * 2}px`;
  onboardingSpotlight.style.height = `${rect.height + spotlightPadding * 2}px`;

  onboardingCard.style.visibility = "hidden";
  onboardingCard.style.left = "12px";
  onboardingCard.style.top = "12px";

  const cardRect = onboardingCard.getBoundingClientRect();
  const cardWidth = cardRect.width || Math.min(window.innerWidth - 24, 360);
  const cardHeight = cardRect.height || 220;

  const safeLeft = viewportPadding;
  const safeRight = window.innerWidth - viewportPadding;
  const safeTop = headerOffset + 8;
  const safeBottom = window.innerHeight - viewportPadding;

  let cardLeft = safeLeft;
  let cardTop = safeTop;

  if (mobile) {
    cardLeft = safeLeft;
    cardTop = Math.max(safeTop, window.innerHeight - cardHeight - 12);

    onboardingArrow.style.display = "none";
  } else {
    onboardingArrow.style.display = "block";

    const spaceBelow = safeBottom - rect.bottom;
    const spaceAbove = rect.top - safeTop;
    const shouldPlaceBelow = spaceBelow >= cardHeight + 18 || spaceBelow >= spaceAbove;

    cardLeft = clamp(rect.left, safeLeft, safeRight - cardWidth);

    if (shouldPlaceBelow) {
      cardTop = clamp(rect.bottom + 18, safeTop, safeBottom - cardHeight);
      onboardingArrow.style.left = `${clamp(rect.left + 6, safeLeft + 6, safeRight - 28)}px`;
      onboardingArrow.style.top = `${clamp(rect.top + rect.height / 2 - 12, safeTop + 6, safeBottom - 28)}px`;
      onboardingArrow.style.transform = "rotate(0deg)";
    } else {
      cardTop = clamp(rect.top - cardHeight - 18, safeTop, safeBottom - cardHeight);
      onboardingArrow.style.left = `${clamp(rect.left + 6, safeLeft + 6, safeRight - 28)}px`;
      onboardingArrow.style.top = `${clamp(rect.top + rect.height / 2 - 12, safeTop + 6, safeBottom - 28)}px`;
      onboardingArrow.style.transform = "rotate(180deg)";
    }
  }

  onboardingCard.style.left = `${cardLeft}px`;
  onboardingCard.style.top = `${cardTop}px`;
  onboardingCard.style.visibility = "visible";
}

async function showOnboardingStep(index) {
  const step = onboardingSteps[index];

  if (!step) {
    hideOnboarding();
    return;
  }

  const onboardingTitle = getEl("onboardingTitle");
  const onboardingText = getEl("onboardingText");
  const onboardingNextBtn = getEl("onboardingNextBtn");
  const onboardingBadge = getEl("onboardingMissionBadge");
  const onboardingAction = getEl("onboardingActionHint");
  const targetEl = document.querySelector(step.target);

  if (!targetEl) {
    onboardingIndex += 1;
    showOnboardingStep(onboardingIndex);
    return;
  }

  if (onboardingBadge) onboardingBadge.textContent = step.badge || "Mission";
  if (onboardingTitle) onboardingTitle.textContent = step.title;
  if (onboardingText) onboardingText.textContent = step.text;
  if (onboardingAction) onboardingAction.textContent = step.action || "Continue";

  if (onboardingNextBtn) {
    onboardingNextBtn.textContent =
      index === onboardingSteps.length - 1 ? "Finish Mission" : "Next Mission";
  }

  updateProgress();

  await scrollTargetIntoView(targetEl);
  positionOnboarding(targetEl);
}

function setupOnboarding() {
  const onboardingOverlay = getEl("onboardingOverlay");
  const onboardingNextBtn = getEl("onboardingNextBtn");
  const onboardingSkipBtn = getEl("onboardingSkipBtn");

  if (!onboardingNextBtn || !onboardingSkipBtn) return;

  onboardingNextBtn.addEventListener("click", () => {
    onboardingIndex += 1;
    showOnboardingStep(onboardingIndex);
  });

  onboardingSkipBtn.addEventListener("click", () => {
    hideOnboarding();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!onboardingOverlay || onboardingOverlay.classList.contains("is-hidden")) return;

      clearTimeout(onboardingRepositionTimer);
      onboardingRepositionTimer = setTimeout(() => {
        const step = onboardingSteps[onboardingIndex];
        const targetEl = step ? document.querySelector(step.target) : null;
        if (targetEl) {
          positionOnboarding(targetEl);
        }
      }, 16);
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (!onboardingOverlay || onboardingOverlay.classList.contains("is-hidden")) return;

    clearTimeout(onboardingRepositionTimer);
    onboardingRepositionTimer = setTimeout(() => {
      const step = onboardingSteps[onboardingIndex];
      const targetEl = step ? document.querySelector(step.target) : null;
      if (targetEl) {
        positionOnboarding(targetEl);
      }
    }, 80);
  });
}

function startOnboarding() {
  const onboardingOverlay = getEl("onboardingOverlay");
  if (!onboardingOverlay) return;
  if (hasSeenOnboarding()) return;

  onboardingSteps = buildOnboardingSteps();
  onboardingIndex = 0;

  onboardingOverlay.classList.remove("is-hidden");
  onboardingOverlay.setAttribute("aria-hidden", "false");

  showOnboardingStep(onboardingIndex);
}

export { setupOnboarding, startOnboarding, hideOnboarding };
