document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");

  const subtopicTitle = document.getElementById("subtopicTitle");
  const quizSetsGrid = document.getElementById("quizSetsGrid");
  const backToTopic = document.getElementById("backToTopic");

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  if (!subtopicTitle || !quizSetsGrid || !backToTopic) {
    console.error("Subtopic page elements not found.");
    return;
  }

  backToTopic.href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic || "")}`;

  function makeNiceTitle(slug) {
    return (slug || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function getLegacySavedStats(topicSlug, subtopicSlug, setName = "set-1") {
    const key = `dn_physics_pp-quiz_${topicSlug}_${subtopicSlug}_${setName}`;

    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  }

  function getQuizProgressId(topicSlug, subtopicSlug, setName = "set-1") {
    return `${topicSlug}__${subtopicSlug}__${setName}`;
  }

  function normalizeStats(stats) {
    if (!stats || typeof stats !== "object") {
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
        stats.bestFullBadgePercentage === null || stats.bestFullBadgePercentage === undefined
          ? null
          : Number(stats.bestFullBadgePercentage) || 0,
      lastPlayedAt: stats.lastPlayedAt || "Never",
      streak: Number(stats.streak) || 0,
      completedFullQuiz: Boolean(stats.completedFullQuiz)
    };
  }

  function getSavedStats(topicSlug, subtopicSlug, setName = "set-1") {
    const store = getProgressStore();
    const id = getQuizProgressId(topicSlug, subtopicSlug, setName);

    if (store[id]) {
      return normalizeStats(store[id]);
    }

    const legacy = getLegacySavedStats(topicSlug, subtopicSlug, setName);
    if (legacy) {
      return normalizeStats(legacy);
    }

    return normalizeStats(null);
  }

  async function loadQuizSets() {
    const manifestPath = `/DN_Physics/pp-quiz/data/${topic}/${subtopic}/sets.json`;

    try {
      const response = await fetch(manifestPath, { cache: "no-store" });
      if (!response.ok) throw new Error("No sets manifest found");

      const data = await response.json();

      let sets = [];

      if (Array.isArray(data)) {
        sets = data;
      } else if (Array.isArray(data.sets)) {
        sets = data.sets;
      } else {
        throw new Error("Invalid sets manifest format");
      }

      const cleanedSets = sets
        .filter((set) => set && typeof set === "object" && set.slug)
        .map((set, index) => ({
          slug: String(set.slug).trim(),
          title: String(set.title || `Set ${index + 1}`).trim()
        }))
        .filter((set) => set.slug.length > 0);

      if (!cleanedSets.length) {
        throw new Error("No valid sets found");
      }

      return cleanedSets;
    } catch (error) {
      console.warn("Using fallback quiz set:", error);
      return [
        { slug: "set-1", title: "Set 1" }
      ];
    }
  }

  function buildSetCard(set) {
    const stats = getSavedStats(topic, subtopic, set.slug);
    const attempts = stats.attempts;
    const bestPercentage = stats.bestPercentage;
    const bestFullPercentage = stats.bestFullBadgePercentage;
    const badge = bestFullPercentage !== null ? getBadgeData(bestFullPercentage) : null;
    const mastery = getMasteryLevel(bestFullPercentage);
    const lastPlayed = stats.lastPlayedAt;
    const streak = stats.streak;
    const completed = stats.completedFullQuiz;

    const card = document.createElement("a");
    card.className = "topic-card";
    card.href = `/DN_Physics/pp-quiz/quiz.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}&set=${encodeURIComponent(set.slug)}`;

    card.innerHTML = `
      <h2>${set.title || makeNiceTitle(set.slug)}</h2>
      <p>${completed ? "Continue or improve your score" : "Start quiz"}</p>

      <div class="subtopic-meta">
        <span class="meta-pill">Attempts: ${attempts}</span>
        <span class="meta-pill">Best: ${bestPercentage}%</span>
        <span class="meta-pill">Mastery: ${mastery}</span>
        <span class="meta-pill">Last Played: ${lastPlayed}</span>
        <span class="meta-pill">Streak: ${streak} day${streak === 1 ? "" : "s"}</span>
        ${
          completed
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

  if (!topic || !subtopic) {
    subtopicTitle.textContent = "Subtopic Not Found";
    quizSetsGrid.innerHTML = `<p class="muted-text">Missing topic or subtopic.</p>`;
    return;
  }

  subtopicTitle.textContent = makeNiceTitle(subtopic);
  quizSetsGrid.innerHTML = `<div class="muted-text">Loading quiz sets...</div>`;

  const quizSets = await loadQuizSets();

  quizSetsGrid.innerHTML = "";

  if (!quizSets.length) {
    quizSetsGrid.innerHTML = `<p class="muted-text">No quiz sets found yet.</p>`;
    return;
  }

  quizSets.forEach((set) => {
    quizSetsGrid.appendChild(buildSetCard(set));
  });
});
