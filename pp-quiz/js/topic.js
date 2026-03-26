const topicData = {
  /* KEEP YOUR EXISTING topicData EXACTLY SAME */
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

/* ===== NEW: PROGRESS CALCULATIONS ===== */

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

/* ===== RENDER ===== */

if (!topicTitle || !subtopicsGrid) {
  console.error("topic.html is missing required elements.");
} else if (!topicSlug || !topicData[topicSlug]) {
  topicTitle.textContent = "Topic Not Found";
  subtopicsGrid.innerHTML = `<p>Invalid topic selected.</p>`;
} else {
  const currentTopic = topicData[topicSlug];
  topicTitle.textContent = currentTopic.title;
  subtopicsGrid.innerHTML = "";

  currentTopic.subtopics.forEach((subtopic) => {
    const summary = calculateSubtopicSummary(topicSlug, subtopic.slug);

    const badge = summary.bestFull
      ? getBadgeData(summary.bestFull)
      : null;

    const card = document.createElement("a");
    card.className = "topic-card";
    card.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topicSlug)}&subtopic=${encodeURIComponent(subtopic.slug)}`;

    card.innerHTML = `
      <h2>${subtopic.title}</h2>
      <p>${summary.completed ? "Continue mastering" : "Start quiz"}</p>

      <!-- PROGRESS BAR -->
      <div class="quiz-progress-strip">
        <div class="quiz-progress-label-row">
          <span>Progress</span>
          <span>${summary.progress.toFixed(1)}%</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${summary.progress}%"></div>
        </div>
      </div>

      <!-- META -->
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

    subtopicsGrid.appendChild(card);
  });
}
