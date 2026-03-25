const topics = [
  { slug: "units", title: "Units" },
  { slug: "mechanics", title: "Mechanics" },
  { slug: "oscillations-waves", title: "Oscillations & Waves" },
  { slug: "thermal-physics", title: "Thermal Physics" },
  { slug: "gravitational-field", title: "Gravitational Field" },
  { slug: "electrostatics-field", title: "Electrostatics Field" },
  { slug: "magnetic-field", title: "Magnetic Field" },
  { slug: "current-electricity", title: "Current Electricity" },
  { slug: "electronics", title: "Electronics" },
  { slug: "mechanical-properties", title: "Mechanical Properties" },
  { slug: "matter-radiations", title: "Matter & Radiations" }
];

document.addEventListener("DOMContentLoaded", () => {
  const topicsGrid = document.getElementById("topicsGrid");

  if (!topicsGrid) {
    console.error("topicsGrid element not found.");
    return;
  }

  topics.forEach((topic) => {
    const card = document.createElement("a");
    card.className = "topic-card";
    card.href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic.slug)}`;
    card.innerHTML = `
      <h2>${topic.title}</h2>
      <p>Open subtopics</p>
    `;
    topicsGrid.appendChild(card);
  });
});
