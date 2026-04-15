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
      target: "#onboardNotes",
      title: "Explore Notes",
      text: "Open notes and start revising.",
    },
    {
      target: "#onboardPractice",
      title: "Practice MCQs",
      text: "Jump into past paper practice from here.",
    },
    {
      target: "#musicToggleBtn",
      title: "Focus Mode",
      text: "Play study music while learning.",
    },
    {
      target: "#refreshBtn",
      title: "Refresh the App",
      text: mobile
        ? "Swipe down to refresh."
        : "Use this to refresh the app.",
    },
  ];

  if (installBtn && !installBtn.classList.contains("is-hidden")) {
    steps.push({
      target: "#installBtn",
      title: "Install App",
      text: "Install for faster access.",
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

function positionOnboarding(targetEl) {
  const onboardingSpotlight = getEl("onboardingSpotlight");
  const onboardingCard = getEl("onboardingCard");
  const onboardingArrow = getEl("onboardingArrow");

  if (!targetEl || !onboardingSpotlight || !onboardingCard || !onboardingArrow) {
    return;
  }

  const rect = targetEl.getBoundingClientRect();
  const padding = 10;

  onboardingSpotlight.style.top = `${rect.top - padding + window.scrollY}px`;
  onboardingSpotlight.style.left = `${rect.left - padding + window.scrollX}px`;
  onboardingSpotlight.style.width = `${rect.width + padding * 2}px`;
  onboardingSpotlight.style.height = `${rect.height + padding * 2}px`;

  const cardWidth = Math.min(window.innerWidth - 24, 320);
  const cardHeight = 150;

  let cardLeft = rect.left + window.scrollX;
  let cardTop = rect.bottom + window.scrollY + 16;

  if (cardLeft + cardWidth > window.scrollX + window.innerWidth - 12) {
    cardLeft = window.scrollX + window.innerWidth - cardWidth - 12;
  }

  if (cardLeft < window.scrollX + 12) {
    cardLeft = window.scrollX + 12;
  }

  if (cardTop + cardHeight > window.scrollY + window.innerHeight - 12) {
    cardTop = rect.top + window.scrollY - cardHeight - 20;
  }

  if (cardTop < window.scrollY + 12) {
    cardTop = window.scrollY + 12;
  }

  onboardingCard.style.top = `${cardTop}px`;
  onboardingCard.style.left = `${cardLeft}px`;

  onboardingArrow.style.top = `${rect.top + window.scrollY + rect.height / 2 - 10}px`;
  onboardingArrow.style.left = `${Math.max(window.scrollX + 12, rect.left + window.scrollX - 28)}px`;
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

  if (onboardingTitle) onboardingTitle.textContent = step.title;
  if (onboardingText) onboardingText.textContent = step.text;
  if (onboardingNextBtn) {
    onboardingNextBtn.textContent =
      index === onboardingSteps.length - 1 ? "Done" : "Next";
  }

  setTimeout(() => {
    positionOnboarding(targetEl);
  }, 260);
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

export { setupOnboarding, startOnboarding, hideOnboarding };
