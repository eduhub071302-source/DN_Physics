document.addEventListener("DOMContentLoaded", () => {
  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  const SUBJECT_TOPIC_DATA = {
    physics: {
      units: {
        title: "Units",
        icon: "📏",
        subtopics: [
          { slug: "unit-dimensions", title: "Unit Dimensions", icon: "📏" }
        ]
      },

      mechanics: {
        title: "Mechanics",
        icon: "⚙️",
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
        icon: "🌊",
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
        icon: "🔥",
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
        icon: "🌍",
        subtopics: [
          { slug: "gravitational-fields", title: "Gravitational Force Fields", icon: "🌍" }
        ]
      },

      "electrostatics-field": {
        title: "Electrostatics Field",
        icon: "⚡",
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
        icon: "🧲",
        subtopics: [
          { slug: "magnetic-fields", title: "Magnetic Fields", icon: "🧲" },
          { slug: "magnetic-effect-of-current", title: "Magnetic Effect of Electric Currents", icon: "🔄" },
          { slug: "force-on-moving-charge", title: "Force on a Moving Charge in a Magnetic Field", icon: "⚛️" }
        ]
      },

      "current-electricity": {
        title: "Current Electricity",
        icon: "🔋",
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

      electronics: {
        title: "Electronics",
        icon: "💻",
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
        icon: "🏗️",
        subtopics: [
          { slug: "elasticity", title: "Elasticity", icon: "🪢" },
          { slug: "surface-tension", title: "Surface Tension", icon: "💧" },
          { slug: "viscosity", title: "Viscosity", icon: "🫙" }
        ]
      },

      "matter-radiations": {
        title: "Matter & Radiations",
        icon: "☢️",
        subtopics: [
          { slug: "radiation", title: "Radiation", icon: "☢️" },
          { slug: "photoelectric-effect", title: "Photoelectric Effect", icon: "💡" },
          { slug: "wave-particle-duality", title: "Particles and Waves", icon: "🌌" },
          { slug: "radioactivity", title: "Radioactivity", icon: "🧪" },
          { slug: "nuclear-physics", title: "Partial Physics", icon: "⚛️" }
        ]
      }
    },

    chemistry: {
      "atomic-structure": {
        title: "Atomic Structure",
        icon: "⚛️",
        subtopics: [
          { slug: "atomic-theory-of-matter-atomic-nucleus-atomic-number-isotopes-and-mass-number", title: "Atomic Theory of Matter / Atomic Nucleus / Atomic Number / Isotopes and Mass Number", icon: "⚛️" },
          { slug: "electromagnetic-radiation-wave-like-properties-of-matter-quantization-of-energy-broglies-hypothesis-and-matter-spectrums-and-quantum-energy", title: "Electromagnetic Radiation / Wave Like Properties / Quantization / Broglies Hypothesis / Spectrums", icon: "🌈" },
          { slug: "shapes-of-orbitals", title: "Shapes of Orbitals", icon: "🌀" },
          { slug: "orbitals-and-quantum-numbers", title: "Orbitals and Quantum Numbers", icon: "🔢" },
          { slug: "electronic-configurations", title: "Electronic Configurations", icon: "⚡" },
          { slug: "building-up-the-periodic-table", title: "Building Up the Periodic Table", icon: "🧱" },
          { slug: "periodic-trends", title: "Periodic Trends", icon: "📈" },
          { slug: "size-of-atoms-and-ions", title: "Size of Atoms and Ions", icon: "⚪" },
          { slug: "ionization-energy", title: "Ionization Energy", icon: "🔋" },
          { slug: "electronegativity", title: "Electronegativity", icon: "🧲" },
          { slug: "lattice", title: "Lattice", icon: "🔷" }
        ]
      },

      "structure-and-bonding": {
        title: "Structure and Bonding",
        icon: "🔗",
        subtopics: [
          { slug: "covalent-bonds-geometrical-shapes-polarity", title: "Covalent Bonds / Geometrical Shapes / Polarity", icon: "🔗" },
          { slug: "ionic-bonds-and-metalic-bonds", title: "Ionic Bonds and Metalic Bonds", icon: "⚙️" },
          { slug: "secondary-interactions-with-the-boiling-points", title: "Secondary Interactions with the Boiling Points", icon: "♨️" }
        ]
      },

      "chemical-calculation": {
        title: "Chemical Calculation",
        icon: "🧮",
        subtopics: [
          { slug: "oxidation-number-and-redox-reactions", title: "Oxidation Number and Redox Reactions", icon: "🔄" },
          { slug: "nomenclature-of-simple-inorganic-acids-and-salts", title: "Nomenclature of Simple Inorganic Acids and Salts", icon: "🏷️" },
          { slug: "atomic-mass-mole-avagadro-constant-empirical-molecular-formula-mole-fraction-composition-in-a-solution-ppn-ppm-and-concentration-molality", title: "Atomic Mass / Mole / Avagadro Constant / Formula / PPN / PPM / Molality", icon: "⚖️" },
          { slug: "simple-nuclear-reactions", title: "Simple Nuclear Reactions", icon: "☢️" },
          { slug: "chemical-calculation", title: "Chemical Calculation", icon: "🧮" }
        ]
      },

      "gaseous-state-of-matter": {
        title: "Gaseous State of Matter",
        icon: "💨",
        subtopics: [
          { slug: "gass-laws-molar-volumes-and-calculation-using-pv-equals-nrt", title: "Gass Laws / Molar Volumes / PV = nRT", icon: "💨" },
          { slug: "boltzmann-distribution", title: "Boltzmann Distribution", icon: "📊" },
          { slug: "real-gases-vanderwaal-equation-and-phase-diagrams", title: "Real Gases / Vanderwaal Equation / Phase Diagrams", icon: "🌫️" }
        ]
      },

      energetic: {
        title: "Energetic",
        icon: "🔥",
        subtopics: [
          { slug: "exprimental-measurment-of-heat-enegry-and-enthalpy", title: "Exprimental Measurment of Heat Enegry and Enthalpy", icon: "🔥" },
          { slug: "standard-enthalpy-definiton-and-the-calculation-of-deltah", title: "Standard Enthalpy Definiton and the Calculation of DeltaH", icon: "📐" },
          { slug: "born-haber-cycle", title: "Born Haber Cycle", icon: "🔁" },
          { slug: "relationship-between-entropy-and-gibbs-free-energy", title: "Relationship Between Entropy and Gibbs Free Energy", icon: "⚖️" }
        ]
      },

      "chemistry-of-s-p-and-d-block-elements": {
        title: "Chemistry of s, p and d Block Elements",
        icon: "🧪",
        subtopics: [
          { slug: "group-1", title: "Group 1", icon: "1️⃣" },
          { slug: "group-2", title: "Group 2", icon: "2️⃣" },
          { slug: "group-13", title: "Group 13", icon: "1️⃣3️⃣" },
          { slug: "group-14", title: "Group 14", icon: "1️⃣4️⃣" },
          { slug: "group-15", title: "Group 15", icon: "1️⃣5️⃣" },
          { slug: "group-16", title: "Group 16", icon: "1️⃣6️⃣" },
          { slug: "group-17", title: "Group 17", icon: "1️⃣7️⃣" },
          { slug: "group-18", title: "Group 18", icon: "1️⃣8️⃣" },
          { slug: "chemical-reaction-in-s-and-p-block", title: "Chemical Reaction in s and p Block", icon: "⚗️" },
          { slug: "iupac-nomenclature-of-elements-in-d-block-and-theri-complec-compounds", title: "IUPAC Nomenclature of d Block Elements and Complex Compounds", icon: "🏷️" },
          { slug: "relationship-between-s-and-d-blcok", title: "Relationship Between s and d Blcok", icon: "🔗" },
          { slug: "relationship-between-p-and-d-block", title: "Relationship Between p and d Block", icon: "🔗" },
          { slug: "relationship-between-s-p-and-d-blcok", title: "Relationship Between s, p and d Blcok", icon: "🔗" },
          { slug: "cation-analysisi", title: "Cation Analysisi", icon: "🧫" },
          { slug: "percipitations", title: "Percipitations", icon: "🌧️" },
          { slug: "anion-analysis", title: "Anion Analysis", icon: "🧪" }
        ]
      },

      "basic-concepts-of-organic-chemistry": {
        title: "Basic Concepts of Organic Chemistry",
        icon: "🌿",
        subtopics: [
          { slug: "iupac-nomenclature-of-organic-compunds", title: "IUPAC Nomenclature of Organic Compunds", icon: "🏷️" },
          { slug: "isomerism", title: "Isomerism", icon: "🪞" },
          { slug: "constutuinal-isomers", title: "Constutuinal Isomers", icon: "🔀" },
          { slug: "molecular-formular", title: "Molecular Formular", icon: "🧬" }
        ]
      },

      "hydrocarbons-and-halohydrocarbons": {
        title: "Hydrocarbons and Halohydrocarbons",
        icon: "⛽",
        subtopics: [
          { slug: "structure-of-alkanes", title: "Structure of Alkanes", icon: "🧱" },
          { slug: "reactions-of-alkanes", title: "Reactions of Alkanes", icon: "⚗️" },
          { slug: "structure-of-alkenes", title: "Structure of Alkenes", icon: "🧱" },
          { slug: "reactions-of-alkenes", title: "Reactions of Alkenes", icon: "⚗️" },
          { slug: "structure-of-alkynes", title: "Structure of Alkynes", icon: "🧱" },
          { slug: "reactions-of-alkynes", title: "Reactions of Alkynes", icon: "⚗️" },
          { slug: "structure-of-benzene", title: "Structure of Benzene", icon: "⭕" },
          { slug: "reactions-of-benzene", title: "Reactions of Benzene", icon: "⚗️" },
          { slug: "directing-ability-of-substiuend-groups-of-mono-subtituted-benzene", title: "Directing Ability of Substiuend Groups of Mono Subtituted Benzene", icon: "🧭" },
          { slug: "alkyl-halides", title: "Alkyl Halides", icon: "🧪" }
        ]
      },

      "oxygen-containg-organic-compunds": {
        title: "Oxygen Containg Organic Compunds",
        icon: "🫧",
        subtopics: [
          { slug: "physical-properties-and-chemical-reaction-in-alchohol", title: "Physical Properties and Chemical Reaction in Alchohol", icon: "🍶" },
          { slug: "reaction-of-phenol", title: "Reaction of Phenol", icon: "⚗️" },
          { slug: "carbonyl-compunds", title: "Carbonyl Compunds", icon: "🧪" },
          { slug: "reactions-of-carboxylic-acids", title: "Reactions of Carboxylic Acids", icon: "⚗️" },
          { slug: "reaction-of-acid-chloride", title: "Reaction of Acid Chloride", icon: "⚗️" },
          { slug: "reaction-of-ester", title: "Reaction of Ester", icon: "⚗️" },
          { slug: "reaction-of-amides", title: "Reaction of Amides", icon: "⚗️" }
        ]
      },

      "nitrogen-containing-organic-compounds": {
        title: "Nitrogen Containing Organic Compounds",
        icon: "🧫",
        subtopics: [
          { slug: "reaction-of-amine", title: "Reaction of Amine", icon: "⚗️" },
          { slug: "reaction-of-anilene", title: "Reaction of Anilene", icon: "⚗️" },
          { slug: "reaction-of-diazonium-salts", title: "Reaction of Diazonium Salts", icon: "⚗️" },
          { slug: "change-of-acidity-in-organic-compounds", title: "Change of Acidity in Organic Compounds", icon: "📉" },
          { slug: "change-of-basicity-in-organic-compunds", title: "Change of Basicity in Organic Compunds", icon: "📈" },
          { slug: "boiling-points-of-organic-compunds", title: "Boiling Points of Organic Compunds", icon: "♨️" },
          { slug: "solubility-of-organic-compunds", title: "Solubility of Organic Compunds", icon: "💧" }
        ]
      },

      "chemical-kinetics": {
        title: "Chemical Kinetics",
        icon: "⏱️",
        subtopics: [
          { slug: "factors-effecting-the-rate-of-a-reaction", title: "Factors Effecting the Rate of a Reaction", icon: "⚡" },
          { slug: "the-determination-of-rate-constant-order-and-rate-of-reactions", title: "The Determination of Rate Constant, Order and Rate of Reactions", icon: "📊" }
        ]
      },

      equilibrium: {
        title: "Equilibrium",
        icon: "⚖️",
        subtopics: [
          { slug: "le-chatelier-principle", title: "Le Chatelier Principle", icon: "⚖️" },
          { slug: "kp-kc-and-kp-kc-relationship", title: "Kp / Kc and Kp / Kc Relationship", icon: "🔗" },
          { slug: "ionic-produc-of-water", title: "Ionic Produc of Water", icon: "💧" },
          { slug: "strong-acid-strong-base-weak-acid-and-weak-base", title: "Strong Acid / Strong Base / Weak Acid / Weak Base", icon: "🧪" },
          { slug: "ka-kb-and-ph-values", title: "Ka / Kb and pH Values", icon: "📏" },
          { slug: "ph-value-of-salt-solutions-and-buffers", title: "pH Value of Salt Solutions and Buffers", icon: "🫙" },
          { slug: "acid-base-indicators", title: "Acid-Base Indicators", icon: "🎨" },
          { slug: "solubility-product", title: "Solubility Product", icon: "💧" },
          { slug: "group-analysis", title: "Group Analysis", icon: "🧫" },
          { slug: "fractional-distillation-and-roults-law", title: "Fractional Distillation and Roults Law", icon: "🧪" },
          { slug: "distribution-coefficiennt", title: "Distribution Coefficiennt", icon: "📊" },
          { slug: "steam-distillation", title: "Steam Distillation", icon: "♨️" }
        ]
      },

      "electro-chemistry": {
        title: "Electro Chemistry",
        icon: "🔋",
        subtopics: [
          { slug: "conductivity", title: "Conductivity", icon: "⚡" },
          { slug: "cells-and-electrodes", title: "Cells and Electrodes", icon: "🔋" },
          { slug: "electrolysis", title: "Electrolysis", icon: "🧲" },
          { slug: "electrochemical-series", title: "Electrochemical Series", icon: "📈" }
        ]
      },

      "industrial-chemistry-and-environmental-pollution": {
        title: "Industrial Chemistry and Environmental Pollution",
        icon: "🏭",
        subtopics: [
          { slug: "industries-base-on-sea-water", title: "Industries Base on Sea Water", icon: "🌊" },
          { slug: "industies-based-on-air", title: "Industies Based on Air", icon: "💨" },
          { slug: "indusries-baes-on-earth", title: "Indusries Baes on Earth", icon: "🌍" },
          { slug: "industries-based-on-polymers", title: "Industries Based on Polymers", icon: "🧵" },
          { slug: "industries-based-on-plants", title: "Industries Based on Plants", icon: "🌿" },
          { slug: "air-pollution-and-composition", title: "Air Pollution and Composition", icon: "🏭" },
          { slug: "water-pollution-and-composition", title: "Water Pollution and Composition", icon: "💧" },
          { slug: "oxygen-concentration-in-water", title: "Oxygen Concentration in Water", icon: "🫧" }
        ]
      }
    }
  };

  const SUBJECT_TOPIC_ORDER = {
    physics: [
      "units",
      "mechanics",
      "oscillations-waves",
      "thermal-physics",
      "gravitational-field",
      "electrostatics-field",
      "magnetic-field",
      "current-electricity",
      "electronics",
      "mechanical-properties",
      "matter-radiations"
    ],
    chemistry: [
      "atomic-structure",
      "structure-and-bonding",
      "chemical-calculation",
      "gaseous-state-of-matter",
      "energetic",
      "chemistry-of-s-p-and-d-block-elements",
      "basic-concepts-of-organic-chemistry",
      "hydrocarbons-and-halohydrocarbons",
      "oxygen-containg-organic-compunds",
      "nitrogen-containing-organic-compounds",
      "chemical-kinetics",
      "equilibrium",
      "electro-chemistry",
      "industrial-chemistry-and-environmental-pollution"
    ]
  };

  const params = new URLSearchParams(window.location.search);
  const subject = (params.get("subject") || "physics").toLowerCase().trim();
  const topicSlug = (params.get("topic") || "").trim();

  const topicTitle = document.getElementById("topicTitle");
  const topicHeroTitle = document.getElementById("topicHeroTitle");
  const topicHeroText = document.getElementById("topicHeroText");
  const subtopicsGrid = document.getElementById("subtopicsGrid");
  const backToTopicsLink = document.getElementById("backToTopicsLink");
  const refreshTopicBtn = document.getElementById("refreshTopicBtn");

  if (!topicTitle || !topicHeroTitle || !topicHeroText || !subtopicsGrid || !backToTopicsLink) {
    console.error("Topic page elements not found.");
    return;
  }

  function getCurrentUserId() {
    try {
      const firebaseUid = window.firebaseAuth?.currentUser?.uid;
      if (firebaseUid) return firebaseUid;

      const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
      if (cachedUser?.id) return cachedUser.id;
    } catch (error) {
      console.warn("Could not resolve current user id:", error);
    }

    return "guest";
  }

  function getQuizProgressStorageKey() {
    return `${QUIZ_PROGRESS_KEY}_${getCurrentUserId()}`;
  }

  function setupRefresh() {
    if (!refreshTopicBtn) return;

    refreshTopicBtn.addEventListener("click", () => {
      document.body.classList.add("page-is-refreshing");
      setTimeout(() => {
        window.location.reload();
      }, 120);
    });
  }

  function updateBackLink() {
    backToTopicsLink.href = `/pp-quiz/index.html?subject=${encodeURIComponent(subject)}`;
  }

  function makeNiceTitle(slug) {
    return (slug || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(getQuizProgressStorageKey())) || {};
    } catch {
      return {};
    }
  }

  function getQuizProgressId(subjectSlug, topicSlugValue, subtopicSlug, setName = "set-1") {
    return `${subjectSlug}__${topicSlugValue}__${subtopicSlug || ""}__${setName}`;
  }

  function getLegacySavedStats(topicSlugValue, subtopicSlug, setName = "set-1") {
    const key = `dn_physics_pp-quiz_${topicSlugValue}_${subtopicSlug}_${setName}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  }

  function normalizeStats(stats) {
    if (!stats) {
      return {
        attempts: 0,
        bestPercentage: "0.0",
        bestFullBadgePercentage: null,
        lastPlayedAt: "Never",
        streak: 0,
        completedFullQuiz: false
      };
    }

    return {
      attempts: Number(stats.attempts) || 0,
      bestPercentage: stats.bestPercentage ?? "0.0",
      bestFullBadgePercentage:
        stats.bestFullBadgePercentage == null
          ? (stats.bestPercentage == null ? null : Number(stats.bestPercentage) || 0)
          : Number(stats.bestFullBadgePercentage) || 0,
      lastPlayedAt: stats.lastPlayedAt || "Never",
      streak: Number(stats.streak) || 0,
      completedFullQuiz: Boolean(stats.completedFullQuiz)
    };
  }

  function getSavedStats(subjectSlug, topicSlugValue, subtopicSlug, setName = "set-1") {
    const store = getProgressStore();
    const id = getQuizProgressId(subjectSlug, topicSlugValue, subtopicSlug, setName);

    if (store[id]) return normalizeStats(store[id]);

    if (subjectSlug === "physics") {
      const legacy = getLegacySavedStats(topicSlugValue, subtopicSlug, setName);
      if (legacy) return normalizeStats(legacy);
    }

    return normalizeStats(null);
  }

  function getBadgeData(p) {
    const value = Number(p) || 0;
    if (value >= 90) return { label: "🥇 Gold", className: "badge-gold" };
    if (value >= 75) return { label: "🥈 Silver", className: "badge-silver" };
    if (value >= 50) return { label: "🥉 Bronze", className: "badge-bronze" };
    return null;
  }

  function getMasteryLevel(p) {
    const value = Number(p) || 0;
    if (value >= 90) return "Mastered";
    if (value >= 75) return "Strong";
    if (value >= 50) return "Improving";
    return "Beginner";
  }

  function canAccessCurrentTopic(subjectSlug, currentTopicSlug) {
    if (typeof hasPaidAccess === "function" && hasPaidAccess()) {
      return true;
    }

    const orderedTopics = SUBJECT_TOPIC_ORDER[subjectSlug] || [];
    return orderedTopics[0] === currentTopicSlug;
  }

  function renderEmpty(message) {
    subtopicsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>No subtopics found</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function buildSubtopicCard(subtopic, index) {
    const setName = "set-1";
    const stats = getSavedStats(subject, topicSlug, subtopic.slug, setName);
    const badge = getBadgeData(stats.bestFullBadgePercentage);
    const mastery = getMasteryLevel(stats.bestFullBadgePercentage);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = `/pp-quiz/subtopic.html?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topicSlug)}&subtopic=${encodeURIComponent(subtopic.slug)}`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Subtopic Practice</div>
          <h3 class="topic-title">${escapeHtml(subtopic.title)}</h3>
          <p class="topic-desc">
            Practice ${escapeHtml(subtopic.title)} with focused MCQs.
          </p>
        </div>
        <div class="topic-icon" aria-hidden="true">${subtopic.icon || "📘"}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${stats.attempts}</span>
        <span class="stat-pill">Mastery: ${mastery}</span>
        <span class="stat-pill">
          Badge: ${badge ? `<span class="${badge.className}">${badge.label}</span>` : "None"}
        </span>
      </div>

      <button class="action-btn enter-topic-btn" type="button">
        Open Subtopic
      </button>
    `;

    card.style.animationDelay = `${Math.min(index * 35, 220)}ms`;
    return card;
  }

  updateBackLink();
  setupRefresh();

  if (!SUBJECT_TOPIC_DATA[subject]) {
    topicTitle.textContent = "Subject Not Found";
    topicHeroTitle.textContent = "Subject Not Found";
    topicHeroText.textContent = "The subject you selected is invalid.";
    renderEmpty("Invalid subject selected.");
    return;
  }

  if (!topicSlug) {
    topicTitle.textContent = "Topic Not Found";
    topicHeroTitle.textContent = "Topic Not Found";
    topicHeroText.textContent = "No topic was selected.";
    renderEmpty("Missing topic.");
    return;
  }

  if (!canAccessCurrentTopic(subject, topicSlug)) {
    topicTitle.textContent = "🔒 Locked";
    topicHeroTitle.textContent = "Premium Content";
    topicHeroText.textContent = "Only lesson 1 is free. Unlock to access all topics.";
    subtopicsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>This topic is locked 🔒</h3>
        <p>Only lesson 1 is free. Unlock all topics to continue.</p>
      </div>
    `;
    return;
  }

  const topicData = SUBJECT_TOPIC_DATA[subject][topicSlug];

  if (!topicData) {
    topicTitle.textContent = "Topic Not Found";
    topicHeroTitle.textContent = "Topic Not Found";
    topicHeroText.textContent = "The selected topic could not be found.";
    renderEmpty("Invalid topic selected.");
    return;
  }

  topicTitle.textContent = topicData.title || makeNiceTitle(topicSlug);
  topicHeroTitle.textContent = topicData.title || makeNiceTitle(topicSlug);
  topicHeroText.textContent = "Choose a subtopic and continue your MCQ practice.";

  const subtopics = Array.isArray(topicData.subtopics) ? topicData.subtopics : [];

  if (!subtopics.length) {
    renderEmpty("No subtopics configured for this topic yet.");
    return;
  }

  subtopicsGrid.innerHTML = "";
  subtopics.forEach((subtopic, index) => {
    subtopicsGrid.appendChild(buildSubtopicCard(subtopic, index));
  });
});
