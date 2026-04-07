const SUBJECTS = {
  physics: {
    pageTitle: "11 Main Topics",
    heroPill: "DinuuNOVA Physics • Past Paper Practice",
    heroTitle: "Train Like a Real Exam App",
    heroDesc:
      "Choose a topic and start practicing instantly. Focus on accuracy, speed, and consistency.",
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
  },

  maths: {
    pageTitle: "30 Main Topics",
    heroPill: "DinuuNOVA Maths • Past Paper Practice",
    heroTitle: "Train Like a Real Exam App",
    heroDesc:
      "Choose a topic and start practicing instantly. Focus on accuracy, speed, and consistency.",
    topics: [
      { slug: "trignometry", title: "Trignometry", icon: "📐" },
      { slug: "remainder-theorm-and-factors", title: "Remainder Theorm and Factors", icon: "➗" },
      { slug: "limit-and-differentiation", title: "Limit and Differentiation", icon: "📉" },
      { slug: "vectors", title: "Vectors", icon: "↗️" },
      { slug: "equilibrium-of-factors", title: "Equilibrium of Factors", icon: "⚖️" },
      { slug: "inequalitis-and-modules-funtion", title: "Inequalitis and Modules Funtion", icon: "≠" },
      { slug: "quadratic-equation", title: "Quadratic Equation", icon: "✖️" },
      { slug: "sysytem-of-forces", title: "Sysytem of Forces", icon: "🧲" },
      { slug: "motion-of-straigt-line-and-velocity-time-curce", title: "Motion of Straigt Line and Velocity Time Curce", icon: "🏃" },
      { slug: "relatice-velocity", title: "Relatice Velocity", icon: "🚀" },
      { slug: "mathematical-induction", title: "Mathematical Induction", icon: "🧠" },
      { slug: "projectiles", title: "Projectiles", icon: "🎯" },
      { slug: "relatice-acceleration", title: "Relatice Acceleration", icon: "⚡" },
      { slug: "frction", title: "Frction", icon: "🪵" },
      { slug: "frame-work", title: "Frame Work", icon: "🏗️" },
      { slug: "straight-line", title: "Straight Line", icon: "📏" },
      { slug: "circle", title: "Circle", icon: "⭕" },
      { slug: "work-enegry-power", title: "Work, Enegry, Power", icon: "🔋" },
      { slug: "impulse-and-impact", title: "Impulse and Impact", icon: "💥" },
      { slug: "circular-motion", title: "Circular Motion", icon: "🌀" },
      { slug: "probability", title: "Probability", icon: "🎲" },
      { slug: "binomial-theorem", title: "Binomial Theorem", icon: "📘" },
      { slug: "complex-numbers", title: "Complex Numbers", icon: "🔢" },
      { slug: "simple-harmonic-motion", title: "Simple Harmonic Motion", icon: "🌊" },
      { slug: "statistic", title: "Statistic", icon: "📊" },
      { slug: "differenntitation-and-graphs", title: "Differenntitation and Graphs", icon: "📈" },
      { slug: "intergration", title: "Intergration", icon: "∫" },
      { slug: "premutation-and-combination", title: "Premutation and Combination", icon: "🔀" },
      { slug: "series", title: "Series", icon: "🔁" },
      { slug: "center-of-gravity", title: "Center of Gravity", icon: "⚪" }
    ]
  }
};

const refreshQuizHomeBtn = document.getElementById("refreshQuizHomeBtn");

document.addEventListener("DOMContentLoaded", () => {
  const topicsGrid = document.getElementById("topicsGrid");

  if (!topicsGrid) {
    console.error("topicsGrid element not found.");
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
  if (sectionTitleEl) sectionTitleEl.textContent = "Select a Topic";
  if (sectionDescEl) sectionDescEl.textContent = "Tap a topic to begin your practice.";

  document.title = `PP Quiz | ${extractBrandName(config.heroPill)}`;
}

function extractBrandName(heroPillText) {
  if (!heroPillText) return "DN Physics";
  const firstPart = heroPillText.split("•")[0]?.trim();
  return firstPart || "DN Physics";
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
      ? `/DN_Physics/pp-quiz/topic.html?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic.slug)}`
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
        if (typeof lockAlert === "function") {
          lockAlert();
        }
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
