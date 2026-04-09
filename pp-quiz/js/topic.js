document.addEventListener("DOMContentLoaded", () => {
  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  const SUBJECT_TOPIC_DATA = {
    physics: {
      "units": {
        title: "Units",
        icon: "📏",
        subtopics: [
          { slug: "unit-dimensions", title: "Unit Dimensions", icon: "📏" }
        ]
      },

      "mechanics": {
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

      "electronics": {
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

      "energetic": {
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

      "equilibrium": {
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
    },

    maths: {
      "trignometry": { title: "Trignometry", icon: "📐" },
      "remainder-theorm-and-factors": { title: "Remainder Theorm and Factors", icon: "➗" },
      "limit-and-differentiation": { title: "Limit and Differentiation", icon: "📉" },
      "vectors": { title: "Vectors", icon: "↗️" },
      "equilibrium-of-factors": { title: "Equilibrium of Factors", icon: "⚖️" },
      "inequalitis-and-modules-funtion": { title: "Inequalitis and Modules Funtion", icon: "≠" },
      "quadratic-equation": { title: "Quadratic Equation", icon: "✖️" },
      "sysytem-of-forces": { title: "Sysytem of Forces", icon: "🧲" },
      "motion-of-straigt-line-and-velocity-time-curce": { title: "Motion of Straigt Line and Velocity Time Curce", icon: "🏃" },
      "relatice-velocity": { title: "Relatice Velocity", icon: "🚀" },
      "mathematical-induction": { title: "Mathematical Induction", icon: "🧠" },
      "projectiles": { title: "Projectiles", icon: "🎯" },
      "relatice-acceleration": { title: "Relatice Acceleration", icon: "⚡" },
      "frction": { title: "Frction", icon: "🪵" },
      "frame-work": { title: "Frame Work", icon: "🏗️" },
      "straight-line": { title: "Straight Line", icon: "📏" },
      "circle": { title: "Circle", icon: "⭕" },
      "work-enegry-power": { title: "Work, Enegry, Power", icon: "🔋" },
      "impulse-and-impact": { title: "Impulse and Impact", icon: "💥" },
      "circular-motion": { title: "Circular Motion", icon: "🌀" },
      "probability": { title: "Probability", icon: "🎲" },
      "binomial-theorem": { title: "Binomial Theorem", icon: "📘" },
      "complex-numbers": { title: "Complex Numbers", icon: "🔢" },
      "simple-harmonic-motion": { title: "Simple Harmonic Motion", icon: "🌊" },
      "statistic": { title: "Statistic", icon: "📊" },
      "differenntitation-and-graphs": { title: "Differenntitation and Graphs", icon: "📈" },
      "intergration": { title: "Intergration", icon: "∫" },
      "premutation-and-combination": { title: "Premutation and Combination", icon: "🔀" },
      "series": { title: "Series", icon: "🔁" },
      "center-of-gravity": { title: "Center of Gravity", icon: "⚪" }
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
    ],
    maths: [
      "trignometry",
      "remainder-theorm-and-factors",
      "limit-and-differentiation",
      "vectors",
      "equilibrium-of-factors",
      "inequalitis-and-modules-funtion",
      "quadratic-equation",
      "sysytem-of-forces",
      "motion-of-straigt-line-and-velocity-time-curce",
      "relatice-velocity",
      "mathematical-induction",
      "projectiles",
      "relatice-acceleration",
      "frction",
      "frame-work",
      "straight-line",
      "circle",
      "work-enegry-power",
      "impulse-and-impact",
      "circular-motion",
      "probability",
      "binomial-theorem",
      "complex-numbers",
      "simple-harmonic-motion",
      "statistic",
      "differenntitation-and-graphs",
      "intergration",
      "premutation-and-combination",
      "series",
      "center-of-gravity"
    ]
  };

  const params = new URLSearchParams(window.location.search);
  const subject = (params.get("subject") || "physics").toLowerCase().trim();
  const topicSlug = (params.get("topic") || "").trim();

  const topicTitle = document.getElementById("topicTitle");
  const topicHeroTitle = document.getElementById("topicHeroTitle");
  const topicHeroText = document.getElementById("topicHeroText");
  const subtopicsGrid = document.getElementById("subtopicsGrid");
  const refreshTopicBtn = document.getElementById("refreshTopicBtn");
  const backToTopicsLink = document.getElementById("backToTopicsLink") || document.querySelector(".back-link");

  const sectionTitleEl = document.querySelector('section.fade-slide-up h3');
  const sectionDescEl = document.querySelector('section.fade-slide-up p');
  const topicPillEl = document.querySelector(".topic-card .topic-pill");

  if (!topicTitle || !subtopicsGrid) {
    console.error("topic.html is missing required elements.");
    return;
  }

  const currentSubjectData = SUBJECT_TOPIC_DATA[subject];
  if (!currentSubjectData) {
    topicTitle.textContent = "Subject Not Found";
    if (topicHeroTitle) topicHeroTitle.textContent = "Subject Not Found";
    if (topicHeroText) topicHeroText.textContent = "The subject you selected is invalid.";
    renderEmptyState("Invalid subject selected", "Please go back and choose a valid subject.");
    return;
  }

  const currentTopic = currentSubjectData[topicSlug];
  if (!topicSlug || !currentTopic) {
    topicTitle.textContent = "Topic Not Found";
    if (topicHeroTitle) topicHeroTitle.textContent = "Topic Not Found";
    if (topicHeroText) topicHeroText.textContent = "The topic you selected is invalid or missing.";
    renderEmptyState("Invalid topic selected", "Please go back and choose a valid topic.");
    updateBackLink(subject);
    return;
  }

  if (!canAccessCurrentTopic(subject, topicSlug)) {
    topicTitle.textContent = "🔒 Locked Topic";

    if (topicHeroTitle) topicHeroTitle.textContent = "Premium Content";
    if (topicHeroText) {
      topicHeroText.textContent = "Only lesson 1 is free. Unlock to access all topics.";
    }

    if (sectionTitleEl) sectionTitleEl.textContent = "Locked Topic";
    if (sectionDescEl) sectionDescEl.textContent = "Unlock premium access to continue.";

    renderEmptyState("This topic is locked 🔒", "Only lesson 1 is free. Unlock all topics to continue.");
    updateBackLink(subject);
    setupRefresh();
    return;
  }

  topicTitle.textContent = currentTopic.title;
  if (topicHeroTitle) topicHeroTitle.textContent = currentTopic.title;
  if (topicPillEl) topicPillEl.textContent = `${getSubjectLabel(subject)} • Topic Practice`;
  updateBackLink(subject);
  setupRefresh();

  if (subject === "maths") {
    if (sectionTitleEl) sectionTitleEl.textContent = "Start Practice";
    if (sectionDescEl) sectionDescEl.textContent = "Tap below to begin your maths practice.";
    if (topicHeroText) {
      topicHeroText.textContent = `Start focused practice for ${currentTopic.title} using the same quiz system.`;
    }

    subtopicsGrid.innerHTML = "";
    subtopicsGrid.appendChild(createMathsPracticeCard(subject, topicSlug, currentTopic, 0));
    return;
  }

  if (sectionTitleEl) sectionTitleEl.textContent = "Select a Subtopic";
  if (sectionDescEl) sectionDescEl.textContent = "Tap a subtopic to continue your practice.";

  if (topicHeroText) {
    topicHeroText.textContent = `Choose a subtopic under ${currentTopic.title} and continue your focused past paper MCQ practice.`;
  }

  subtopicsGrid.innerHTML = "";

  if (!Array.isArray(currentTopic.subtopics) || currentTopic.subtopics.length === 0) {
    renderEmptyState("No subtopics found yet", "Add subtopics for this topic to start building quiz sets.");
    return;
  }

  currentTopic.subtopics.forEach((subtopic, index) => {
    subtopicsGrid.appendChild(createSubtopicCard(subject, topicSlug, subtopic, index));
  });

  function getSubjectLabel(subjectSlug) {
    if (subjectSlug === "chemistry") return "DinuuNOVA Chemistry";
    if (subjectSlug === "maths") return "DinuuNOVA Maths";
    return "DinuuNOVA Physics";
  }

  function updateBackLink(subjectSlug) {
    if (!backToTopicsLink) return;
    backToTopicsLink.href = `/pp-quiz/index.html?subject=${encodeURIComponent(subjectSlug)}`;
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

  function canAccessCurrentTopic(subjectSlug, currentTopicSlug) {
    if (typeof hasPaidAccess === "function" && hasPaidAccess()) {
      return true;
    }

    const orderedTopics = SUBJECT_TOPIC_ORDER[subjectSlug] || [];
    return orderedTopics[0] === currentTopicSlug;
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

  function getCurrentUserId() {
    try {
      const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
      if (cachedUser?.id) return cachedUser.id;
 
      const rawSupabase = localStorage.getItem("supabase.auth.token");
      if (rawSupabase) {
        const parsed = JSON.parse(rawSupabase);
        const sessionUser = parsed?.currentSession?.user || parsed?.user || null;
        if (sessionUser?.id) return sessionUser.id;
      }
    } catch (error) {
      console.warn("Could not resolve current user id:", error);
    }

    return "guest";
  }

  function getProgressKey() {
    return `dnPhysicsQuizProgress_${getCurrentUserId()}`;
  }

  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(getProgressKey())) || {};
    } catch {
      return {};
    }
  }

  function getLegacySavedStats(topic, subtopic, setName = "set-1") {
    const currentUserId = getCurrentUserId();

    const userScopedLegacyKey = `dn_${currentUserId}_pp-quiz_${topic}_${subtopic}_${setName}`;
    try {
      const scoped = JSON.parse(localStorage.getItem(userScopedLegacyKey) || "null");
      if (scoped) return scoped;
    } catch {}

    const oldGlobalKey = `dn_physics_pp-quiz_${topic}_${subtopic}_${setName}`;
    try {
      return JSON.parse(localStorage.getItem(oldGlobalKey)) || null;
    } catch {
      return null;
    }
  }

  function getQuizProgressId(subjectSlug, topic, subtopic = "", setName = "set-1") {
    return `${subjectSlug}__${topic}__${subtopic}__${setName}`;
  }

  function normalizeStats(stats) {
    if (!stats || typeof stats !== "object") return null;

    return {
      attempts: Number(stats.attempts) || 0,
      bestFullBadgePercentage:
        stats.bestFullBadgePercentage === null || stats.bestFullBadgePercentage === undefined
          ? (stats.bestPercentage === null || stats.bestPercentage === undefined ? null : Number(stats.bestPercentage) || 0)
          : Number(stats.bestFullBadgePercentage) || 0,
      lastPlayedAt: stats.lastPlayedAt || "Never",
      streak: Number(stats.streak) || 0,
      completedFullQuiz: Boolean(stats.completedFullQuiz)
    };
  }

  function getSavedStats(subjectSlug, topic, subtopic = "", setName = "set-1") {
    const store = getProgressStore();
    const id = getQuizProgressId(subjectSlug, topic, subtopic, setName);

    if (store[id]) return normalizeStats(store[id]);

    if (subjectSlug === "physics" && subtopic) {
      const legacy = getLegacySavedStats(topic, subtopic, setName);
      if (legacy) return normalizeStats(legacy);
    }

    return null;
  }

  function calculateSubtopicSummary(subjectSlug, topic, subtopic) {
    const stats = getSavedStats(subjectSlug, topic, subtopic, "set-1");

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

  function calculateMathsTopicSummary(subjectSlug, topic) {
    const stats = getSavedStats(subjectSlug, topic, "", "set-1");

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
        "\"": "&quot;",
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
      return "Excellent work. Keep sharpening this area with revision attempts.";
    }

    if (mastery === "Strong") {
      return "You already have strong progress here. Push toward full mastery.";
    }

    if (mastery === "Improving") {
      return "Solid foundation built. More focused practice can lift accuracy fast.";
    }

    return "Build confidence step by step with repeated practice on this area.";
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
      if (!touching || !event.touches) return;

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
      }
    });
  }

  function createSubtopicCard(subjectSlug, topicSlugValue, subtopic, index) {
    const summary = calculateSubtopicSummary(subjectSlug, topicSlugValue, subtopic.slug);
    const badge = summary.bestFull !== null ? getBadgeData(summary.bestFull) : null;

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = `/pp-quiz/subtopic.html?subject=${encodeURIComponent(subjectSlug)}&topic=${encodeURIComponent(topicSlugValue)}&subtopic=${encodeURIComponent(subtopic.slug)}`;
    card.setAttribute("aria-label", `Open ${subtopic.title}`);
    card.style.animationDelay = `${index * 0.04}s`;

    const actionText = summary.completed
      ? "Continue Mastering"
      : summary.attempts > 0
      ? "Continue Practice"
      : "Start Practice";

    const description = getSubtopicDescription(subtopic.title, summary.mastery, summary.attempts);

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Subtopic</div>
          <h2 class="topic-title">${escapeHtml(subtopic.title)}</h2>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(subtopic.icon || "📘")}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${summary.attempts}</span>
        <span class="stat-pill">Mastery: ${escapeHtml(summary.mastery)}</span>
        <span class="stat-pill">${summary.completed ? "Completed ✅" : "In Progress"}</span>
        ${badge ? `<span class="stat-pill ${badge.className}">${badge.label}</span>` : ``}
      </div>

      <div class="subtopic-progress-block">
        <div class="subtopic-progress-head">
          <span>Progress</span>
          <span>${summary.progress.toFixed(1)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${summary.progress}%"></div>
        </div>
      </div>

      <div class="topic-stats subtopic-meta-stats">
        <span class="stat-pill">Last: ${escapeHtml(summary.lastPlayed)}</span>
        <span class="stat-pill">Streak: ${summary.streak} day${summary.streak === 1 ? "" : "s"}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">${actionText}</span>
    `;

    attachSmoothCardTouch(card);
    return card;
  }

  function createMathsPracticeCard(subjectSlug, topicSlugValue, topicMeta, index) {
    const summary = calculateMathsTopicSummary(subjectSlug, topicSlugValue);
    const badge = summary.bestFull !== null ? getBadgeData(summary.bestFull) : null;

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.href = `/pp-quiz/quiz.html?subject=${encodeURIComponent(subjectSlug)}&topic=${encodeURIComponent(topicSlugValue)}&set=${encodeURIComponent("set-1")}`;
    card.setAttribute("aria-label", `Start practice for ${topicMeta.title}`);
    card.style.animationDelay = `${index * 0.04}s`;

    const actionText = summary.completed
      ? "Continue Mastering"
      : summary.attempts > 0
      ? "Continue Practice"
      : "Start Practice";

    const description = getSubtopicDescription(topicMeta.title, summary.mastery, summary.attempts);

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Topic Practice</div>
          <h2 class="topic-title">${escapeHtml(topicMeta.title)}</h2>
        </div>
        <div class="topic-icon" aria-hidden="true">${escapeHtml(topicMeta.icon || "📘")}</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${summary.attempts}</span>
        <span class="stat-pill">Mastery: ${escapeHtml(summary.mastery)}</span>
        <span class="stat-pill">${summary.completed ? "Completed ✅" : "In Progress"}</span>
        ${badge ? `<span class="stat-pill ${badge.className}">${badge.label}</span>` : ``}
      </div>

      <div class="subtopic-progress-block">
        <div class="subtopic-progress-head">
          <span>Progress</span>
          <span>${summary.progress.toFixed(1)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${summary.progress}%"></div>
        </div>
      </div>

      <div class="topic-stats subtopic-meta-stats">
        <span class="stat-pill">Last: ${escapeHtml(summary.lastPlayed)}</span>
        <span class="stat-pill">Streak: ${summary.streak} day${summary.streak === 1 ? "" : "s"}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">${actionText}</span>
    `;

    attachSmoothCardTouch(card);
    return card;
  }

  function renderEmptyState(title, message) {
    subtopicsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
});
