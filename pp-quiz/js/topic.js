document.addEventListener("DOMContentLoaded", () => {
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
    },

    "oscillations-waves": {
      title: "Oscillations & Waves",
      subtopics: [
        { slug: "simple-harmonic-motion", title: "Simple Harmonic Motion", icon: "📈" },
        { slug: "wave-properties", title: "Wave Properties", icon: "🌊" },
        { slug: "transverse-waves", title: "Transverse Waves", icon: "〰️" },
        { slug: "velocity-of-sound", title: "Velocity of Sound", icon: "🔊" },
        { slug: "longitudinal-waves", title: "Longitudinal Waves", icon: "↔️" },
        { slug: "doppler-effect", title: "Doppler Effect", icon: "🚗" },
        { slug: "intensity-of-sound", title: "Intensity of Sound", icon: "🎵" },
        { slug: "electromagnetic-waves", title: "Electromagnetic Waves", icon: "📡" },
        { slug: "refraction", title: "Refraction", icon: "🔍" },
        { slug: "prisms", title: "Prisms", icon: "🔺" },
        { slug: "lenses", title: "Lenses", icon: "👓" },
        { slug: "defects-of-vision", title: "Defects of Vision", icon: "👁️" },
        { slug: "optical-instruments", title: "Optical Instruments", icon: "🔬" }
      ]
    },

    "thermal-physics": {
      title: "Thermal Physics",
      subtopics: [
        { slug: "thermometry", title: "Thermometry", icon: "🌡️" },
        { slug: "expansion-solids", title: "Expansion of Solids", icon: "🧱" },
        { slug: "expansion-liquids", title: "Expansion of Liquids", icon: "🫗" },
        { slug: "expansion-gases", title: "Expansion of Gases", icon: "💨" },
        { slug: "calorimetry", title: "Calorimetry", icon: "🔥" },
        { slug: "thermodynamics", title: "Thermodynamics", icon: "⚙️" },
        { slug: "hygrometry", title: "Hygrometry", icon: "💧" },
        { slug: "conduction", title: "Conduction", icon: "🔩" },
        { slug: "convection", title: "Convection", icon: "♨️" }
      ]
    },

    "gravitational-field": {
      title: "Gravitational Field",
      subtopics: [
        { slug: "gravitational-fields", title: "Gravitational Force Fields", icon: "🌍" }
      ]
    },

    "electrostatics-field": {
      title: "Electrostatics Field",
      subtopics: [
        { slug: "coulombs-law", title: "Coulomb's Law", icon: "⚡" },
        { slug: "electric-field-intensity", title: "Electric Field Intensity", icon: "🧲" },
        { slug: "gauss-law", title: "Gauss Law", icon: "⭕" },
        { slug: "electric-potential", title: "Electrostatic Potential", icon: "🔋" },
        { slug: "capacitance", title: "Capacitance and Capacitors", icon: "🔌" }
      ]
    },

    "magnetic-field": {
      title: "Magnetic Field",
      subtopics: [
        { slug: "magnetic-fields", title: "Magnetic Fields", icon: "🧲" },
        { slug: "magnetic-effect-of-current", title: "Magnetic Effect of Electric Currents", icon: "🔄" },
        { slug: "force-on-moving-charge", title: "Force on a Moving Charge in a Magnetic Field", icon: "⚛️" }
      ]
    },

    "current-electricity": {
      title: "Current Electricity",
      subtopics: [
        { slug: "ohms-law", title: "Ohm's Law", icon: "🔌" },
        { slug: "resistors-combination", title: "Combinations of Resistances", icon: "🧷" },
        { slug: "heating-effect", title: "Heating Effect of Electric Current", icon: "🔥" },
        { slug: "kirchhoffs-law", title: "Kirchhoff's Law", icon: "📐" },
        { slug: "cells-combination", title: "Combinations of Cells", icon: "🔋" },
        { slug: "wheatstone-bridge", title: "Wheatstone Bridge", icon: "🌉" },
        { slug: "meter-bridge", title: "Meter Bridge", icon: "📏" },
        { slug: "moving-coil-meters", title: "Moving Coil Meters", icon: "🎛️" },
        { slug: "potentiometer", title: "Potentiometer", icon: "🎚️" },
        { slug: "electromagnetic-induction", title: "Electromagnetic Induction", icon: "🌀" },
        { slug: "mutual-induction", title: "Mutual Induction", icon: "🔁" }
      ]
    },

    "electronics": {
      title: "Electronics",
      subtopics: [
        { slug: "semiconductors", title: "Semiconductors", icon: "💻" },
        { slug: "diodes", title: "Diodes", icon: "🔺" },
        { slug: "transistors", title: "Transistors", icon: "📟" },
        { slug: "integrated-circuits", title: "Integrated Circuits", icon: "🧠" },
        { slug: "logic-gates", title: "Logic Gates", icon: "🚪" }
      ]
    },

    "mechanical-properties": {
      title: "Mechanical Properties",
      subtopics: [
        { slug: "elasticity", title: "Elasticity", icon: "🪢" },
        { slug: "surface-tension", title: "Surface Tension", icon: "💧" },
        { slug: "viscosity", title: "Viscosity", icon: "🫙" }
      ]
    },

    "matter-radiations": {
      title: "Matter & Radiations",
      subtopics: [
        { slug: "radiation", title: "Radiation", icon: "☢️" },
        { slug: "photoelectric-effect", title: "Photoelectric Effect", icon: "💡" },
        { slug: "wave-particle-duality", title: "Particles and Waves", icon: "🌌" },
        { slug: "radioactivity", title: "Radioactivity", icon: "🧪" },
        { slug: "nuclear-physics", title: "Partial Physics", icon: "⚛️" }
      ]
    }
  };

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  const params = new URLSearchParams(window.location.search);
  const topicSlug = params.get("topic");

  const topicTitle = document.getElementById("topicTitle");
  const topicHeroTitle = document.getElementById("topicHeroTitle");
  const topicHeroText = document.getElementById("topicHeroText");
  const subtopicsGrid = document.getElementById("subtopicsGrid");

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

  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function getLegacySavedStats(topic, subtopic, setName = "set-1") {
    const key = `dn_physics_pp-quiz_${topic}_${subtopic}_${setName}`;

    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  }

  function getQuizProgressId(topic, subtopic, setName = "set-1") {
    return `${topic}__${subtopic}__${setName}`;
  }

  function normalizeStats(stats) {
    if (!stats || typeof stats !== "object") return null;

    return {
      attempts: Number(stats.attempts) || 0,
      bestFullBadgePercentage:
        stats.bestFullBadgePercentage === null || stats.bestFullBadgePercentage === undefined
          ? null
          : Number(stats.bestFullBadgePercentage) || 0,
      lastPlayedAt: stats.lastPlayedAt || "Never",
      streak: Number(stats.streak) || 0,
      completedFullQuiz: Boolean(stats.completedFullQuiz)
    };
  }

  function getSavedStats(topic, subtopic, setName = "set-1") {
    const store = getProgressStore();
    const id = getQuizProgressId(topic, subtopic, setName);

    if (store[id]) return normalizeStats(store[id]);

    const legacy = getLegacySavedStats(topic, subtopic, setName);
    if (legacy) return normalizeStats(legacy);

    return null;
  }

  function calculateSubtopicSummary(topic, subtopic) {
    const stats = getSavedStats(topic, subtopic, "set-1");

    if (!stats) {
      return {
        attempts: 0,
        bestFull: null,
        mastery: "Beginner",
        lastPlayed: "Never",
        streak: 0,
        completed: false,
        progress: 0
      };
    }

    const attempts = stats.attempts;
    const bestFull = stats.bestFullBadgePercentage;
    const mastery = getMasteryLevel(bestFull);
    const lastPlayed = stats.lastPlayedAt || "Never";
    const streak = stats.streak;
    const completed = stats.completedFullQuiz;

    let progress = 0;
    if (completed) {
      progress = 100;
    } else if (bestFull !== null) {
      progress = Math.max(0, Math.min(100, Number(bestFull)));
    }

    return {
      attempts,
      bestFull,
      mastery,
      lastPlayed,
      streak,
      completed,
      progress
    };
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

  function getSubtopicDescription(title, mastery, attempts) {
    if (attempts === 0) {
      return `Start practicing ${title.toLowerCase()} with focused MCQ training.`;
    }

    if (mastery === "Mastered") {
      return `Excellent work. Keep sharpening this area with revision attempts.`;
    }

    if (mastery === "Strong") {
      return `You already have strong progress here. Push toward full mastery.`;
    }

    if (mastery === "Improving") {
      return `Solid foundation built. More focused practice can lift accuracy fast.`;
    }

    return `Build confidence step by step with repeated practice on this subtopic.`;
  }

  function createSubtopicCard(topicSlugValue, subtopic, index) {
    const summary = calculateSubtopicSummary(topicSlugValue, subtopic.slug);
    const badge = summary.bestFull !== null ? getBadgeData(summary.bestFull) : null;
    const card = document.createElement("a");

    card.className = "topic-card fade-slide-up";
    card.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topicSlugValue)}&subtopic=${encodeURIComponent(subtopic.slug)}`;
    card.setAttribute("aria-label", `Open ${subtopic.title}`);
    card.style.animationDelay = `${index * 0.04}s`;

    const actionText = summary.completed ? "Continue Mastering" : summary.attempts > 0 ? "Continue Practice" : "Start Practice";
    const description = getSubtopicDescription(subtopic.title, summary.mastery, summary.attempts);

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Subtopic</div>
          <h2 class="topic-title">${escapeHtml(subtopic.title)}</h2>
          <p class="topic-desc">${escapeHtml(description)}</p>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(subtopic.icon || "📘")}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${summary.attempts}</span>
        <span class="stat-pill">Mastery: ${escapeHtml(summary.mastery)}</span>
        <span class="stat-pill">${summary.completed ? "Completed ✅" : "In Progress"}</span>
        ${badge ? `<span class="stat-pill ${badge.className}">${badge.label}</span>` : ``}
      </div>

      <div style="margin-top: 14px;">
        <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:8px; font-size:13px; color: var(--muted);">
          <span>Progress</span>
          <span>${summary.progress.toFixed(1)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${summary.progress}%"></div>
        </div>
      </div>

      <div class="topic-stats" style="margin-top: 14px;">
        <span class="stat-pill">Last: ${escapeHtml(summary.lastPlayed)}</span>
        <span class="stat-pill">Streak: ${summary.streak} day${summary.streak === 1 ? "" : "s"}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">${actionText}</span>
    `;

    return card;
  }

  if (!topicTitle || !subtopicsGrid) {
    console.error("topic.html is missing required elements.");
    return;
  }

  if (!topicSlug || !topicData[topicSlug]) {
    topicTitle.textContent = "Topic Not Found";

    if (topicHeroTitle) topicHeroTitle.textContent = "Topic Not Found";
    if (topicHeroText) {
      topicHeroText.textContent = "The topic you selected is invalid or missing.";
    }

    subtopicsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>Invalid topic selected</h3>
        <p>Please go back and choose a valid topic.</p>
      </div>
    `;
    return;
  }

  const currentTopic = topicData[topicSlug];

  topicTitle.textContent = currentTopic.title;

  if (topicHeroTitle) {
    topicHeroTitle.textContent = currentTopic.title;
  }

  if (topicHeroText) {
    topicHeroText.textContent = `Choose a subtopic under ${currentTopic.title} and continue your focused past paper MCQ practice.`;
  }

  subtopicsGrid.innerHTML = "";

  if (!Array.isArray(currentTopic.subtopics) || currentTopic.subtopics.length === 0) {
    subtopicsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>No subtopics found yet</h3>
        <p>Add subtopics for this topic to start building quiz sets.</p>
      </div>
    `;
    return;
  }

  currentTopic.subtopics.forEach((subtopic, index) => {
    subtopicsGrid.appendChild(createSubtopicCard(topicSlug, subtopic, index));
  });
});
