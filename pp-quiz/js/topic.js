document.addEventListener("DOMContentLoaded", () => {
  const topicData = {
    "units": {
      title: "Units",
      subtopics: [
        { slug: "unit-dimensions", title: "Unit Dimensions" }
      ]
    },

    "mechanics": {
      title: "Mechanics",
      subtopics: [
        { slug: "linear-motion", title: "Linear Motion" },
        { slug: "equilibrium-of-force", title: "Equilibrium of Force" },
        { slug: "center-of-gravity", title: "Center of Gravity" },
        { slug: "newtons-laws", title: "Newton's Laws" },
        { slug: "momentum", title: "Momentum" },
        { slug: "friction", title: "Friction" },
        { slug: "work-power-energy", title: "Work, Power and Energy" },
        { slug: "rotational-motion", title: "Rotational Motion" },
        { slug: "circular-motion", title: "Circular Motion" },
        { slug: "hydrostatics", title: "Hydrostatics" },
        { slug: "hydrodynamics", title: "Hydrodynamics" }
      ]
    },

    "oscillations-waves": {
      title: "Oscillations & Waves",
      subtopics: [
        { slug: "simple-harmonic-motion", title: "Simple Harmonic Motion" },
        { slug: "wave-properties", title: "Wave Properties" },
        { slug: "transverse-waves", title: "Transverse Waves" },
        { slug: "velocity-of-sound", title: "Velocity of Sound" },
        { slug: "longitudinal-waves", title: "Longitudinal Waves" },
        { slug: "doppler-effect", title: "Doppler Effect" },
        { slug: "intensity-of-sound", title: "Intensity of Sound" },
        { slug: "electromagnetic-waves", title: "Electromagnetic Waves" },
        { slug: "refraction", title: "Refraction" },
        { slug: "prisms", title: "Prisms" },
        { slug: "lenses", title: "Lenses" },
        { slug: "defects-of-vision", title: "Defects of Vision" },
        { slug: "optical-instruments", title: "Optical Instruments" }
      ]
    },

    "thermal-physics": {
      title: "Thermal Physics",
      subtopics: [
        { slug: "thermometry", title: "Thermometry" },
        { slug: "expansion-solids", title: "Expansion of Solids" },
        { slug: "expansion-liquids", title: "Expansion of Liquids" },
        { slug: "expansion-gases", title: "Expansion of Gases" },
        { slug: "calorimetry", title: "Calorimetry" },
        { slug: "thermodynamics", title: "Thermodynamics" },
        { slug: "hygrometry", title: "Hygrometry" },
        { slug: "conduction", title: "Conduction" },
        { slug: "convection", title: "Convection" }
      ]
    },

    "gravitational-field": {
      title: "Gravitational Field",
      subtopics: [
        { slug: "gravitational-fields", title: "Gravitational Force Fields" }
      ]
    },

    "electrostatics-field": {
      title: "Electrostatics Field",
      subtopics: [
        { slug: "coulombs-law", title: "Coulomb's Law" },
        { slug: "electric-field-intensity", title: "Electric Field Intensity" },
        { slug: "gauss-law", title: "Gauss Law" },
        { slug: "electric-potential", title: "Electrostatic Potential" },
        { slug: "capacitance", title: "Capacitance and Capacitors" }
      ]
    },

    "magnetic-field": {
      title: "Magnetic Field",
      subtopics: [
        { slug: "magnetic-fields", title: "Magnetic Fields" },
        { slug: "magnetic-effect-of-current", title: "Magnetic Effect of Electric Currents" },
        { slug: "force-on-moving-charge", title: "Force on a Moving Charge in a Magnetic Field" }
      ]
    },

    "current-electricity": {
      title: "Current Electricity",
      subtopics: [
        { slug: "ohms-law", title: "Ohm's Law" },
        { slug: "resistors-combination", title: "Combinations of Resistances" },
        { slug: "heating-effect", title: "Heating Effect of Electric Current" },
        { slug: "kirchhoffs-law", title: "Kirchhoff's Law" },
        { slug: "cells-combination", title: "Combinations of Cells" },
        { slug: "wheatstone-bridge", title: "Wheatstone Bridge" },
        { slug: "meter-bridge", title: "Meter Bridge" },
        { slug: "moving-coil-meters", title: "Moving Coil Meters" },
        { slug: "potentiometer", title: "Potentiometer" },
        { slug: "electromagnetic-induction", title: "Electromagnetic Induction" },
        { slug: "mutual-induction", title: "Mutual Induction" }
      ]
    },

    "electronics": {
      title: "Electronics",
      subtopics: [
        { slug: "semiconductors", title: "Semiconductors" },
        { slug: "diodes", title: "Diodes" },
        { slug: "transistors", title: "Transistors" },
        { slug: "integrated-circuits", title: "Integrated Circuits" },
        { slug: "logic-gates", title: "Logic Gates" }
      ]
    },

    "mechanical-properties": {
      title: "Mechanical Properties",
      subtopics: [
        { slug: "elasticity", title: "Elasticity" },
        { slug: "surface-tension", title: "Surface Tension" },
        { slug: "viscosity", title: "Viscosity" }
      ]
    },

    "matter-radiations": {
      title: "Matter & Radiations",
      subtopics: [
        { slug: "radiation", title: "Radiation" },
        { slug: "photoelectric-effect", title: "Photoelectric Effect" },
        { slug: "wave-particle-duality", title: "Particles and Waves" },
        { slug: "radioactivity", title: "Radioactivity" },
        { slug: "nuclear-physics", title: "Partial Physics" }
      ]
    }
  };

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  const params = new URLSearchParams(window.location.search);
  const topicSlug = params.get("topic");

  const topicTitle = document.getElementById("topicTitle");
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

  function getSavedStats(topic, subtopic, setName = "set-1") {
    const store = getProgressStore();
    const id = getQuizProgressId(topic, subtopic, setName);

    if (store[id]) return store[id];

    const legacy = getLegacySavedStats(topic, subtopic, setName);
    if (legacy) return legacy;

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

    const attempts = Number(stats.attempts) || 0;
    const bestFull = stats.bestFullBadgePercentage ?? null;
    const mastery = getMasteryLevel(bestFull);
    const lastPlayed = stats.lastPlayedAt || "Never";
    const streak = Number(stats.streak) || 0;
    const completed = Boolean(stats.completedFullQuiz);
    const progress = completed ? 100 : bestFull ? Number(bestFull) : 0;

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

  function createSubtopicCard(topicSlugValue, subtopic) {
    const summary = calculateSubtopicSummary(topicSlugValue, subtopic.slug);
    const badge = summary.bestFull ? getBadgeData(summary.bestFull) : null;

    const card = document.createElement("a");
    card.className = "topic-card";
    card.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topicSlugValue)}&subtopic=${encodeURIComponent(subtopic.slug)}`;

    card.innerHTML = `
      <h2>${subtopic.title}</h2>
      <p>${summary.completed ? "Continue mastering" : "Start quiz"}</p>

      <div class="quiz-progress-strip">
        <div class="quiz-progress-label-row">
          <span>Progress</span>
          <span>${summary.progress.toFixed(1)}%</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${summary.progress}%"></div>
        </div>
      </div>

      <div class="subtopic-meta">
        <span class="meta-pill">Attempts: ${summary.attempts}</span>
        <span class="meta-pill">Mastery: ${summary.mastery}</span>
        <span class="meta-pill">Last: ${summary.lastPlayed}</span>
        <span class="meta-pill">Streak: ${summary.streak} day${summary.streak === 1 ? "" : "s"}</span>
        ${
          summary.completed
            ? `<span class="meta-pill badge-gold">Completed ✅</span>`
            : `<span class="meta-pill">Not Completed</span>`
        }
        ${
          badge
            ? `<span class="meta-pill ${badge.className}">Badge: ${badge.label}</span>`
            : ""
        }
      </div>
    `;

    return card;
  }

  if (!topicTitle || !subtopicsGrid) {
    console.error("topic.html is missing required elements.");
    return;
  }

  if (!topicSlug || !topicData[topicSlug]) {
    topicTitle.textContent = "Topic Not Found";
    subtopicsGrid.innerHTML = `<p>Invalid topic selected.</p>`;
    return;
  }

  const currentTopic = topicData[topicSlug];

  topicTitle.textContent = currentTopic.title;
  subtopicsGrid.innerHTML = "";

  if (!Array.isArray(currentTopic.subtopics) || currentTopic.subtopics.length === 0) {
    subtopicsGrid.innerHTML = `<p>No subtopics found yet.</p>`;
    return;
  }

  currentTopic.subtopics.forEach((subtopic) => {
    subtopicsGrid.appendChild(createSubtopicCard(topicSlug, subtopic));
  });
});
