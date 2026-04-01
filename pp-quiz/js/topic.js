document.addEventListener("DOMContentLoaded", () => {
  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  const params = new URLSearchParams(window.location.search);
  const topicSlug = params.get("topic");

  const topicTitle = document.getElementById("topicTitle");
  const topicSubtitle = document.getElementById("topicSubtitle");
  const topicHeroTitle = document.getElementById("topicHeroTitle");
  const topicHeroText = document.getElementById("topicHeroText");
  const subtopicsGrid = document.getElementById("subtopicsGrid");

  const emptyState = document.getElementById("topicEmptyState");
  const errorState = document.getElementById("topicErrorState");
  const errorText = document.getElementById("topicErrorText");
  const retryBtn = document.getElementById("retryTopicBtn");

  // =========================
  // UI STATE CONTROL
  // =========================
  function showGrid() {
    subtopicsGrid.style.display = "";
    emptyState.style.display = "none";
    errorState.style.display = "none";
  }

  function showEmpty(message) {
    subtopicsGrid.style.display = "none";
    emptyState.style.display = "block";
    errorState.style.display = "none";

    const p = emptyState.querySelector("p");
    if (p) p.textContent = message || "No subtopics found.";
  }

  function showError(message) {
    subtopicsGrid.style.display = "none";
    emptyState.style.display = "none";
    errorState.style.display = "block";

    if (errorText) {
      errorText.textContent =
        message || "Something went wrong while loading this topic.";
    }
  }

  // =========================
  // DATA
  // =========================
  const topicData = {
    "units": {
      title: "Units",
      subtopics: [
        { slug: "unit-dimensions", title: "Unit Dimensions", icon: "📏" }
      ]
    },

    "mechanics": {
      title: "Mechanics",
      subtopics: [
        { slug: "linear-motion", title: "Linear Motion", icon: "🏃" },
        { slug: "equilibrium-of-force", title: "Equilibrium of Force", icon: "⚖️" },
        { slug: "center-of-gravity", title: "Center of Gravity", icon: "📍" },
        { slug: "newtons-laws", title: "Newton's Laws", icon: "🍎" },
        { slug: "momentum", title: "Momentum", icon: "💥" },
        { slug: "friction", title: "Friction", icon: "🧱" },
        { slug: "work-power-energy", title: "Work, Power and Energy", icon: "⚡" },
        { slug: "rotational-motion", title: "Rotational Motion", icon: "🔄" },
        { slug: "circular-motion", title: "Circular Motion", icon: "⭕" },
        { slug: "hydrostatics", title: "Hydrostatics", icon: "💧" },
        { slug: "hydrodynamics", title: "Hydrodynamics", icon: "🌊" }
      ]
    }

    // (keep your rest unchanged — truncated here for clarity)
  };

  // =========================
  // HELPERS
  // =========================
  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function getSavedStats(topic, subtopic) {
    const store = getProgressStore();
    const id = `${topic}__${subtopic}__set-1`;

    return store[id] || null;
  }

  function getMasteryLevel(p) {
    const v = Number(p) || 0;
    if (v >= 90) return "Mastered";
    if (v >= 75) return "Strong";
    if (v >= 50) return "Improving";
    return "Beginner";
  }

  function getBadge(p) {
    const v = Number(p) || 0;
    if (v >= 90) return "🥇";
    if (v >= 75) return "🥈";
    if (v >= 50) return "🥉";
    return "";
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c]));
  }

  // =========================
  // CARD
  // =========================
  function createCard(topicSlug, subtopic, i) {
    const stats = getSavedStats(topicSlug, subtopic.slug);

    const attempts = stats?.attempts || 0;
    const progress = stats?.bestFullBadgePercentage || 0;
    const mastery = getMasteryLevel(progress);
    const badge = getBadge(progress);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.style.animationDelay = `${i * 0.04}s`;

    card.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${topicSlug}&subtopic=${subtopic.slug}`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Subtopic</div>
          <h2 class="topic-title">${escapeHtml(subtopic.title)}</h2>
          <p class="topic-desc">Practice and improve your accuracy.</p>
        </div>
        <div class="topic-icon">${subtopic.icon || "📘"}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${attempts}</span>
        <span class="stat-pill">${mastery}</span>
        ${badge ? `<span class="stat-pill">${badge}</span>` : ""}
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>

      <span class="action-btn primary-btn">Open</span>
    `;

    return card;
  }

  // =========================
  // MAIN RENDER
  // =========================
  function render() {
    if (!topicSlug || !topicData[topicSlug]) {
      topicTitle.textContent = "Topic Not Found";
      showError("Invalid topic selected.");
      return;
    }

    const topic = topicData[topicSlug];

    topicTitle.textContent = topic.title;
    if (topicSubtitle) topicSubtitle.textContent = "Select a subtopic to begin practice.";
    if (topicHeroTitle) topicHeroTitle.textContent = topic.title;
    if (topicHeroText) {
      topicHeroText.textContent =
        `Choose a subtopic under ${topic.title} and continue your focused MCQ practice.`;
    }

    if (!topic.subtopics || topic.subtopics.length === 0) {
      showEmpty("No subtopics available yet.");
      return;
    }

    subtopicsGrid.innerHTML = "";

    topic.subtopics.forEach((s, i) => {
      subtopicsGrid.appendChild(createCard(topicSlug, s, i));
    });

    showGrid();
  }

  // =========================
  // EVENTS
  // =========================
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  render();
});
