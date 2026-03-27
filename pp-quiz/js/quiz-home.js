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

  container.innerHTML = "";

  topicList.forEach((topic, index) => {
    const href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic.slug)}`;
    const card = document.createElement("a");

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
          <p class="topic-desc">${escapeHtml(topic.desc || "Open subtopics and begin practicing.")}</p>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(topic.icon || "📘")}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Subtopics</span>
        <span class="stat-pill">MCQ Sets</span>
        <span class="stat-pill">Progress Ready</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">Open Topic</span>
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
