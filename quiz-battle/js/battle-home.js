const BATTLE_APP_PATH = "";
const BATTLE_GUEST_ID_KEY = "dn_battle_guest_player_id";
const BATTLE_GUEST_NAME_KEY = "dn_battle_guest_name";
const BATTLE_LAST_ROOM_KEY = "dn_battle_last_room";
const BATTLE_LAST_SUBJECT_KEY = "dn_battle_last_subject";
const BATTLE_LAST_TOPIC_PREFIX = "dn_battle_last_topic_";
const BATTLE_LAST_SUBTOPIC_PREFIX = "dn_battle_last_subtopic_";

const BATTLE_MAIN_TOKENS_KEY = "dn_battle_main_tokens";
const BATTLE_REWARDS_STATE_KEY = "dn_battle_rewards_state";

const BATTLE_CUSTOMIZE_STATE_KEY = "dn_battle_customize_state";
const BATTLE_BACKGROUNDS = {
  bg1: {
    id: "bg1",
    name: "Golden Study Girl",
    image: "/assets/backgrounds/bg_01_golden_study_girl.png",
  },
  bg2: {
    id: "bg2",
    name: "Classroom Focus Boy",
    image: "/assets/backgrounds/bg_02_classroom_focus_boy.png",
  },
  bg3: {
    id: "bg3",
    name: "Neon Math Boy",
    image: "/assets/backgrounds/bg_03_neon_math_boy.png",
  },
  bg4: {
    id: "bg4",
    name: "Night Math Girl",
    image: "/assets/backgrounds/bg_04_night_math_girl.png",
  },
  bg5: {
    id: "bg5",
    name: "Deep Focus Boy",
    image: "/assets/backgrounds/bg_05_deep_focus_boy.png",
  },
};

const BATTLE_REWARDS_CONFIG = [
  {
    id: "backgrounds",
    name: "Background Royale",
    tag: "Premium Backgrounds",
    icon: "🖼️",
    description: "Spin for premium lobby backgrounds using DN Tokens.",
    spinCostRoyale: 1,
    bundleCostMain: 4,
    bundleQty: 5,
    rewards: [
      {
        id: "bg-nebula",
        name: "Royal Blue Nebula",
        weight: 22,
        previewGlow: "rgba(66, 168, 255, 0.28)",
      },
      {
        id: "bg-sunset",
        name: "Solar Sunset",
        weight: 18,
        previewGlow: "rgba(255, 159, 27, 0.28)",
      },
      {
        id: "bg-violet",
        name: "Violet Pulse",
        weight: 16,
        previewGlow: "rgba(122, 92, 255, 0.28)",
      },
      {
        id: "bg-crimson",
        name: "Crimson Strike",
        weight: 14,
        previewGlow: "rgba(255, 94, 132, 0.28)",
      },
      {
        id: "bg-aurora",
        name: "Arctic Aurora",
        weight: 12,
        previewGlow: "rgba(95, 255, 214, 0.24)",
      },
      {
        id: "bg-night",
        name: "Night Crown",
        weight: 10,
        previewGlow: "rgba(160, 180, 255, 0.26)",
      },
      {
        id: "bg-gold",
        name: "Golden Arena",
        weight: 5,
        previewGlow: "rgba(255, 202, 69, 0.30)",
      },
      {
        id: "bg-legend",
        name: "Legend Rift",
        weight: 3,
        previewGlow: "rgba(255, 110, 215, 0.30)",
      },
    ],
  },
  {
    id: "characters",
    name: "Character Royale",
    tag: "Premium Characters",
    icon: "🧍",
    description: "Spin for premium characters and hero skins.",
    spinCostRoyale: 1,
    bundleCostMain: 5,
    bundleQty: 5,
    rewards: [
      {
        id: "char-joseph-gold",
        name: "Joseph Gold",
        weight: 22,
        previewGlow: "rgba(255, 202, 69, 0.28)",
      },
      {
        id: "char-nova",
        name: "Nova Prime",
        weight: 18,
        previewGlow: "rgba(66, 168, 255, 0.28)",
      },
      {
        id: "char-titan",
        name: "Titan X",
        weight: 16,
        previewGlow: "rgba(122, 92, 255, 0.28)",
      },
      {
        id: "char-spark",
        name: "Spark Flash",
        weight: 14,
        previewGlow: "rgba(95, 205, 255, 0.28)",
      },
      {
        id: "char-crown",
        name: "Crown Scholar",
        weight: 12,
        previewGlow: "rgba(255, 159, 27, 0.26)",
      },
      {
        id: "char-shadow",
        name: "Shadow Arc",
        weight: 10,
        previewGlow: "rgba(160, 180, 255, 0.26)",
      },
      {
        id: "char-legend",
        name: "Legend Emperor",
        weight: 5,
        previewGlow: "rgba(255, 110, 215, 0.30)",
      },
      {
        id: "char-mythic",
        name: "Mythic Judge",
        weight: 3,
        previewGlow: "rgba(255, 94, 132, 0.30)",
      },
    ],
  },
  {
    id: "kits",
    name: "Kit Royale",
    tag: "Character Kits",
    icon: "🧰",
    description: "Spin for premium character kits and battle loadouts.",
    spinCostRoyale: 1,
    bundleCostMain: 3,
    bundleQty: 5,
    rewards: [
      {
        id: "kit-speed",
        name: "Speed Kit",
        weight: 22,
        previewGlow: "rgba(66, 168, 255, 0.28)",
      },
      {
        id: "kit-shield",
        name: "Shield Kit",
        weight: 18,
        previewGlow: "rgba(122, 92, 255, 0.28)",
      },
      {
        id: "kit-boost",
        name: "Boost Kit",
        weight: 16,
        previewGlow: "rgba(255, 159, 27, 0.28)",
      },
      {
        id: "kit-focus",
        name: "Focus Kit",
        weight: 14,
        previewGlow: "rgba(95, 255, 214, 0.24)",
      },
      {
        id: "kit-surge",
        name: "Surge Kit",
        weight: 12,
        previewGlow: "rgba(255, 94, 132, 0.24)",
      },
      {
        id: "kit-royal",
        name: "Royal Kit",
        weight: 10,
        previewGlow: "rgba(255, 202, 69, 0.26)",
      },
      {
        id: "kit-epic",
        name: "Epic Kit",
        weight: 5,
        previewGlow: "rgba(255, 110, 215, 0.30)",
      },
      {
        id: "kit-mythic",
        name: "Mythic Kit",
        weight: 3,
        previewGlow: "rgba(255, 110, 215, 0.34)",
      },
    ],
  },
  {
    id: "token-vault",
    name: "Royale Token Vault",
    tag: "Royale Token Bundles",
    icon: "💎",
    description: "Spin for bundles of royale tokens using your main DN Tokens.",
    spinCostRoyale: 1,
    bundleCostMain: 2,
    bundleQty: 5,
    rewards: [
      {
        id: "vault-bg-3",
        name: "+3 Background Tokens",
        weight: 24,
        previewGlow: "rgba(66, 168, 255, 0.28)",
        grantRoyaleTokens: [{ royaleId: "backgrounds", amount: 3 }],
      },
      {
        id: "vault-char-2",
        name: "+2 Character Tokens",
        weight: 20,
        previewGlow: "rgba(255, 202, 69, 0.28)",
        grantRoyaleTokens: [{ royaleId: "characters", amount: 2 }],
      },
      {
        id: "vault-kit-3",
        name: "+3 Kit Tokens",
        weight: 18,
        previewGlow: "rgba(122, 92, 255, 0.28)",
        grantRoyaleTokens: [{ royaleId: "kits", amount: 3 }],
      },
      {
        id: "vault-mix-2",
        name: "+1 BG +1 Char",
        weight: 14,
        previewGlow: "rgba(95, 255, 214, 0.24)",
        grantRoyaleTokens: [
          { royaleId: "backgrounds", amount: 1 },
          { royaleId: "characters", amount: 1 },
        ],
      },
      {
        id: "vault-mix-3",
        name: "+1 All Tokens",
        weight: 12,
        previewGlow: "rgba(255, 159, 27, 0.26)",
        grantRoyaleTokens: [
          { royaleId: "backgrounds", amount: 1 },
          { royaleId: "characters", amount: 1 },
          { royaleId: "kits", amount: 1 },
        ],
      },
      {
        id: "vault-char-4",
        name: "+4 Character Tokens",
        weight: 7,
        previewGlow: "rgba(255, 110, 215, 0.30)",
        grantRoyaleTokens: [{ royaleId: "characters", amount: 4 }],
      },
      {
        id: "vault-bg-5",
        name: "+5 Background Tokens",
        weight: 3,
        previewGlow: "rgba(255, 202, 69, 0.32)",
        grantRoyaleTokens: [{ royaleId: "backgrounds", amount: 5 }],
      },
      {
        id: "vault-kit-5",
        name: "+5 Kit Tokens",
        weight: 2,
        previewGlow: "rgba(122, 92, 255, 0.32)",
        grantRoyaleTokens: [{ royaleId: "kits", amount: 5 }],
      },
    ],
  },
];

const BATTLE_SUBJECT_DATA = {
  physics: {
    label: "Physics",
    topics: [
      {
        slug: "units",
        title: "Units",
        subtopics: [{ slug: "unit-dimensions", title: "Unit Dimensions" }],
      },
      {
        slug: "mechanics",
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
          { slug: "hydrodynamics", title: "Hydrodynamics" },
        ],
      },
      {
        slug: "oscillations-waves",
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
          { slug: "optical-instruments", title: "Optical Instruments" },
        ],
      },
      {
        slug: "thermal-physics",
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
          { slug: "convection", title: "Convection" },
        ],
      },
      {
        slug: "gravitational-field",
        title: "Gravitational Field",
        subtopics: [
          { slug: "gravitational-fields", title: "Gravitational Force Fields" },
        ],
      },
      {
        slug: "electrostatics-field",
        title: "Electrostatics Field",
        subtopics: [
          { slug: "coulombs-law", title: "Coulomb's Law" },
          {
            slug: "electric-field-intensity",
            title: "Electric Field Intensity",
          },
          { slug: "gauss-law", title: "Gauss Law" },
          { slug: "electric-potential", title: "Electrostatic Potential" },
          { slug: "capacitance", title: "Capacitance and Capacitors" },
        ],
      },
      {
        slug: "magnetic-field",
        title: "Magnetic Field",
        subtopics: [
          { slug: "magnetic-fields", title: "Magnetic Fields" },
          {
            slug: "magnetic-effect-of-current",
            title: "Magnetic Effect of Electric Currents",
          },
          {
            slug: "force-on-moving-charge",
            title: "Force on a Moving Charge in a Magnetic Field",
          },
        ],
      },
      {
        slug: "current-electricity",
        title: "Current Electricity",
        subtopics: [
          { slug: "ohms-law", title: "Ohm's Law" },
          {
            slug: "resistors-combination",
            title: "Combinations of Resistances",
          },
          {
            slug: "heating-effect",
            title: "Heating Effect of Electric Current",
          },
          { slug: "kirchhoffs-law", title: "Kirchhoff's Law" },
          { slug: "cells-combination", title: "Combinations of Cells" },
          { slug: "wheatstone-bridge", title: "Wheatstone Bridge" },
          { slug: "meter-bridge", title: "Meter Bridge" },
          { slug: "moving-coil-meters", title: "Moving Coil Meters" },
          { slug: "potentiometer", title: "Potentiometer" },
          {
            slug: "electromagnetic-induction",
            title: "Electromagnetic Induction",
          },
          { slug: "mutual-induction", title: "Mutual Induction" },
        ],
      },
      {
        slug: "electronics",
        title: "Electronics",
        subtopics: [
          { slug: "semiconductors", title: "Semiconductors" },
          { slug: "diodes", title: "Diodes" },
          { slug: "transistors", title: "Transistors" },
          { slug: "integrated-circuits", title: "Integrated Circuits" },
          { slug: "logic-gates", title: "Logic Gates" },
        ],
      },
      {
        slug: "mechanical-properties",
        title: "Mechanical Properties",
        subtopics: [
          { slug: "elasticity", title: "Elasticity" },
          { slug: "surface-tension", title: "Surface Tension" },
          { slug: "viscosity", title: "Viscosity" },
        ],
      },
      {
        slug: "matter-radiations",
        title: "Matter & Radiations",
        subtopics: [
          { slug: "radiation", title: "Radiation" },
          { slug: "photoelectric-effect", title: "Photoelectric Effect" },
          { slug: "wave-particle-duality", title: "Particles and Waves" },
          { slug: "radioactivity", title: "Radioactivity" },
          { slug: "nuclear-physics", title: "Partial Physics" },
        ],
      },
    ],
  },

  chemistry: {
    label: "Chemistry",
    topics: [
      {
        slug: "atomic-structure",
        title: "Atomic Structure",
        subtopics: [
          {
            slug: "atomic-theory-of-matter-atomic-nucleus-atomic-number-isotopes-and-mass-number",
            title: "Atomic Theory / Nucleus / Atomic Number / Isotopes",
          },
          {
            slug: "electromagnetic-radiation-wave-like-properties-of-matter-quantization-of-energy-broglies-hypothesis-and-matter-spectrums-and-quantum-energy",
            title: "Radiation / Wave Properties / Quantization / Spectrums",
          },
          { slug: "shapes-of-orbitals", title: "Shapes of Orbitals" },
          {
            slug: "orbitals-and-quantum-numbers",
            title: "Orbitals and Quantum Numbers",
          },
          {
            slug: "electronic-configurations",
            title: "Electronic Configurations",
          },
          {
            slug: "building-up-the-periodic-table",
            title: "Building Up the Periodic Table",
          },
          { slug: "periodic-trends", title: "Periodic Trends" },
          { slug: "size-of-atoms-and-ions", title: "Size of Atoms and Ions" },
          { slug: "ionization-energy", title: "Ionization Energy" },
          { slug: "electronegativity", title: "Electronegativity" },
          { slug: "lattice", title: "Lattice" },
        ],
      },
      {
        slug: "structure-and-bonding",
        title: "Structure and Bonding",
        subtopics: [
          {
            slug: "covalent-bonds-geometrical-shapes-polarity",
            title: "Covalent Bonds / Shapes / Polarity",
          },
          {
            slug: "ionic-bonds-and-metalic-bonds",
            title: "Ionic Bonds and Metalic Bonds",
          },
          {
            slug: "secondary-interactions-with-the-boiling-points",
            title: "Secondary Interactions with Boiling Points",
          },
        ],
      },
      {
        slug: "chemical-calculation",
        title: "Chemical Calculation",
        subtopics: [
          {
            slug: "oxidation-number-and-redox-reactions",
            title: "Oxidation Number and Redox Reactions",
          },
          {
            slug: "nomenclature-of-simple-inorganic-acids-and-salts",
            title: "Nomenclature of Inorganic Acids and Salts",
          },
          {
            slug: "atomic-mass-mole-avagadro-constant-empirical-molecular-formula-mole-fraction-composition-in-a-solution-ppn-ppm-and-concentration-molality",
            title: "Atomic Mass / Mole / Formula / Molality",
          },
          {
            slug: "simple-nuclear-reactions",
            title: "Simple Nuclear Reactions",
          },
          { slug: "chemical-calculation", title: "Chemical Calculation" },
        ],
      },
      {
        slug: "gaseous-state-of-matter",
        title: "Gaseous State of Matter",
        subtopics: [
          {
            slug: "gass-laws-molar-volumes-and-calculation-using-pv-equals-nrt",
            title: "Gas Laws / Molar Volume / PV = nRT",
          },
          { slug: "boltzmann-distribution", title: "Boltzmann Distribution" },
          {
            slug: "real-gases-vanderwaal-equation-and-phase-diagrams",
            title: "Real Gases / Vanderwaal Equation / Phase Diagrams",
          },
        ],
      },
      {
        slug: "energetic",
        title: "Energetic",
        subtopics: [
          {
            slug: "exprimental-measurment-of-heat-enegry-and-enthalpy",
            title: "Experimental Measurement of Heat Energy and Enthalpy",
          },
          {
            slug: "standard-enthalpy-definiton-and-the-calculation-of-deltah",
            title: "Standard Enthalpy and DeltaH",
          },
          { slug: "born-haber-cycle", title: "Born Haber Cycle" },
          {
            slug: "relationship-between-entropy-and-gibbs-free-energy",
            title: "Entropy and Gibbs Free Energy",
          },
        ],
      },
      {
        slug: "chemistry-of-s-p-and-d-block-elements",
        title: "Chemistry of s, p and d Block Elements",
        subtopics: [
          { slug: "group-1", title: "Group 1" },
          { slug: "group-2", title: "Group 2" },
          { slug: "group-13", title: "Group 13" },
          { slug: "group-14", title: "Group 14" },
          { slug: "group-15", title: "Group 15" },
          { slug: "group-16", title: "Group 16" },
          { slug: "group-17", title: "Group 17" },
          { slug: "group-18", title: "Group 18" },
          {
            slug: "chemical-reaction-in-s-and-p-block",
            title: "Chemical Reaction in s and p Block",
          },
          {
            slug: "iupac-nomenclature-of-elements-in-d-block-and-theri-complec-compounds",
            title: "IUPAC Nomenclature of d Block and Complex Compounds",
          },
          {
            slug: "relationship-between-s-and-d-blcok",
            title: "Relationship Between s and d Block",
          },
          {
            slug: "relationship-between-p-and-d-block",
            title: "Relationship Between p and d Block",
          },
          {
            slug: "relationship-between-s-p-and-d-blcok",
            title: "Relationship Between s, p and d Block",
          },
          { slug: "cation-analysisi", title: "Cation Analysis" },
          { slug: "percipitations", title: "Percipitations" },
          { slug: "anion-analysis", title: "Anion Analysis" },
        ],
      },
      {
        slug: "basic-concepts-of-organic-chemistry",
        title: "Basic Concepts of Organic Chemistry",
        subtopics: [
          {
            slug: "iupac-nomenclature-of-organic-compunds",
            title: "IUPAC Nomenclature of Organic Compounds",
          },
          { slug: "isomerism", title: "Isomerism" },
          { slug: "constutuinal-isomers", title: "Constitutional Isomers" },
          { slug: "molecular-formular", title: "Molecular Formula" },
        ],
      },
      {
        slug: "hydrocarbons-and-halohydrocarbons",
        title: "Hydrocarbons and Halohydrocarbons",
        subtopics: [
          { slug: "structure-of-alkanes", title: "Structure of Alkanes" },
          { slug: "reactions-of-alkanes", title: "Reactions of Alkanes" },
          { slug: "structure-of-alkenes", title: "Structure of Alkenes" },
          { slug: "reactions-of-alkenes", title: "Reactions of Alkenes" },
        ],
      },
      {
        slug: "oxygen-containg-organic-compunds",
        title: "Oxygen Containg Organic Compunds",
        subtopics: [],
      },
      {
        slug: "nitrogen-containing-organic-compounds",
        title: "Nitrogen Containing Organic Compounds",
        subtopics: [],
      },
      {
        slug: "chemical-kinetics",
        title: "Chemical Kinetics",
        subtopics: [],
      },
      {
        slug: "equilibrium",
        title: "Equilibrium",
        subtopics: [],
      },
      {
        slug: "electro-chemistry",
        title: "Electro Chemistry",
        subtopics: [],
      },
      {
        slug: "industrial-chemistry-and-environmental-pollution",
        title: "Industrial Chemistry and Environmental Pollution",
        subtopics: [],
      },
    ],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  window.dnThemeApplyToCurrentPage?.();

  const els = getEls();
  const state = buildInitialState();

  bindUi(els, state);
  applyProfileToUi(els, state);
  hydrateCreateRoomSelectors(els, state);
  applySelectionToUi(els, state);
  initRotateNotice(els);
  initRewardsUi(els, state);
  applyCustomizeStateToUi(els, state);
});

function getEls() {
  return {
    rotateNotice: document.getElementById("rotateNotice"),
    rotateContinueBtn: document.getElementById("rotateContinueBtn"),

    battleTokenCount: document.getElementById("battleTokenCount"),
    battleArenaLabel: document.getElementById("battleArenaLabel"),
    battleSaveLabel: document.getElementById("battleSaveLabel"),

    battleProfileAvatar: document.getElementById("battleProfileAvatar"),
    battleProfileMiniAvatar: document.getElementById("battleProfileMiniAvatar"),
    battleProfileNameCard: document.getElementById("battleProfileNameCard"),
    battleHeroName: document.getElementById("battleHeroName"),
    battleHeroSubline: document.getElementById("battleHeroSubline"),
    battlePlayerName: document.getElementById("battlePlayerName"),
    battlePlayerLevel: document.getElementById("battlePlayerLevel"),
    battleRoleLabel: document.getElementById("battleRoleLabel"),

    battleSelectedModeText: document.getElementById("battleSelectedModeText"),
    battleSelectedSubjectTag: document.getElementById(
      "battleSelectedSubjectTag",
    ),

    battleNavLobbyBtn: document.getElementById("battleNavLobbyBtn"),
    battleNavFriendsBtn: document.getElementById("battleNavFriendsBtn"),
    battleNavRewardsBtn: document.getElementById("battleNavRewardsBtn"),
    battleNavSummaryBtn: document.getElementById("battleNavSummaryBtn"),
    battleSummaryOverlay: document.getElementById("battleSummaryOverlay"),
    battleSummaryCloseBtn: document.getElementById("battleSummaryCloseBtn"),
    battleSummaryMode: document.getElementById("battleSummaryMode"),
    battleSummarySubject: document.getElementById("battleSummarySubject"),
    battleSummaryTopic: document.getElementById("battleSummaryTopic"),
    battleSummarySubtopic: document.getElementById("battleSummarySubtopic"),
    battleNavHistoryBtn: document.getElementById("battleNavHistoryBtn"),

    battleOpenCustomizeBtn: document.getElementById("battleOpenCustomizeBtn"),
    battleCustomizeDrawer: document.getElementById("battleCustomizeDrawer"),
    battleCustomizeCloseBtn: document.getElementById("battleCustomizeCloseBtn"),
    battleCustomizeTabBackgrounds: document.getElementById(
      "battleCustomizeTabBackgrounds",
    ),
    battleCustomizeTabStages: document.getElementById(
      "battleCustomizeTabStages",
    ),
    battleCustomizeBackgroundsPane: document.getElementById(
      "battleCustomizeBackgroundsPane",
    ),
    battleCustomizeStagesPane: document.getElementById(
      "battleCustomizeStagesPane",
    ),
    battleCinematicBg: document.getElementById("battleCinematicBg"),
    battleThemeFx: document.getElementById("battleThemeFx"),

    customizeBackgroundCards: Array.from(
      document.querySelectorAll(".battle-customize-item-card[data-bg-id]"),
    ),

    battleRewardsOverlay: document.getElementById("battleRewardsOverlay"),
    battleRewardsBackBtn: document.getElementById("battleRewardsBackBtn"),
    battleRewardsTypeList: document.getElementById("battleRewardsTypeList"),
    battleRewardsTag: document.getElementById("battleRewardsTag"),
    battleRewardsTitle: document.getElementById("battleRewardsTitle"),
    battleRewardsDesc: document.getElementById("battleRewardsDesc"),
    battleRewardsMainTokenText: document.getElementById(
      "battleRewardsMainTokenText",
    ),
    battleRewardsWheelTitle: document.getElementById("battleRewardsWheelTitle"),
    battleRewardsCostText: document.getElementById("battleRewardsCostText"),
    battleRewardsSpinBtn: document.getElementById("battleRewardsSpinBtn"),
    battleRewardsWheel: document.getElementById("battleRewardsWheel"),
    battleRewardsPreviewGlow: document.getElementById(
      "battleRewardsPreviewGlow",
    ),
    battleRewardsPreviewName: document.getElementById(
      "battleRewardsPreviewName",
    ),
    battleRewardsSelectedRoyaleName: document.getElementById(
      "battleRewardsSelectedRoyaleName",
    ),
    battleRewardsPoolCount: document.getElementById("battleRewardsPoolCount"),
    battleRewardsRoyaleTokenText: document.getElementById(
      "battleRewardsRoyaleTokenText",
    ),
    battleRewardsBuyBundleBtn: document.getElementById(
      "battleRewardsBuyBundleBtn",
    ),
    battleRewardsEquipBtn: document.getElementById("battleRewardsEquipBtn"),
    battleRewardsHistory: document.getElementById("battleRewardsHistory"),

    battleRightPanelShell: document.getElementById("battleRightPanelShell"),
    battleModePanel: document.getElementById("battleModePanel"),
    battleFriendsPanel: document.getElementById("battleFriendsPanel"),
    battleFriendsBackBtn: document.getElementById("battleFriendsBackBtn"),

    battleHistoryPanel: document.getElementById("battleHistoryPanel"),
    battleHistoryBackBtn: document.getElementById("battleHistoryBackBtn"),
    battleHistoryList: document.getElementById("battleHistoryList"),
    battleHistoryTotalCount: document.getElementById("battleHistoryTotalCount"),

    battleCharsOverlay: document.getElementById("battleCharsOverlay"),
    battleCharsBackBtn: document.getElementById("battleCharsBackBtn"),
    battleCharsGrid: document.getElementById("battleCharsGrid"),
    battleCharsRoleBadge: document.getElementById("battleCharsRoleBadge"),
    battleCharsTitle: document.getElementById("battleCharsTitle"),
    battleCharsBio: document.getElementById("battleCharsBio"),
    battleCharsPreviewImage: document.getElementById("battleCharsPreviewImage"),
    battleCharsUseBtn: document.getElementById("battleCharsUseBtn"),

    openModePanelBtn: document.getElementById("openModePanelBtn"),
    closeModePanelBtn: document.getElementById("closeModePanelBtn"),
    startSelectedBattleBtn: document.getElementById("startSelectedBattleBtn"),
    createRoomBtn: document.getElementById("createRoomBtn"),
    joinRoomBtn: document.getElementById("joinRoomBtn"),

    createRoomModal: document.getElementById("createRoomModal"),
    closeCreateRoomModalBtn: document.getElementById("closeCreateRoomModalBtn"),
    confirmCreateRoomBtn: document.getElementById("confirmCreateRoomBtn"),

    joinRoomModal: document.getElementById("joinRoomModal"),
    closeJoinRoomModalBtn: document.getElementById("closeJoinRoomModalBtn"),
    confirmJoinRoomBtn: document.getElementById("confirmJoinRoomBtn"),
    battleJoinRoomCodeInput: document.getElementById("battleJoinRoomCodeInput"),

    battleModeSelect: document.getElementById("battleModeSelect"),
    battleSubjectSelect: document.getElementById("battleSubjectSelect"),
    battleTopicSelect: document.getElementById("battleTopicSelect"),
    battleSubtopicSelect: document.getElementById("battleSubtopicSelect"),

    modeOptions: Array.from(document.querySelectorAll(".battle-mode-option")),
    charCards: Array.from(document.querySelectorAll(".battle-char-card")),
  };
}

function buildInitialState() {
  const profile = getBattlePlayerProfile();

  const savedSubject = safeLocalGet(BATTLE_LAST_SUBJECT_KEY) || "physics";
  const subject = BATTLE_SUBJECT_DATA[savedSubject] ? savedSubject : "physics";

  const savedTopic =
    safeLocalGet(`${BATTLE_LAST_TOPIC_PREFIX}${subject}`) || "";
  const subjectTopics = BATTLE_SUBJECT_DATA[subject]?.topics || [];
  const topic = subjectTopics.some((item) => item.slug === savedTopic)
    ? savedTopic
    : subjectTopics[0]?.slug || "";

  const savedSubtopic =
    safeLocalGet(`${BATTLE_LAST_SUBTOPIC_PREFIX}${subject}_${topic}`) || "";
  const topicData = getTopicData(subject, topic);
  const subtopic = (topicData?.subtopics || []).some(
    (item) => item.slug === savedSubtopic,
  )
    ? savedSubtopic
    : topicData?.subtopics?.[0]?.slug || "";

  const rewards = buildInitialRewardsState(profile.tokens);

  return {
    profile,
    selectedMode: "normal-dual",
    selectedModeLabel: "Normal Duel",
    selectedTimerLabel: "Timer: Match Based",
    selectedSubject: subject,
    selectedTopic: topic,
    selectedSubtopic: subtopic,
    mainTokens: rewards.mainTokens,
    rewards,
    customize: buildInitialCustomizeState(),
  };
}

function bindUi(els, state) {
  els.rotateContinueBtn?.addEventListener("click", async () => {
    hideRotateNotice(els);
    await tryLandscapeLock();
  });

  els.modeOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = String(button.dataset.mode || "normal-dual").trim();
      const modeLabel = String(
        button.dataset.modeLabel || prettifySlug(mode),
      ).trim();
      const timerLabel = String(
        button.dataset.timerLabel || "Timer: Match Based",
      ).trim();

      state.selectedMode = mode;
      state.selectedModeLabel = modeLabel;
      state.selectedTimerLabel = timerLabel;

      els.modeOptions.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      if (els.battleModeSelect) {
        els.battleModeSelect.value = mode;
      }

      applySelectionToUi(els, state);
    });
  });

  els.openModePanelBtn?.addEventListener("click", () => {
    closeAllPopupsOnly(els);
    toggleRightPanel(els, "modes");
  });

  els.closeModePanelBtn?.addEventListener("click", () => {
    hideRightPanels(els);
  });

  els.battleNavLobbyBtn?.addEventListener("click", () => {
    closeAllPopupsOnly(els);
    toggleRightPanel(els, "modes");
  });

  els.battleNavFriendsBtn?.addEventListener("click", () => {
    closeAllPopupsOnly(els);
    toggleRightPanel(els, "friends");
  });

  els.battleFriendsBackBtn?.addEventListener("click", () => {
    hideRightPanels(els);
  });

  els.battleNavHistoryBtn?.addEventListener("click", () => {
    closeAllPopupsOnly(els);
    toggleRightPanel(els, "history");
  });

  els.battleHistoryBackBtn?.addEventListener("click", () => {
    hideRightPanels(els);
  });

  els.battleOpenCustomizeBtn?.addEventListener("click", () => {
    openCustomizeDrawer(els);
  });

  els.battleCustomizeCloseBtn?.addEventListener("click", () => {
    closeCustomizeDrawer(els);
  });

  els.battleCustomizeTabBackgrounds?.addEventListener("click", () => {
    showCustomizePane(els, "backgrounds");
  });

  els.battleCustomizeTabStages?.addEventListener("click", () => {
    showCustomizePane(els, "stages");
  });

  els.customizeBackgroundCards?.forEach((card) => {
    card.addEventListener("click", () => {
      const bgId = String(card.dataset.bgId || "").trim();
      if (!bgId || !BATTLE_BACKGROUNDS[bgId]) return;

      state.customize.activeBackgroundId = bgId;
      persistCustomizeState(state);
      applyCustomizeStateToUi(els, state);
    });
  });

  els.battleNavSummaryBtn?.addEventListener("click", () => {
    openSummaryOverlay(els, state);
  });

  els.battleSummaryCloseBtn?.addEventListener("click", () => {
    closeSummaryOverlay(els);
  });

  els.battleSummaryOverlay?.addEventListener("click", (event) => {
    if (
      event.target === els.battleSummaryOverlay ||
      event.target.classList.contains("battle-summary-backdrop")
    ) {
      closeSummaryOverlay(els);
    }
  });

  els.battleCharsBackBtn?.addEventListener("click", () => {
    closeCharsOverlay(els);
  });

  els.battleCharsOverlay?.addEventListener("click", (event) => {
    if (
      event.target === els.battleCharsOverlay ||
      event.target.classList.contains("battle-chars-backdrop")
    ) {
      closeCharsOverlay(els);
    }
  });

  els.charCards?.forEach((card) => {
    card.addEventListener("click", () => {
      applySelectedCharToOverlay(els, card);
    });
  });

  els.battleCharsUseBtn?.addEventListener("click", () => {
    const activeCard = els.charCards?.find((card) =>
      card.classList.contains("active"),
    );

    if (!activeCard) {
      showBattleToast("Select a character first.");
      return;
    }

    const selectedName = String(activeCard.dataset.charName || "Joseph").trim();
    const selectedImage = String(
      activeCard.dataset.charImage || "/assets/avatars/avatar-01.png",
    ).trim();

    if (els.battleProfileAvatar) {
      els.battleProfileAvatar.src = appendAvatarBust(selectedImage);
    }

    if (els.battleProfileMiniAvatar) {
      els.battleProfileMiniAvatar.src = appendAvatarBust(selectedImage);
    }

    if (els.battleHeroName) {
      els.battleHeroName.textContent = selectedName;
    }

    if (els.battlePlayerName) {
      els.battlePlayerName.textContent = selectedName;
    }

    showBattleToast(`${selectedName} selected.`);
    closeCharsOverlay(els);
  });

  els.battleNavRewardsBtn?.addEventListener("click", () => {
    openRewardsOverlay(els, state);
  });

  els.battleRewardsBackBtn?.addEventListener("click", () => {
    closeRewardsOverlay(els);
  });

  els.battleRewardsOverlay?.addEventListener("click", (event) => {
    if (
      event.target === els.battleRewardsOverlay ||
      event.target.classList.contains("battle-rewards-backdrop")
    ) {
      closeRewardsOverlay(els);
    }
  });

  els.battleRewardsSpinBtn?.addEventListener("click", () => {
    spinSelectedRoyale(els, state);
  });

  els.battleRewardsBuyBundleBtn?.addEventListener("click", () => {
    buySelectedRoyaleBundle(els, state);
  });

  els.battleRewardsEquipBtn?.addEventListener("click", () => {
    equipLastReward(els, state);
  });

  els.createRoomBtn?.addEventListener("click", () => {
    openCreateRoomModal(els);
  });

  els.startSelectedBattleBtn?.addEventListener("click", () => {
    openCreateRoomModal(els);
  });

  els.joinRoomBtn?.addEventListener("click", () => {
    openJoinRoomModal(els);
  });

  els.closeCreateRoomModalBtn?.addEventListener("click", () => {
    closeCreateRoomModal(els);
  });

  els.closeJoinRoomModalBtn?.addEventListener("click", () => {
    closeJoinRoomModal(els);
  });

  els.confirmJoinRoomBtn?.addEventListener("click", () => {
    confirmJoinRoom(els);
  });

  els.battleJoinRoomCodeInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmJoinRoom(els);
    }
  });

  els.createRoomModal?.addEventListener("click", (event) => {
    if (
      event.target === els.createRoomModal ||
      event.target.classList.contains("battle-modal-backdrop")
    ) {
      closeCreateRoomModal(els);
    }
  });

  els.joinRoomModal?.addEventListener("click", (event) => {
    if (
      event.target === els.joinRoomModal ||
      event.target.classList.contains("battle-modal-backdrop")
    ) {
      closeJoinRoomModal(els);
    }
  });

  els.battleModeSelect?.addEventListener("change", () => {
    state.selectedMode = els.battleModeSelect.value || "normal-dual";
    state.selectedModeLabel = formatModeLabel(state.selectedMode);
    state.selectedTimerLabel = getTimerLabelForMode(state.selectedMode);
    syncModeCardsFromState(els, state);
    applySelectionToUi(els, state);
  });

  els.battleSubjectSelect?.addEventListener("change", () => {
    state.selectedSubject = els.battleSubjectSelect.value || "physics";
    safeLocalSet(BATTLE_LAST_SUBJECT_KEY, state.selectedSubject);

    fillTopicOptions(state.selectedSubject, els.battleTopicSelect);
    state.selectedTopic = els.battleTopicSelect?.value || "";
    safeLocalSet(
      `${BATTLE_LAST_TOPIC_PREFIX}${state.selectedSubject}`,
      state.selectedTopic,
    );

    fillSubtopicOptions(
      state.selectedSubject,
      state.selectedTopic,
      els.battleSubtopicSelect,
    );
    state.selectedSubtopic = els.battleSubtopicSelect?.value || "";

    if (state.selectedTopic && state.selectedSubtopic) {
      safeLocalSet(
        `${BATTLE_LAST_SUBTOPIC_PREFIX}${state.selectedSubject}_${state.selectedTopic}`,
        state.selectedSubtopic,
      );
    }

    applySelectionToUi(els, state);
  });

  els.battleTopicSelect?.addEventListener("change", () => {
    state.selectedTopic = els.battleTopicSelect?.value || "";
    safeLocalSet(
      `${BATTLE_LAST_TOPIC_PREFIX}${state.selectedSubject}`,
      state.selectedTopic,
    );

    fillSubtopicOptions(
      state.selectedSubject,
      state.selectedTopic,
      els.battleSubtopicSelect,
    );
    state.selectedSubtopic = els.battleSubtopicSelect?.value || "";

    if (state.selectedTopic && state.selectedSubtopic) {
      safeLocalSet(
        `${BATTLE_LAST_SUBTOPIC_PREFIX}${state.selectedSubject}_${state.selectedTopic}`,
        state.selectedSubtopic,
      );
    }

    applySelectionToUi(els, state);
  });

  els.battleSubtopicSelect?.addEventListener("change", () => {
    state.selectedSubtopic = els.battleSubtopicSelect?.value || "";

    if (state.selectedTopic && state.selectedSubtopic) {
      safeLocalSet(
        `${BATTLE_LAST_SUBTOPIC_PREFIX}${state.selectedSubject}_${state.selectedTopic}`,
        state.selectedSubtopic,
      );
    }

    applySelectionToUi(els, state);
  });

  els.confirmCreateRoomBtn?.addEventListener("click", () => {
    const mode = String(
      els.battleModeSelect?.value || state.selectedMode || "",
    ).trim();
    const subject = String(
      els.battleSubjectSelect?.value || state.selectedSubject || "",
    ).trim();
    const topic = String(
      els.battleTopicSelect?.value || state.selectedTopic || "",
    ).trim();
    const subtopic = String(
      els.battleSubtopicSelect?.value || state.selectedSubtopic || "",
    ).trim();

    if (!mode) {
      showBattleToast("Select a battle mode.");
      els.battleModeSelect?.focus();
      return;
    }

    if (!subject) {
      showBattleToast("Select a subject.");
      els.battleSubjectSelect?.focus();
      return;
    }

    if (!topic) {
      showBattleToast("Select a topic.");
      els.battleTopicSelect?.focus();
      return;
    }

    if (!subtopic) {
      showBattleToast("Select a subtopic.");
      els.battleSubtopicSelect?.focus();
      return;
    }

    state.selectedMode = mode;
    state.selectedModeLabel = formatModeLabel(mode);
    state.selectedTimerLabel = getTimerLabelForMode(mode);
    state.selectedSubject = subject;
    state.selectedTopic = topic;
    state.selectedSubtopic = subtopic;

    safeLocalSet(BATTLE_LAST_SUBJECT_KEY, subject);
    safeLocalSet(`${BATTLE_LAST_TOPIC_PREFIX}${subject}`, topic);
    safeLocalSet(`${BATTLE_LAST_SUBTOPIC_PREFIX}${subject}_${topic}`, subtopic);

    const roomCode = generateRoomCode();
    safeLocalSet(BATTLE_LAST_ROOM_KEY, roomCode);

    const params = new URLSearchParams({
      room: roomCode,
      owner: "1",
      mode,
      subject,
      topic,
      subtopic,
    });

    window.location.href = `${BATTLE_APP_PATH}/quiz-battle/lobby.html?${params.toString()}`;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCreateRoomModal(els);
      closeJoinRoomModal(els);
      closeCharsOverlay(els);
      closeSummaryOverlay(els);
      closeRewardsOverlay(els);
      closeCustomizeDrawer(els);
      hideRotateNotice(els);
    }
  });

  hideRightPanels(els);
  showCustomizePane(els, "backgrounds");

  if (els.charCards?.length) {
    const activeChar =
      els.charCards.find((card) => card.classList.contains("active")) ||
      els.charCards[0];
    applySelectedCharToOverlay(els, activeChar);
  }

  const stageCards = document.querySelectorAll("[data-stage-id]");

  stageCards.forEach((card) => {
    card.addEventListener("click", () => {
      const stageId = card.dataset.stageId;

      state.customize.activeStageId = stageId;
      persistCustomizeState(state);
      applyCustomizeStateToUi(els, state);

      stageCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

function buildInitialCustomizeState() {
  const raw = safeParseLocal(BATTLE_CUSTOMIZE_STATE_KEY) || {};

  return {
    activeBackgroundId:
      typeof raw.activeBackgroundId === "string" &&
      BATTLE_BACKGROUNDS[raw.activeBackgroundId]
        ? raw.activeBackgroundId
        : "bg1",

    activeStageId:
      typeof raw.activeStageId === "string" ? raw.activeStageId : "stage1",
  };
}

function persistCustomizeState(state) {
  safeLocalSet(
    BATTLE_CUSTOMIZE_STATE_KEY,
    JSON.stringify({
      activeBackgroundId: state.customize.activeBackgroundId,
      activeStageId: state.customize.activeStageId,
    }),
  );
}

function applyCustomizeStateToUi(els, state) {
  const bg =
    BATTLE_BACKGROUNDS[state.customize.activeBackgroundId] ||
    BATTLE_BACKGROUNDS.bg1;

  if (els.battleCinematicBg) {
    els.battleCinematicBg.style.setProperty(
      "--battle-active-bg",
      `url("${bg.image}")`,
    );
  }

  els.customizeBackgroundCards?.forEach((card) => {
    const isActive = card.dataset.bgId === bg.id;
    card.classList.toggle("active", isActive);
  });

  document.body.classList.remove(
    "stage1",
    "stage2",
    "stage3",
    "stage4",
    "stage5",
  );

  document.body.classList.add(state.customize.activeStageId);
}

function openSummaryOverlay(els, state) {
  hideRightPanels(els);
  closeCreateRoomModal(els);
  closeJoinRoomModal(els);
  closeCharsOverlay(els);
  closeRewardsOverlay(els);
  closeCustomizeDrawer(els);

  if (els.battleSummaryMode) {
    els.battleSummaryMode.textContent = state.selectedModeLabel || "Normal Duel";
  }

  if (els.battleSummarySubject) {
    els.battleSummarySubject.textContent =
      BATTLE_SUBJECT_DATA[state.selectedSubject]?.label ||
      prettifySlug(state.selectedSubject || "physics");
  }

  const topicData = getTopicData(state.selectedSubject, state.selectedTopic);

  if (els.battleSummaryTopic) {
    els.battleSummaryTopic.textContent =
      topicData?.title || prettifySlug(state.selectedTopic || "units");
  }

  const subtopicData = (topicData?.subtopics || []).find(
    (item) => item.slug === state.selectedSubtopic
  );

  if (els.battleSummarySubtopic) {
    els.battleSummarySubtopic.textContent =
      subtopicData?.title || prettifySlug(state.selectedSubtopic || "unit-dimensions");
  }

  els.battleSummaryOverlay?.classList.remove("hidden");
  els.battleSummaryOverlay?.setAttribute("aria-hidden", "false");
  els.battleNavSummaryBtn?.classList.add("active");
}

function closeSummaryOverlay(els) {
  els.battleSummaryOverlay?.classList.add("hidden");
  els.battleSummaryOverlay?.setAttribute("aria-hidden", "true");
  els.battleNavSummaryBtn?.classList.remove("active");
}

function openCustomizeDrawer(els) {
  hideRightPanels(els);
  closeCreateRoomModal(els);
  closeJoinRoomModal(els);
  closeCharsOverlay(els);
  closeSummaryOverlay(els);
  closeRewardsOverlay(els);

  els.battleCustomizeDrawer?.classList.add("is-open");
  els.battleCustomizeDrawer?.setAttribute("aria-hidden", "false");
}

function closeCustomizeDrawer(els) {
  els.battleCustomizeDrawer?.classList.remove("is-open");
  els.battleCustomizeDrawer?.setAttribute("aria-hidden", "true");
}

function showCustomizePane(els, paneName = "backgrounds") {
  const showBackgrounds = paneName === "backgrounds";
  const showStages = paneName === "stages";

  els.battleCustomizeTabBackgrounds?.classList.toggle(
    "is-active",
    showBackgrounds,
  );
  els.battleCustomizeTabStages?.classList.toggle("is-active", showStages);

  els.battleCustomizeBackgroundsPane?.classList.toggle(
    "is-active",
    showBackgrounds,
  );
  els.battleCustomizeStagesPane?.classList.toggle("is-active", showStages);

  if (els.battleCustomizeBackgroundsPane) {
    els.battleCustomizeBackgroundsPane.hidden = !showBackgrounds;
  }

  if (els.battleCustomizeStagesPane) {
    els.battleCustomizeStagesPane.hidden = !showStages;
  }
}

function closeAllPopupsOnly(els) {
  closeCreateRoomModal(els);
  closeJoinRoomModal(els);
  closeCharsOverlay(els);
  closeSummaryOverlay(els);
  closeRewardsOverlay(els);
  closeCustomizeDrawer(els);
}

function showRightPanel(els, panelName = "modes") {
  const showModes = panelName === "modes";
  const showFriends = panelName === "friends";
  const showHistory = panelName === "history";

  closeAllPopupsOnly(els);

  els.battleModePanel?.classList.toggle("is-active", showModes);
  els.battleModePanel?.classList.toggle("hidden-panel", !showModes);

  els.battleFriendsPanel?.classList.toggle("is-active", showFriends);
  els.battleFriendsPanel?.classList.toggle("hidden-panel", !showFriends);

  els.battleHistoryPanel?.classList.toggle("is-active", showHistory);
  els.battleHistoryPanel?.classList.toggle("hidden-panel", !showHistory);

  els.battleNavLobbyBtn?.classList.toggle("active", showModes);
  els.battleNavFriendsBtn?.classList.toggle("active", showFriends);
  els.battleNavHistoryBtn?.classList.toggle("active", showHistory);
}

function hideRightPanels(els) {
  els.battleModePanel?.classList.remove("is-active");
  els.battleModePanel?.classList.add("hidden-panel");

  els.battleFriendsPanel?.classList.remove("is-active");
  els.battleFriendsPanel?.classList.add("hidden-panel");

  els.battleHistoryPanel?.classList.remove("is-active");
  els.battleHistoryPanel?.classList.add("hidden-panel");

  els.battleNavLobbyBtn?.classList.remove("active");
  els.battleNavFriendsBtn?.classList.remove("active");
  els.battleNavHistoryBtn?.classList.remove("active");
}

function toggleRightPanel(els, panelName = "modes") {
  const panelMap = {
    modes: els.battleModePanel,
    friends: els.battleFriendsPanel,
    history: els.battleHistoryPanel,
  };

  const panel = panelMap[panelName];

  if (panel?.classList.contains("is-active")) {
    hideRightPanels(els);
    return;
  }

  showRightPanel(els, panelName);
}

function openCharsOverlay(els) {
  els.battleRewardsOverlay?.classList.add("hidden");
  els.battleRewardsOverlay?.setAttribute("aria-hidden", "true");

  els.battleCharsOverlay?.classList.remove("hidden");
  els.battleCharsOverlay?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCharsOverlay(els) {
  els.battleCharsOverlay?.classList.add("hidden");
  els.battleCharsOverlay?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function applySelectedCharToOverlay(els, button) {
  if (!button) return;

  const charName = String(button.dataset.charName || "Joseph").trim();
  const charRole = String(button.dataset.charRole || "Silver Spawn").trim();
  const charBio = String(
    button.dataset.charBio ||
      "A balanced battle character with sharp presence and a premium lobby look.",
  ).trim();
  const charImage = String(
    button.dataset.charImage || "/assets/avatars/avatar-01.png",
  ).trim();

  els.charCards?.forEach((card) => card.classList.remove("active"));
  button.classList.add("active");

  if (els.battleCharsTitle) {
    els.battleCharsTitle.textContent = charName;
  }

  if (els.battleCharsRoleBadge) {
    els.battleCharsRoleBadge.textContent = charRole;
  }

  if (els.battleCharsBio) {
    els.battleCharsBio.textContent = charBio;
  }

  if (els.battleCharsPreviewImage) {
    els.battleCharsPreviewImage.src = charImage;
    els.battleCharsPreviewImage.alt = charName;
  }
}

function buildInitialRewardsState(defaultMainTokens = 3) {
  const raw = safeParseLocal(BATTLE_REWARDS_STATE_KEY) || {};

  const validRoyaleIds = new Set(BATTLE_REWARDS_CONFIG.map((item) => item.id));
  const selectedRoyaleId = validRoyaleIds.has(raw.selectedRoyaleId)
    ? raw.selectedRoyaleId
    : BATTLE_REWARDS_CONFIG[0].id;

  const mainTokens = Number.isFinite(Number(raw.mainTokens))
    ? Math.max(0, Math.floor(Number(raw.mainTokens)))
    : Math.max(0, Math.floor(Number(defaultMainTokens) || 0));

  const royaleTokens = {};
  const ownedRewards = {};
  const lastRewardByRoyale = {};
  const wheelRotationByRoyale = {};

  BATTLE_REWARDS_CONFIG.forEach((royale) => {
    royaleTokens[royale.id] = Number.isFinite(
      Number(raw.royaleTokens?.[royale.id]),
    )
      ? Math.max(0, Math.floor(Number(raw.royaleTokens[royale.id])))
      : 0;

    lastRewardByRoyale[royale.id] =
      typeof raw.lastRewardByRoyale?.[royale.id] === "string"
        ? raw.lastRewardByRoyale[royale.id]
        : royale.rewards[0]?.name || "Reward";

    wheelRotationByRoyale[royale.id] = Number.isFinite(
      Number(raw.wheelRotationByRoyale?.[royale.id]),
    )
      ? Number(raw.wheelRotationByRoyale[royale.id])
      : 0;

    royale.rewards.forEach((reward) => {
      ownedRewards[reward.id] = Number.isFinite(
        Number(raw.ownedRewards?.[reward.id]),
      )
        ? Math.max(0, Math.floor(Number(raw.ownedRewards[reward.id])))
        : 0;
    });
  });

  const recentRewards = Array.isArray(raw.recentRewards)
    ? raw.recentRewards.slice(0, 12)
    : [];

  return {
    selectedRoyaleId,
    mainTokens,
    royaleTokens,
    ownedRewards,
    lastRewardByRoyale,
    wheelRotationByRoyale,
    recentRewards,
    isSpinning: false,
  };
}

function persistRewardsState(state) {
  const payload = {
    selectedRoyaleId: state.rewards.selectedRoyaleId,
    mainTokens: state.mainTokens,
    royaleTokens: state.rewards.royaleTokens,
    ownedRewards: state.rewards.ownedRewards,
    lastRewardByRoyale: state.rewards.lastRewardByRoyale,
    wheelRotationByRoyale: state.rewards.wheelRotationByRoyale,
    recentRewards: state.rewards.recentRewards,
  };

  safeLocalSet(BATTLE_REWARDS_STATE_KEY, JSON.stringify(payload));
  safeLocalSet(BATTLE_MAIN_TOKENS_KEY, String(state.mainTokens));
}

function getRewardsConfigById(royaleId) {
  return (
    BATTLE_REWARDS_CONFIG.find((item) => item.id === royaleId) ||
    BATTLE_REWARDS_CONFIG[0]
  );
}

function initRewardsUi(els, state) {
  renderRewardsTypeList(els, state);
  renderRewardsPanel(els, state);
  renderRewardsHistory(els, state);
  syncMainTokenUi(els, state);
}

function syncMainTokenUi(els, state) {
  const tokenText = `${state.mainTokens} DN Tokens`;

  if (els.battleTokenCount) {
    els.battleTokenCount.textContent = tokenText;
  }

  if (els.battleRewardsMainTokenText) {
    els.battleRewardsMainTokenText.textContent = tokenText;
  }
}

function renderRewardsTypeList(els, state) {
  if (!els.battleRewardsTypeList) return;

  els.battleRewardsTypeList.innerHTML = "";

  BATTLE_REWARDS_CONFIG.forEach((royale) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `battle-rewards-type-card${
      state.rewards.selectedRoyaleId === royale.id ? " active" : ""
    }`;

    button.innerHTML = `
      <div class="battle-rewards-type-icon">${royale.icon}</div>
      <div class="battle-rewards-type-meta">
        <strong>${royale.name}</strong>
        <span>${royale.bundleQty} tokens • ${royale.bundleCostMain} DN</span>
      </div>
    `;

    button.addEventListener("click", () => {
      if (state.rewards.isSpinning) return;
      state.rewards.selectedRoyaleId = royale.id;
      persistRewardsState(state);
      renderRewardsTypeList(els, state);
      renderRewardsPanel(els, state);
      renderRewardsHistory(els, state);
    });

    els.battleRewardsTypeList.appendChild(button);
  });
}

function renderRewardsPanel(els, state) {
  const royale = getRewardsConfigById(state.rewards.selectedRoyaleId);
  const lastRewardName =
    state.rewards.lastRewardByRoyale[royale.id] ||
    royale.rewards[0]?.name ||
    "Reward";

  const lastReward =
    royale.rewards.find((item) => item.name === lastRewardName) ||
    royale.rewards[0];

  if (els.battleRewardsTag) {
    els.battleRewardsTag.textContent = royale.tag;
  }

  if (els.battleRewardsTitle) {
    els.battleRewardsTitle.textContent = royale.name;
  }

  if (els.battleRewardsDesc) {
    els.battleRewardsDesc.textContent = royale.description;
  }

  if (els.battleRewardsWheelTitle) {
    els.battleRewardsWheelTitle.textContent = `${royale.name} Wheel`;
  }

  if (els.battleRewardsCostText) {
    els.battleRewardsCostText.textContent = `Spin: ${royale.spinCostRoyale} Royale Token • Bundle: ${royale.bundleCostMain} DN / ${royale.bundleQty}`;
  }

  if (els.battleRewardsSelectedRoyaleName) {
    els.battleRewardsSelectedRoyaleName.textContent = royale.name;
  }

  if (els.battleRewardsPoolCount) {
    els.battleRewardsPoolCount.textContent = `${royale.rewards.length} Rewards`;
  }

  if (els.battleRewardsRoyaleTokenText) {
    els.battleRewardsRoyaleTokenText.textContent = String(
      state.rewards.royaleTokens[royale.id] || 0,
    );
  }

  if (els.battleRewardsPreviewName) {
    els.battleRewardsPreviewName.textContent = lastReward?.name || "Reward";
  }

  if (els.battleRewardsPreviewGlow) {
    els.battleRewardsPreviewGlow.style.background = `radial-gradient(circle, ${
      lastReward?.previewGlow || "rgba(66, 168, 255, 0.24)"
    }, transparent 72%)`;
  }

  if (els.battleRewardsBuyBundleBtn) {
    els.battleRewardsBuyBundleBtn.textContent = `Buy ${royale.bundleQty} Tokens`;
  }

  renderRewardsWheel(els, state, royale);
  syncMainTokenUi(els, state);
}

function renderRewardsWheel(els, state, royale) {
  if (!els.battleRewardsWheel) return;

  const rewards = royale.rewards;
  const total = rewards.length;
  const step = 360 / total;
  const rotation = state.rewards.wheelRotationByRoyale[royale.id] || 0;

  els.battleRewardsWheel.innerHTML = "";

  rewards.forEach((reward, index) => {
    const label = document.createElement("div");
    const angle = index * step + step / 2;

    label.textContent = reward.name;
    label.style.position = "absolute";
    label.style.left = "50%";
    label.style.top = "50%";
    label.style.width = "120px";
    label.style.marginLeft = "-60px";
    label.style.transformOrigin = "center -130px";
    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    label.style.textAlign = "center";
    label.style.fontSize = "11px";
    label.style.fontWeight = "900";
    label.style.color = "#ffffff";
    label.style.textShadow = "0 1px 4px rgba(0,0,0,0.35)";
    label.style.pointerEvents = "none";
    label.style.zIndex = "1";

    els.battleRewardsWheel.appendChild(label);
  });

  els.battleRewardsWheel.style.transform = `rotate(${rotation}deg)`;
}

function renderRewardsHistory(els, state) {
  if (!els.battleRewardsHistory) return;

  els.battleRewardsHistory.innerHTML = "";

  const items = state.rewards.recentRewards.slice(0, 8);

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "battle-rewards-history-item";
    empty.innerHTML = `<strong>No spins yet</strong><span>Your rewards will appear here.</span>`;
    els.battleRewardsHistory.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "battle-rewards-history-item";
    card.innerHTML = `
      <strong>${item.rewardName}</strong>
      <span>${item.royaleName}</span>
    `;
    els.battleRewardsHistory.appendChild(card);
  });
}

function openRewardsOverlay(els, state) {
  hideRightPanels(els);
  closeCreateRoomModal(els);
  closeJoinRoomModal(els);
  closeCharsOverlay(els);
  closeSummaryOverlay(els);
  closeCustomizeDrawer(els);

  els.battleRewardsOverlay?.classList.remove("hidden");
  els.battleRewardsOverlay?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  els.battleNavRewardsBtn?.classList.add("active");
  renderRewardsTypeList(els, state);
  renderRewardsPanel(els, state);
  renderRewardsHistory(els, state);
}

function closeRewardsOverlay(els) {
  els.battleRewardsOverlay?.classList.add("hidden");
  els.battleRewardsOverlay?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  els.battleNavRewardsBtn?.classList.remove("active");
}

function buySelectedRoyaleBundle(els, state) {
  const royale = getRewardsConfigById(state.rewards.selectedRoyaleId);

  if (state.mainTokens < royale.bundleCostMain) {
    showBattleToast("Not enough DN Tokens.");
    return;
  }

  state.mainTokens -= royale.bundleCostMain;
  state.rewards.mainTokens = state.mainTokens;
  state.rewards.royaleTokens[royale.id] =
    (state.rewards.royaleTokens[royale.id] || 0) + royale.bundleQty;

  persistRewardsState(state);
  syncMainTokenUi(els, state);
  renderRewardsPanel(els, state);
  showBattleToast(`${royale.bundleQty} ${royale.name} tokens purchased.`);
}

function spinSelectedRoyale(els, state) {
  const royale = getRewardsConfigById(state.rewards.selectedRoyaleId);

  if (state.rewards.isSpinning) return;

  const currentRoyaleTokens = state.rewards.royaleTokens[royale.id] || 0;
  if (currentRoyaleTokens < royale.spinCostRoyale) {
    showBattleToast("Buy royale tokens first.");
    return;
  }

  state.rewards.royaleTokens[royale.id] =
    currentRoyaleTokens - royale.spinCostRoyale;
  state.rewards.isSpinning = true;

  if (els.battleRewardsSpinBtn) {
    els.battleRewardsSpinBtn.disabled = true;
  }

  renderRewardsPanel(els, state);

  const reward = pickWeightedReward(royale.rewards);
  const winnerIndex = royale.rewards.findIndex((item) => item.id === reward.id);
  const step = 360 / royale.rewards.length;
  const landingAngle = 360 - (winnerIndex * step + step / 2);
  const currentRotation = state.rewards.wheelRotationByRoyale[royale.id] || 0;
  const finalRotation = currentRotation + 360 * 5 + landingAngle;

  state.rewards.wheelRotationByRoyale[royale.id] = finalRotation;

  if (els.battleRewardsWheel) {
    els.battleRewardsWheel.style.transform = `rotate(${finalRotation}deg)`;
  }

  setTimeout(() => {
    awardReward(els, state, royale, reward);

    state.rewards.isSpinning = false;
    if (els.battleRewardsSpinBtn) {
      els.battleRewardsSpinBtn.disabled = false;
    }

    persistRewardsState(state);
    renderRewardsTypeList(els, state);
    renderRewardsPanel(els, state);
    renderRewardsHistory(els, state);
  }, 4200);
}

function awardReward(els, state, royale, reward) {
  if (Array.isArray(reward.grantRoyaleTokens)) {
    reward.grantRoyaleTokens.forEach((entry) => {
      if (!entry?.royaleId) return;
      state.rewards.royaleTokens[entry.royaleId] =
        (state.rewards.royaleTokens[entry.royaleId] || 0) +
        Number(entry.amount || 0);
    });
  } else {
    state.rewards.ownedRewards[reward.id] =
      (state.rewards.ownedRewards[reward.id] || 0) + 1;
  }

  state.rewards.lastRewardByRoyale[royale.id] = reward.name;
  state.rewards.recentRewards.unshift({
    rewardName: reward.name,
    royaleName: royale.name,
    at: Date.now(),
  });
  state.rewards.recentRewards = state.rewards.recentRewards.slice(0, 10);

  syncMainTokenUi(els, state);
  showBattleToast(`You won ${reward.name}!`);
}

function equipLastReward(els, state) {
  const royale = getRewardsConfigById(state.rewards.selectedRoyaleId);
  const rewardName =
    state.rewards.lastRewardByRoyale[royale.id] ||
    royale.rewards[0]?.name ||
    "Reward";

  showBattleToast(`${rewardName} equipped.`);
}

function pickWeightedReward(rewards) {
  const totalWeight = rewards.reduce(
    (sum, item) => sum + Math.max(0, Number(item.weight) || 0),
    0,
  );

  if (totalWeight <= 0) {
    return rewards[0];
  }

  let roll = Math.random() * totalWeight;

  for (const reward of rewards) {
    roll -= Math.max(0, Number(reward.weight) || 0);
    if (roll <= 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

function applyProfileToUi(els, state) {
  const profile = state.profile;
  const defaultCharacterImage = "/assets/characters/char_01_sword_boy.png";

  if (els.battleProfileAvatar) {
    els.battleProfileAvatar.src = defaultCharacterImage;
  }

  if (els.battleProfileMiniAvatar) {
    els.battleProfileMiniAvatar.src = defaultCharacterImage;
  }

  if (els.battleProfileNameCard) {
    els.battleProfileNameCard.textContent = profile.displayName;
  }

  if (els.battleHeroName) {
    els.battleHeroName.textContent = profile.displayName;
  }

  if (els.battleHeroSubline) {
    els.battleHeroSubline.textContent = profile.heroSubline;
  }

  if (els.battlePlayerName) {
    els.battlePlayerName.textContent = profile.displayName;
  }

  if (els.battlePlayerLevel) {
    els.battlePlayerLevel.textContent = String(profile.level);
  }

  if (els.battleRoleLabel) {
    els.battleRoleLabel.textContent = "HOST";
  }

  if (els.battleTokenCount) {
    els.battleTokenCount.textContent = `${state.mainTokens} DN Tokens`;
  }

  if (els.battleArenaLabel) {
    els.battleArenaLabel.textContent = profile.arenaLabel;
  }

  if (els.battleSaveLabel) {
    els.battleSaveLabel.textContent = profile.saveLabel;
  }
}

function hydrateCreateRoomSelectors(els, state) {
  if (els.battleModeSelect) {
    els.battleModeSelect.value = state.selectedMode;
  }

  if (els.battleSubjectSelect) {
    els.battleSubjectSelect.value = state.selectedSubject;
  }

  fillTopicOptions(state.selectedSubject, els.battleTopicSelect);

  if (
    els.battleTopicSelect &&
    optionExists(els.battleTopicSelect, state.selectedTopic)
  ) {
    els.battleTopicSelect.value = state.selectedTopic;
  }

  fillSubtopicOptions(
    state.selectedSubject,
    state.selectedTopic,
    els.battleSubtopicSelect,
  );

  if (
    els.battleSubtopicSelect &&
    optionExists(els.battleSubtopicSelect, state.selectedSubtopic)
  ) {
    els.battleSubtopicSelect.value = state.selectedSubtopic;
  }

  syncModeCardsFromState(els, state);
}

function applySelectionToUi(els, state) {
  const subjectLabel =
    BATTLE_SUBJECT_DATA[state.selectedSubject]?.label ||
    prettifySlug(state.selectedSubject || "physics");

  const topicLabel =
    getTopicData(state.selectedSubject, state.selectedTopic)?.title ||
    prettifySlug(state.selectedTopic || "units");

  const subtopicLabel =
    getSubtopicData(
      state.selectedSubject,
      state.selectedTopic,
      state.selectedSubtopic,
    )?.title || prettifySlug(state.selectedSubtopic || "unit-dimensions");

  if (els.battleSelectedModeText) {
    els.battleSelectedModeText.textContent = state.selectedModeLabel;
  }

  if (els.battleInfoSubject) {
    els.battleInfoSubject.textContent = subjectLabel;
  }

  if (els.battleInfoTopic) {
    els.battleInfoTopic.textContent = topicLabel;
  }

  if (els.battleInfoSubtopic) {
    els.battleInfoSubtopic.textContent = subtopicLabel;
  }

  if (els.battleInfoTimer) {
    els.battleInfoTimer.textContent = state.selectedTimerLabel.replace(
      /^Timer:\s*/i,
      "",
    );
  }


  if (els.battleLiveSummaryTitle) {
    els.battleLiveSummaryTitle.textContent = state.selectedModeLabel || "Normal Duel";
  }

  if (els.battleLiveSummarySubline) {
    els.battleLiveSummarySubline.textContent =
      `${subjectLabel} • ${topicLabel} • ${subtopicLabel}`;
  }

  if (els.battleLiveSummaryMode) {
    els.battleLiveSummaryMode.textContent = state.selectedModeLabel || "Normal Duel";
  }

  if (els.battleLiveSummarySubject) {
    els.battleLiveSummarySubject.textContent = subjectLabel;
  }

  if (els.battleLiveSummaryTopic) {
    els.battleLiveSummaryTopic.textContent = topicLabel;
  }

  if (els.battleLiveSummarySubtopic) {
    els.battleLiveSummarySubtopic.textContent = subtopicLabel;
  }   
}

function syncModeCardsFromState(els, state) {
  els.modeOptions.forEach((button) => {
    const isActive = button.dataset.mode === state.selectedMode;
    button.classList.toggle("active", isActive);
  });
}

function initRotateNotice(els) {
  const check = () => {
    const isMobile = window.matchMedia("(max-width: 932px)").matches;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const shouldShow = isMobile && isPortrait;

    if (!els.rotateNotice) return;

    els.rotateNotice.classList.toggle("hidden", !shouldShow);
    els.rotateNotice.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  };

  window.addEventListener("resize", check);
  window.addEventListener("orientationchange", check);
  check();
}

function hideRotateNotice(els) {
  els.rotateNotice?.classList.add("hidden");
  els.rotateNotice?.setAttribute("aria-hidden", "true");
}

async function tryLandscapeLock() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === "function") {
      await screen.orientation.lock("landscape");
    }
  } catch (error) {
    console.warn("Landscape lock not supported:", error);
  }
}

function openJoinRoomModal(els) {
  hideRightPanels(els);
  closeCreateRoomModal(els);
  closeCharsOverlay(els);
  closeSummaryOverlay(els);
  closeRewardsOverlay(els);
  closeCustomizeDrawer(els);

  if (els.battleJoinRoomCodeInput) {
    els.battleJoinRoomCodeInput.value = safeLocalGet(BATTLE_LAST_ROOM_KEY) || "";
  }

  els.joinRoomModal?.classList.remove("hidden");
  els.joinRoomModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => els.battleJoinRoomCodeInput?.focus(), 60);
}

function closeJoinRoomModal(els) {
  els.joinRoomModal?.classList.add("hidden");
  els.joinRoomModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function confirmJoinRoom(els) {
  const roomCode = normalizeRoomCode(els.battleJoinRoomCodeInput?.value || "");

  if (!roomCode) {
    showBattleToast("Enter a valid room code.");
    els.battleJoinRoomCodeInput?.focus();
    return;
  }

  safeLocalSet(BATTLE_LAST_ROOM_KEY, roomCode);
  window.location.href = `${BATTLE_APP_PATH}/quiz-battle/lobby.html?room=${encodeURIComponent(roomCode)}`;
}

function openCreateRoomModal(els) {
  hideRightPanels(els);
  closeJoinRoomModal(els);
  closeCharsOverlay(els);
  closeSummaryOverlay(els);
  closeRewardsOverlay(els);
  closeCustomizeDrawer(els);

  els.createRoomModal?.classList.remove("hidden");
  els.createRoomModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => els.battleModeSelect?.focus(), 60);
}

function closeCreateRoomModal(els) {
  els.createRoomModal?.classList.add("hidden");
  els.createRoomModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function fillTopicOptions(subject, selectEl) {
  if (!selectEl) return;

  const topics = BATTLE_SUBJECT_DATA[subject]?.topics || [];
  selectEl.innerHTML = `<option value="">Select topic</option>`;

  topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic.slug;
    option.textContent = topic.title;
    selectEl.appendChild(option);
  });

  if (topics.length > 0) {
    selectEl.value = topics[0].slug;
  }
}

function fillSubtopicOptions(subject, topicSlug, selectEl) {
  if (!selectEl) return;

  const topic = getTopicData(subject, topicSlug);
  const subtopics = topic?.subtopics || [];
  selectEl.innerHTML = `<option value="">Select subtopic</option>`;

  subtopics.forEach((subtopic) => {
    const option = document.createElement("option");
    option.value = subtopic.slug;
    option.textContent = subtopic.title;
    selectEl.appendChild(option);
  });

  if (subtopics.length > 0) {
    selectEl.value = subtopics[0].slug;
  }
}

function getTopicData(subject, topicSlug) {
  const topics = BATTLE_SUBJECT_DATA[subject]?.topics || [];
  return topics.find((item) => item.slug === topicSlug) || null;
}

function optionExists(selectEl, value) {
  if (!selectEl || !value) return false;
  return Array.from(selectEl.options).some((option) => option.value === value);
}

function getBattlePlayerProfile() {
  const firebaseUser = window.firebaseAuth?.currentUser || null;
  const cachedProfile = safeParseLocal("dn_profile");
  const appMode = safeLocalGet("dn_app_mode") || "guest";

  if (firebaseUser?.uid) {
    const displayName =
      cachedProfile?.name || firebaseUser.email?.split("@")[0] || "DN Player";

    return {
      playerId: firebaseUser.uid,
      displayName,
      avatarUrl:
        cachedProfile?.profile_photo_url || "/assets/avatars/avatar-01.png",
      heroSubline: "LEVEL 12",
      playerTag: firebaseUser.email || "account_battle_user",
      level: 12,
      tokens: 3,
      arenaLabel: "Premium Arena",
      saveLabel: "Cloud Ready",
    };
  }

  const guestId = ensureGuestBattleId();
  const guestName =
    safeLocalGet(BATTLE_GUEST_NAME_KEY) ||
    cachedProfile?.name ||
    "Guest Player";

  if (!safeLocalGet(BATTLE_GUEST_NAME_KEY)) {
    safeLocalSet(BATTLE_GUEST_NAME_KEY, guestName);
  }

  return {
    playerId: guestId,
    displayName: guestName,
    avatarUrl:
      cachedProfile?.profile_photo_url || "/assets/avatars/avatar-01.png",
    heroSubline: "LEVEL 12",
    playerTag: `guest_quiz_battle_${guestId.slice(-7)}`,
    level: 12,
    tokens: 3,
    arenaLabel: appMode === "guest" ? "Guest Arena" : "Local Arena",
    saveLabel: appMode === "guest" ? "Local Only" : "Local Sync",
  };
}

function ensureGuestBattleId() {
  let guestId = safeLocalGet(BATTLE_GUEST_ID_KEY);
  if (guestId) return guestId;

  guestId = `guest_${generateToken(12)}`;
  safeLocalSet(BATTLE_GUEST_ID_KEY, guestId);
  return guestId;
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";

  for (let i = 0; i < 6; i += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return output;
}

function normalizeRoomCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

function formatModeLabel(mode) {
  const value = String(mode || "")
    .trim()
    .toLowerCase();
  if (value === "faster-thinker") return "Faster Thinker";
  if (value === "normal-dual") return "Normal Duel";
  if (value === "survival-dual") return "Survival Duel";
  return prettifySlug(value || "normal-dual");
}

function getTimerLabelForMode(mode) {
  const value = String(mode || "")
    .trim()
    .toLowerCase();
  if (value === "faster-thinker") return "Timer: Fast Reflex";
  if (value === "survival-dual") return "Timer: Pressure Based";
  return "Timer: Match Based";
}

function prettifySlug(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function appendAvatarBust(url) {
  if (!url) return "/assets/avatars/avatar-01.png";
  const suffix = `t=${Date.now()}`;
  return url.includes("?") ? `${url}&${suffix}` : `${url}?${suffix}`;
}

function generateToken(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";

  for (let i = 0; i < length; i += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return value;
}

function showBattleToast(message = "Done") {
  if (typeof window.showToast === "function") {
    window.showToast(message);
    return;
  }

  let toast = document.getElementById("battleToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "battleToast";
    toast.style.cssText = `
      position: fixed;
      right: 14px;
      bottom: 14px;
      max-width: min(88vw, 320px);
      background: rgba(15, 20, 32, 0.96);
      color: #eef4ff;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 12px 28px rgba(0,0,0,0.28);
      z-index: 100000;
      font-size: 13px;
      line-height: 1.45;
      opacity: 0;
      transition: .2s;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 1800);
}

function safeLocalGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`LocalStorage get failed for ${key}:`, error);
    return null;
  }
}

function safeLocalSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    console.warn(`LocalStorage set failed for ${key}:`, error);
  }
}

function safeParseLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    console.warn(`LocalStorage parse failed for ${key}:`, error);
    return null;
  }
}
