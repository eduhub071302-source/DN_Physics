const topics = [
  { slug: "units", title: "Units", icon: "📏" },
  { slug: "mechanics", title: "Mechanics", icon: "⚙️" },
  { slug: "oscillations-waves", title: "Oscillations & Waves", icon: "🌊" },
  { slug: "thermal-physics", title: "Thermal Physics", icon: "🔥" },
  { slug: "gravitational-field", title: "Gravitational Field", icon: "🌍" },
  { slug: "electrostatics-field", title: "Electrostatics Field", icon: "⚡" },
  { slug: "magnetic-field", title: "Magnetic Field", icon: "🧲" },
  { slug: "current-electricity", title: "Current Electricity", icon: "🔋" },
  { slug: "electronics", title: "Electronics", icon: "💻" },
  { slug: "mechanical-properties", title: "Mechanical Properties", icon: "🏗️" },
  { slug: "matter-radiations", title: "Matter & Radiations", icon: "☢️" }
];

const refreshQuizHomeBtn = document.getElementById("refreshQuizHomeBtn");

document.addEventListener("DOMContentLoaded", () => {
  const topicsGrid = document.getElementById("topicsGrid");

  if (!topicsGrid) {
    console.error("topicsGrid element not found.");
    return;
  }

  renderTopics(topicsGrid, topics);
});

function renderTopics(container, topicList) {
  if (!Array.isArray(topicList) || topicList.length === 0) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <h3>No topics found</h3>
        <p>Please add topics to quiz-home.js and try again.</p>
      </div>
    `;
    return;
  }

  if (refreshQuizHomeBtn) {
    refreshQuizHomeBtn.addEventListener("click", () => {
      document.body.classList.add("page-is-refreshing");
      setTimeout(() => {
        window.location.reload();
      }, 120);
    });
  }

  container.innerHTML = "";

  topicList.forEach((topic, index) => {
    const isAllowed = canAccessQuiz(topic.slug);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = isAllowed
      ? `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic.slug)}`
      : "#";

    if (!isAllowed) {
      card.classList.add("is-locked");
    }

    card.setAttribute(
      "aria-label",
      isAllowed ? `Open ${topic.title}` : `${topic.title} is locked`
    );

    card.style.animationDelay = `${index * 0.04}s`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">${isAllowed ? "Free" : "Premium"}</div>
          <h2 class="topic-title">${escapeHtml(topic.title)}</h2>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(topic.icon || "📘")}</div>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">
        ${isAllowed ? "Open Topic" : "🔒 Locked"}
      </span>
    `;

    if (!isAllowed) {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        lockAlert();
      });
    }

    container.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}
