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
    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic.slug)}`;
    card.setAttribute("aria-label", `Open ${topic.title}`);

    card.style.animationDelay = `${index * 0.04}s`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <h2 class="topic-title">${escapeHtml(topic.title)}</h2>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(topic.icon || "📘")}</div>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">Open Topic</span>
    `;

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
