const topics = [
  { slug: "units", title: "Units", icon: "📏", desc: "SI units, dimensions, prefixes, and measurement basics." },
  { slug: "mechanics", title: "Mechanics", icon: "⚙️", desc: "Motion, forces, energy, momentum, and circular motion." },
  { slug: "oscillations-waves", title: "Oscillations & Waves", icon: "🌊", desc: "SHM, wave motion, properties, and sound concepts." },
  { slug: "thermal-physics", title: "Thermal Physics", icon: "🔥", desc: "Temperature, gases, heat transfer, and thermal laws." },
  { slug: "gravitational-field", title: "Gravitational Field", icon: "🌍", desc: "Gravitation, field strength, potential, and motion." },
  { slug: "electrostatics-field", title: "Electrostatics Field", icon: "⚡", desc: "Charges, electric fields, potential, and capacitance basics." },
  { slug: "magnetic-field", title: "Magnetic Field", icon: "🧲", desc: "Magnetic effects, forces, fields, and electromagnetic ideas." },
  { slug: "current-electricity", title: "Current Electricity", icon: "🔋", desc: "Current, resistance, circuits, power, and electrical laws." },
  { slug: "electronics", title: "Electronics", icon: "💻", desc: "Diodes, transistors, logic, and core electronic systems." },
  { slug: "mechanical-properties", title: "Mechanical Properties", icon: "🏗️", desc: "Elasticity, stress, strain, viscosity, and material behavior." },
  { slug: "matter-radiations", title: "Matter & Radiations", icon: "☢️", desc: "Atomic structure, radiation, quantum ideas, and modern physics." }
];

const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

document.addEventListener("DOMContentLoaded", () => {
  const topicsGrid = document.getElementById("topicsGrid");

  if (!topicsGrid) {
    console.error("topicsGrid element not found.");
    return;
  }

  renderTopics(topicsGrid, topics);
});

function getProgressStore() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function getBadgeData(percentage) {
  const value = Number(percentage) || 0;

  if (value >= 90) return { label: "Gold 🥇", className: "badge-gold" };
  if (value >= 75) return { label: "Silver 🥈", className: "badge-silver" };
  if (value >= 50) return { label: "Bronze 🥉", className: "badge-bronze" };

  return null;
}

function getMasteryLevel(bestFullQuizPercentage) {
  const value = Number(bestFullQuizPercentage) || 0;

  if (value >= 90) return "Mastered";
  if (value >= 75) return "Strong";
  if (value >= 50) return "Improving";

  return "Beginner";
}

function normalizeStats(stats) {
  if (!stats || typeof stats !== "object") {
    return {
      attempts: 0,
      bestPercentage: "0.0",
      bestFullBadgePercentage: null,
      completedFullQuiz: false,
      lastPlayedAt: "Never"
    };
  }

  return {
    attempts: Number(stats.attempts) || 0,
    bestPercentage: stats.bestPercentage ?? "0.0",
    bestFullBadgePercentage:
      stats.bestFullBadgePercentage === null || stats.bestFullBadgePercentage === undefined
        ? null
        : Number(stats.bestFullBadgePercentage) || 0,
    completedFullQuiz: Boolean(stats.completedFullQuiz),
    lastPlayedAt: stats.lastPlayedAt || "Never"
  };
}

function getTopicSummary(topicSlug) {
  const store = getProgressStore();
  const entries = Object.entries(store).filter(([key]) => key.startsWith(`${topicSlug}__`));

  if (!entries.length) {
    return {
      attempts: 0,
      bestPercentage: "0.0",
      bestFullBadgePercentage: null,
      mastery: "Beginner",
      completedCount: 0,
      totalTrackedSets: 0,
      lastPlayedAt: "Never"
    };
  }

  let attempts = 0;
  let bestPercentage = 0;
  let bestFullBadgePercentage = null;
  let completedCount = 0;
  let lastPlayedAt = "Never";

  entries.forEach(([, rawStats]) => {
    const stats = normalizeStats(rawStats);

    attempts += stats.attempts;
    bestPercentage = Math.max(bestPercentage, Number(stats.bestPercentage) || 0);

    if (stats.bestFullBadgePercentage !== null) {
      bestFullBadgePercentage =
        bestFullBadgePercentage === null
          ? stats.bestFullBadgePercentage
          : Math.max(bestFullBadgePercentage, stats.bestFullBadgePercentage);
    }

    if (stats.completedFullQuiz) completedCount++;

    if (stats.lastPlayedAt && stats.lastPlayedAt !== "Never") {
      if (lastPlayedAt === "Never" || stats.lastPlayedAt > lastPlayedAt) {
        lastPlayedAt = stats.lastPlayedAt;
      }
    }
  });

  return {
    attempts,
    bestPercentage: bestPercentage.toFixed(1),
    bestFullBadgePercentage,
    mastery: getMasteryLevel(bestFullBadgePercentage),
    completedCount,
    totalTrackedSets: entries.length,
    lastPlayedAt
  };
}

function getTopicDescription(topic, summary) {
  if (summary.attempts === 0) {
    return topic.desc || "Open subtopics and begin practicing.";
  }

  if (summary.mastery === "Mastered") {
    return `Excellent work in ${topic.title.toLowerCase()}. Keep revising to stay sharp.`;
  }

  if (summary.mastery === "Strong") {
    return `You already have strong progress in ${topic.title.toLowerCase()}. Push toward mastery.`;
  }

  if (summary.mastery === "Improving") {
    return `Good progress in ${topic.title.toLowerCase()}. More practice can raise your score fast.`;
  }

  return `You started ${topic.title.toLowerCase()}. Keep building confidence step by step.`;
}

function renderTopics(container, topicList) {
  if (!Array.isArray(topicList) || topicList.length === 0) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <h3>No topics found</h3>
        <p>Please add topics and try again.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  topicList.forEach((topic, index) => {
    const href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic.slug)}`;
    const card = document.createElement("a");
    const summary = getTopicSummary(topic.slug);
    const badge =
      summary.bestFullBadgePercentage !== null
        ? getBadgeData(summary.bestFullBadgePercentage)
        : null;

    const actionText = summary.attempts > 0 ? "Continue Topic" : "Open Topic";
    const description = getTopicDescription(topic, summary);

    card.className = "topic-card fade-slide-up";
    card.href = href;
    card.setAttribute("aria-label", `Open ${topic.title}`);
    card.setAttribute("data-href", href);
    card.style.animationDelay = `${index * 0.04}s`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">PP Quiz Topic</div>
          <h2 class="topic-title">${escapeHtml(topic.title)}</h2>
          <p class="topic-desc">${escapeHtml(description)}</p>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(topic.icon || "📘")}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${summary.attempts}</span>
        <span class="stat-pill">Mastery: ${escapeHtml(summary.mastery)}</span>
        <span class="stat-pill">Best: ${summary.bestPercentage}%</span>
        ${badge ? `<span class="stat-pill ${badge.className}">${badge.label}</span>` : ""}
      </div>

      <div class="topic-stats subtopic-meta-stats">
        <span class="stat-pill">Completed Sets: ${summary.completedCount}</span>
        <span class="stat-pill">Tracked Sets: ${summary.totalTrackedSets}</span>
        <span class="stat-pill">Last: ${escapeHtml(summary.lastPlayedAt)}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">${actionText}</span>
    `;

    attachSmoothCardTouch(card);
    container.appendChild(card);
  });
}

function attachSmoothCardTouch(card) {
  let startX = 0;
  let startY = 0;
  let moved = false;
  let touching = false;

  const MOVE_LIMIT = 10;

  card.addEventListener("touchstart", (event) => {
    if (!event.touches || event.touches.length !== 1) return;

    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    moved = false;
    touching = true;

    card.classList.add("card-touch-active");
  }, { passive: true });

  card.addEventListener("touchmove", (event) => {
    if (!touching || !event.touches || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);

    if (dx > MOVE_LIMIT || dy > MOVE_LIMIT) {
      moved = true;
      card.classList.remove("card-touch-active");
    }
  }, { passive: true });

  card.addEventListener("touchend", () => {
    touching = false;
    setTimeout(() => {
      card.classList.remove("card-touch-active");
    }, 80);
  }, { passive: true });

  card.addEventListener("touchcancel", () => {
    touching = false;
    moved = true;
    card.classList.remove("card-touch-active");
  }, { passive: true });

  card.addEventListener("click", (event) => {
    if (moved) {
      event.preventDefault();
      moved = false;
      return;
    }
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      card.classList.add("card-touch-active");
      setTimeout(() => {
        card.classList.remove("card-touch-active");
      }, 120);
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}
