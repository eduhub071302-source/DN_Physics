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
  document.body.style.overflow = "";
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

async function scrollTargetIntoBestView(targetEl) {
  if (!targetEl) return;

  const headerOffset = getHeaderOffset();
  const rect = targetEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const mobile = isMobileDevice();

  const currentScroll = window.scrollY;
  const targetTopOnPage = rect.top + currentScroll;

  const safeTop = mobile
    ? headerOffset + 18
    : headerOffset + 30;

  const safeBottomReserved = mobile ? 280 : 230;

  const desiredTop = clamp(
    targetTopOnPage - safeTop,
    0,
    Math.max(0, document.documentElement.scrollHeight - viewportHeight),
  );

  const targetBottomInViewportAfterScroll =
    rect.bottom - (desiredTop - currentScroll);

  const targetWillBeHiddenByBottomSheet =
    targetBottomInViewportAfterScroll > viewportHeight - safeBottomReserved;

  let finalScroll = desiredTop;

  if (targetWillBeHiddenByBottomSheet) {
    const extra =
      targetBottomInViewportAfterScroll - (viewportHeight - safeBottomReserved);
    finalScroll = clamp(
      desiredTop + extra + 18,
      0,
      Math.max(0, document.documentElement.scrollHeight - viewportHeight),
    );
  }

  window.scrollTo({
    top: finalScroll,
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
  const padding = mobile ? 10 : 12;
  const viewportPadding = 12;
  const headerOffset = getHeaderOffset();

  const rect = targetEl.getBoundingClientRect();
  const pageTop = rect.top + window.scrollY;
  const pageLeft = rect.left + window.scrollX;

  onboardingSpotlight.style.top = `${pageTop - padding}px`;
  onboardingSpotlight.style.left = `${pageLeft - padding}px`;
  onboardingSpotlight.style.width = `${rect.width + padding * 2}px`;
  onboardingSpotlight.style.height = `${rect.height + padding * 2}px`;

  onboardingCard.style.visibility = "hidden";
  onboardingCard.style.left = "12px";
  onboardingCard.style.top = "12px";

  const measured = onboardingCard.getBoundingClientRect();
  const cardWidth = measured.width || Math.min(window.innerWidth - 24, 360);
  const cardHeight = measured.height || 220;

  const viewportLeft = window.scrollX + viewportPadding;
  const viewportRight = window.scrollX + window.innerWidth - viewportPadding;
  const viewportTop = window.scrollY + headerOffset + 8;
  const viewportBottom = window.scrollY + window.innerHeight - viewportPadding;

  let cardLeft;
  let cardTop;

  if (mobile) {
    cardLeft = viewportLeft;
    cardTop = viewportBottom - cardHeight;

    onboardingArrow.style.display = "none";
  } else {
    onboardingArrow.style.display = "block";

    const spaceBelow = viewportBottom - (pageTop + rect.height);
    const spaceAbove = pageTop - viewportTop;
    const placeBelow = spaceBelow >= cardHeight + 20 || spaceBelow >= spaceAbove;

    cardLeft = clamp(
      pageLeft,
      viewportLeft,
      viewportRight - cardWidth,
    );

    if (placeBelow) {
      cardTop = clamp(
        pageTop + rect.height + 18,
        viewportTop,
        viewportBottom - cardHeight,
      );

      onboardingArrow.style.left = `${clamp(
        pageLeft + 4,
        viewportLeft + 4,
        viewportRight - 30,
      )}px`;
      onboardingArrow.style.top = `${clamp(
        pageTop + rect.height / 2 - 10,
        viewportTop + 8,
        viewportBottom - 28,
      )}px`;
      onboardingArrow.style.transform = "rotate(0deg)";
    } else {
      cardTop = clamp(
        pageTop - cardHeight - 18,
        viewportTop,
        viewportBottom - cardHeight,
      );

      onboardingArrow.style.left = `${clamp(
        pageLeft + 4,
        viewportLeft + 4,
        viewportRight - 30,
      )}px`;
      onboardingArrow.style.top = `${clamp(
        pageTop + rect.height / 2 - 10,
        viewportTop + 8,
        viewportBottom - 28,
      )}px`;
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

  await scrollTargetIntoBestView(targetEl);
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

  window.addEventListener("resize", () => {
    if (!onboardingOverlay || onboardingOverlay.classList.contains("is-hidden")) return;

    clearTimeout(onboardingRepositionTimer);
    onboardingRepositionTimer = setTimeout(() => {
      showOnboardingStep(onboardingIndex);
    }, 120);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!onboardingOverlay || onboardingOverlay.classList.contains("is-hidden")) return;

      clearTimeout(onboardingRepositionTimer);
      onboardingRepositionTimer = setTimeout(() => {
        const step = onboardingSteps[onboardingIndex];
        const targetEl = step ? document.querySelector(step.target) : null;
        if (targetEl) positionOnboarding(targetEl);
      }, 20);
    },
    { passive: true },
  );
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
