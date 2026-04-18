const SUBJECTS = {
  physics: {
    pageTitle: "11 Main Topics",
    heroPill: "DinuuNOVA Physics • Past Paper Practice",
    heroTitle: "Start MCQ Practice",
    heroDesc:
     "Choose a topic and begin focused practice.",
    topics: [
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
    ]
  },

  chemistry: {
    pageTitle: "14 Main Topics",
    heroPill: "DinuuNOVA Chemistry • Past Paper Practice",
    heroTitle: "Train Like a Real Exam App",
    heroDesc:
      "Choose a topic and start practicing instantly. Focus on accuracy, speed, and consistency.",
    topics: [
      { slug: "atomic-structure", title: "Atomic Structure", icon: "⚛️" },
      { slug: "structure-and-bonding", title: "Structure and Bonding", icon: "🔗" },
      { slug: "chemical-calculation", title: "Chemical Calculation", icon: "🧮" },
      { slug: "gaseous-state-of-matter", title: "Gaseous State of Matter", icon: "💨" },
      { slug: "energetic", title: "Energetic", icon: "🔥" },
      { slug: "chemistry-of-s-p-and-d-block-elements", title: "Chemistry of s, p and d Block Elements", icon: "🧪" },
      { slug: "basic-concepts-of-organic-chemistry", title: "Basic Concepts of Organic Chemistry", icon: "🌿" },
      { slug: "hydrocarbons-and-halohydrocarbons", title: "Hydrocarbons and Halohydrocarbons", icon: "⛽" },
      { slug: "oxygen-containg-organic-compunds", title: "Oxygen Containg Organic Compunds", icon: "🫧" },
      { slug: "nitrogen-containing-organic-compounds", title: "Nitrogen Containing Organic Compounds", icon: "🧫" },
      { slug: "chemical-kinetics", title: "Chemical Kinetics", icon: "⏱️" },
      { slug: "equilibrium", title: "Equilibrium", icon: "⚖️" },
      { slug: "electro-chemistry", title: "Electro Chemistry", icon: "🔋" },
      { slug: "industrial-chemistry-and-environmental-pollution", title: "Industrial Chemistry and Environmental Pollution", icon: "🏭" }
    ]
  }
};

const refreshQuizHomeBtn = document.getElementById("refreshQuizHomeBtn");

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.dnThemeApplyToCurrentPage === "function") {
    window.dnThemeApplyToCurrentPage();
  }

  const topicsGrid = document.getElementById("topicsGrid");

  if (!topicsGrid) {
    console.error("Topics grid not found");
    return;
  }

  const subject = getSubjectFromUrl();
  const config = SUBJECTS[subject] || SUBJECTS.physics;

  applySubjectPageContent(config);
  setupRefreshButton();
  renderTopics(topicsGrid, config.topics, subject);
});

function getSubjectFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const subject = (params.get("subject") || "physics").toLowerCase().trim();
  return SUBJECTS[subject] ? subject : "physics";
}

function applySubjectPageContent(config) {
  const pageTitleEl = document.querySelector(".quiz-header h1");
  const heroPillEl = document.querySelector(".topic-card .topic-pill");
  const heroTitleEl = document.querySelector(".topic-card .topic-title");
  const heroDescEl = document.querySelector(".topic-card .topic-desc");
  const sectionTitleEl = document.querySelector('section.fade-slide-up h3');
  const sectionDescEl = document.querySelector('section.fade-slide-up p');

  if (pageTitleEl) pageTitleEl.textContent = config.pageTitle;
  if (heroPillEl) heroPillEl.textContent = config.heroPill;
  if (heroTitleEl) heroTitleEl.textContent = config.heroTitle;
  if (heroDescEl) heroDescEl.textContent = config.heroDesc;
  if (sectionTitleEl) sectionTitleEl.textContent = "Choose a Topic";
  if (sectionDescEl) sectionDescEl.textContent = "Tap a topic to begin.";

  document.title = `PP Quiz | ${extractBrandName(config.heroPill)}`;
}

function extractBrandName(heroPillText) {
  if (!heroPillText) return "DinuuNOVA";
  const firstPart = heroPillText.split("•")[0]?.trim();
  return firstPart || "DinuuNOVA";
}

function setupRefreshButton() {
  if (!refreshQuizHomeBtn) return;

  refreshQuizHomeBtn.addEventListener("click", () => {
    document.body.classList.add("page-is-refreshing");
    setTimeout(() => {
      window.location.reload();
    }, 120);
  });
}

function canAccessSubjectTopic(index) {
  if (typeof hasPaidAccess === "function" && hasPaidAccess()) {
    return true;
  }

  return index === 0;
}

function renderTopics(container, topicList, subject) {
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
    const isAllowed = canAccessSubjectTopic(index);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = isAllowed
      ? `/pp-quiz/topic.html?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic.slug)}`
      : "#";

    if (!isAllowed) {
      card.classList.add("is-locked");
    }

    card.setAttribute(
      "aria-label",
      isAllowed
        ? `${topic.title} topic`
        : `${topic.title} topic locked`
    );

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">${subject === "chemistry" ? "Chemistry Topic" : "Physics Topic"}</div>
          <h3 class="topic-title">${escapeHtml(topic.title)}</h3>
          <p class="topic-desc">
            Tap to open ${escapeHtml(topic.title)} practice questions.
          </p>
        </div>
        <div class="topic-icon" aria-hidden="true">${topic.icon || "📘"}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">${isAllowed ? "Available" : "Premium"}</span>
        <span class="stat-pill">Topic Practice</span>
      </div>

      <button class="action-btn enter-topic-btn" type="button" ${isAllowed ? "" : "disabled"}>
        ${isAllowed ? "Open Topic" : "Locked"}
      </button>
    `;

    if (!isAllowed) {
      card.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }

    container.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
