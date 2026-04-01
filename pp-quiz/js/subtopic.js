document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");

  const subtopicTitle = document.getElementById("subtopicTitle");
  const heroTitle = document.getElementById("subtopicHeroTitle");
  const heroText = document.getElementById("subtopicHeroText");
  const quizSetsGrid = document.getElementById("quizSetsGrid");
  const backToTopic = document.getElementById("backToTopic");

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  if (!subtopicTitle || !quizSetsGrid || !backToTopic) {
    console.error("Subtopic page elements not found.");
    return;
  }

  backToTopic.href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic || "")}`;

  /* =========================
     HELPERS
  ========================= */

  function makeNiceTitle(slug) {
    return (slug || "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function getBadgeData(p) {
    if (p >= 90) return { label: "🥇 Gold", className: "badge-gold" };
    if (p >= 75) return { label: "🥈 Silver", className: "badge-silver" };
    if (p >= 50) return { label: "🥉 Bronze", className: "badge-bronze" };
    return null;
  }

  function getMasteryLevel(p) {
    if (p >= 90) return "Mastered";
    if (p >= 75) return "Strong";
    if (p >= 50) return "Improving";
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

    if (store[id]) return normalizeStats(store[id]);

    const legacy = getLegacySavedStats(topicSlug, subtopicSlug, setName);
    if (legacy) return normalizeStats(legacy);

    return normalizeStats(null);
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

  function getSetDescription(mastery, attempts) {
    if (attempts === 0) return "Start solving and build your accuracy step by step.";
    if (mastery === "Mastered") return "Excellent performance. Maintain your mastery.";
    if (mastery === "Strong") return "Strong understanding. Push for full mastery.";
    if (mastery === "Improving") return "Good progress. More practice will boost results.";
    return "Keep practicing to improve your fundamentals.";
  }

  /* =========================
     LOAD SETS
  ========================= */

  async function loadQuizSets() {
    const manifestPath = `/DN_Physics/pp-quiz/data/${topic}/${subtopic}/sets.json`;

    try {
      const res = await fetch(manifestPath, { cache: "no-store" });
      if (!res.ok) throw new Error();

      const data = await res.json();
      const sets = Array.isArray(data) ? data : data.sets;

      return sets.map((s, i) => ({
        slug: s.slug,
        title: s.title || `Set ${i + 1}`
      }));
    } catch {
      return [{ slug: "set-1", title: "Set 1" }];
    }
  }

  /* =========================
     TOUCH FIX
  ========================= */

  function attachSmoothCardTouch(card) {
    let startX = 0;
    let startY = 0;
    let moved = false;

    card.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      moved = false;
      card.classList.add("card-touch-active");
    }, { passive: true });

    card.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) {
        moved = true;
        card.classList.remove("card-touch-active");
      }
    }, { passive: true });

    card.addEventListener("touchend", () => {
      setTimeout(() => card.classList.remove("card-touch-active"), 80);
    });

    card.addEventListener("click", (e) => {
      if (moved) e.preventDefault();
    });
  }

  /* =========================
     CARD BUILDER (CLEAN)
  ========================= */

  function buildSetCard(set, index) {
    const stats = getSavedStats(topic, subtopic, set.slug);

    const progress = stats.bestFullBadgePercentage || 0;
    const mastery = getMasteryLevel(progress);
    const badge = getBadgeData(progress);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.style.animationDelay = `${index * 0.04}s`;

    card.href = `/DN_Physics/pp-quiz/quiz.html?topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}&set=${encodeURIComponent(set.slug)}`;

    const description = getSetDescription(mastery, stats.attempts);

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Quiz Set</div>
          <h2 class="topic-title">${escapeHtml(set.title)}</h2>
          <p class="topic-desc">${escapeHtml(description)}</p>
        </div>
        <div class="topic-icon">🧠</div>
      </div>

      <div class="topic-stats">
        <span class="stat-pill">Attempts: ${stats.attempts}</span>
        <span class="stat-pill">Mastery: ${mastery}</span>
        ${badge ? `<span class="stat-pill ${badge.className}">${badge.label}</span>` : ""}
      </div>

      <div class="subtopic-progress-block">
        <div class="subtopic-progress-head">
          <span>Progress</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>

      <div class="topic-stats subtopic-meta-stats">
        <span class="stat-pill">Last: ${stats.lastPlayedAt}</span>
        <span class="stat-pill">Streak: ${stats.streak} day${stats.streak === 1 ? "" : "s"}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">
        ${stats.attempts > 0 ? "Continue Practice" : "Start Practice"}
      </span>
    `;

    attachSmoothCardTouch(card);
    return card;
  }

  function renderEmpty(message) {
    quizSetsGrid.innerHTML = `
      <div class="empty-state fade-in">
        <h3>No quiz sets found</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  /* =========================
     INIT
  ========================= */

  if (!topic || !subtopic) {
    subtopicTitle.textContent = "Subtopic Not Found";
    renderEmpty("Missing topic or subtopic.");
    return;
  }

  const niceName = makeNiceTitle(subtopic);

  subtopicTitle.textContent = niceName;
  if (heroTitle) heroTitle.textContent = niceName;
  if (heroText) {
    heroText.textContent = `Practice ${niceName} with structured MCQ sets and track your progress.`;
  }

  const sets = await loadQuizSets();

  quizSetsGrid.innerHTML = "";

  if (!sets || sets.length === 0) {
    renderEmpty("Add sets.json for this subtopic to display quiz sets.");
    return;
  }

  sets.forEach((set, index) => {
    quizSetsGrid.appendChild(buildSetCard(set, index));
  });
});
