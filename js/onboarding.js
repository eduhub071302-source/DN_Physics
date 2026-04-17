let onboardingSteps = [];
let onboardingIndex = 0;

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

function resetOnboarding() {
  localStorage.removeItem("dnPhysicsOnboardingSeen");
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

  if (progressText) {
    progressText.textContent = `${current} / ${total}`;
  }

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
}

function positionOnboarding(targetEl) {
  const onboardingSpotlight = getEl("onboardingSpotlight");
  const onboardingCard = getEl("onboardingCard");
  const onboardingArrow = getEl("onboardingArrow");

  if (!targetEl || !onboardingSpotlight || !onboardingCard || !onboardingArrow) {
    return;
  }

  const rect = targetEl.getBoundingClientRect();
  const padding = 12;

  onboardingSpotlight.style.top = `${rect.top - padding + window.scrollY}px`;
  onboardingSpotlight.style.left = `${rect.left - padding + window.scrollX}px`;
  onboardingSpotlight.style.width = `${rect.width + padding * 2}px`;
  onboardingSpotlight.style.height = `${rect.height + padding * 2}px`;

  const cardWidth = Math.min(window.innerWidth - 24, 360);
  const cardHeight = 220;

  let cardLeft = rect.left + window.scrollX;
  let cardTop = rect.bottom + window.scrollY + 18;
  let arrowLeft = rect.left + window.scrollX - 18;
  let arrowTop = rect.top + window.scrollY + rect.height / 2 - 12;

  if (cardLeft + cardWidth > window.scrollX + window.innerWidth - 12) {
    cardLeft = window.scrollX + window.innerWidth - cardWidth - 12;
  }

  if (cardLeft < window.scrollX + 12) {
    cardLeft = window.scrollX + 12;
  }

  if (cardTop + cardHeight > window.scrollY + window.innerHeight - 12) {
    cardTop = rect.top + window.scrollY - cardHeight - 22;
  }

  if (cardTop < window.scrollY + 12) {
    cardTop = window.scrollY + 12;
  }

  if (window.innerWidth <= 768) {
    cardLeft = window.scrollX + 12;
    cardTop = window.scrollY + window.innerHeight - Math.min(260, window.innerHeight * 0.38);
    arrowLeft = rect.left + window.scrollX + rect.width / 2 - 10;
    arrowTop = rect.bottom + window.scrollY + 8;
  }

  onboardingCard.style.top = `${cardTop}px`;
  onboardingCard.style.left = `${cardLeft}px`;

  onboardingArrow.style.top = `${arrowTop}px`;
  onboardingArrow.style.left = `${Math.max(window.scrollX + 12, arrowLeft)}px`;
}

function showOnboardingStep(index) {
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

  targetEl.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  if (onboardingBadge) onboardingBadge.textContent = step.badge || "Mission";
  if (onboardingTitle) onboardingTitle.textContent = step.title;
  if (onboardingText) onboardingText.textContent = step.text;
  if (onboardingAction) onboardingAction.textContent = step.action || "Continue";

  if (onboardingNextBtn) {
    onboardingNextBtn.textContent =
      index === onboardingSteps.length - 1 ? "Finish Mission" : "Next Mission";
  }

  updateProgress();

  setTimeout(() => {
    positionOnboarding(targetEl);
  }, 280);
}

function startOnboarding() {
  const onboardingOverlay = getEl("onboardingOverlay");
  if (!onboardingOverlay) return;
  if (hasSeenOnboarding()) return;

  onboardingSteps = buildOnboardingSteps();
  onboardingIndex = 0;

  onboardingOverlay.classList.remove("is-hidden");
  onboardingOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  showOnboardingStep(onboardingIndex);
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
    if (onboardingOverlay && !onboardingOverlay.classList.contains("is-hidden")) {
      showOnboardingStep(onboardingIndex);
    }
  });
}

export { setupOnboarding, startOnboarding, hideOnboarding, resetOnboarding };
