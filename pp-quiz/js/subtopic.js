document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");

  const subtopicTitle = document.getElementById("subtopicTitle");
  const subtopicSubtitle = document.getElementById("subtopicSubtitle");
  const heroTitle = document.getElementById("subtopicHeroTitle");
  const heroText = document.getElementById("subtopicHeroText");
  const quizSetsGrid = document.getElementById("quizSetsGrid");
  const backToTopic = document.getElementById("backToTopic");
  const backToTopicBtn = document.getElementById("backToTopicBtn");

  const emptyState = document.getElementById("subtopicEmptyState");
  const errorState = document.getElementById("subtopicErrorState");
  const errorText = document.getElementById("subtopicErrorText");
  const retrySubtopicBtn = document.getElementById("retrySubtopicBtn");

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";

  if (
    !subtopicTitle ||
    !quizSetsGrid ||
    !backToTopic ||
    !emptyState ||
    !errorState ||
    !errorText ||
    !retrySubtopicBtn
  ) {
    console.error("Subtopic page elements not found.");
    return;
  }

  const topicPageHref = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic || "")}`;
  backToTopic.href = topicPageHref;
  if (backToTopicBtn) backToTopicBtn.href = topicPageHref;

  function showGrid() {
    quizSetsGrid.style.display = "";
    emptyState.style.display = "none";
    errorState.style.display = "none";
  }

  function showEmpty(message) {
    quizSetsGrid.style.display = "none";
    emptyState.style.display = "block";
    errorState.style.display = "none";

    const p = emptyState.querySelector("p");
    if (p) p.textContent = message || "No quiz sets found.";
  }

  function showError(message) {
    quizSetsGrid.style.display = "none";
    emptyState.style.display = "none";
    errorState.style.display = "block";
    errorText.textContent =
      message || "Something went wrong while loading this subtopic. Please try again.";
  }

  function makeNiceTitle(slug) {
    return (slug || "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
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

  async function loadQuizSets() {
    const manifestPath = `/DN_Physics/pp-quiz/data/${topic}/${subtopic}/sets.json`;

    try {
      const res = await fetch(manifestPath, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Failed to load sets manifest: ${manifestPath}`);
      }

      const data = await res.json();
      const sets = Array.isArray(data) ? data : data.sets;

      if (!Array.isArray(sets)) {
        throw new Error("Invalid sets manifest format.");
      }

      return sets
        .filter((s) => s && typeof s === "object" && s.slug)
        .map((s, i) => ({
          slug: s.slug,
          title: s.title || `Set ${i + 1}`
        }));
    } catch (error) {
      console.warn("sets.json could not be loaded, using fallback set-1.", error);
      return [{ slug: "set-1", title: "Set 1" }];
    }
  }

  function attachSmoothCardTouch(card) {
    let startX = 0;
    let startY = 0;
    let moved = false;

    card.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        moved = false;
        card.classList.add("card-touch-active");
      },
      { passive: true }
    );

    card.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) {
          moved = true;
          card.classList.remove("card-touch-active");
        }
      },
      { passive: true }
    );

    card.addEventListener("touchend", () => {
      setTimeout(() => card.classList.remove("card-touch-active"), 80);
    });

    card.addEventListener("click", (e) => {
      if (moved) e.preventDefault();
    });
  }

  function buildSetCard(set, index) {
    const stats = getSavedStats(topic, subtopic, set.slug);
    const progress = stats.bestFullBadgePercentage || 0;
    const mastery = getMasteryLevel(progress);
    const badge = getBadgeData(progress);
    const description = getSetDescription(mastery, stats.attempts);

    const card = document.createElement("a");
    card.className = "topic-card fade-slide-up";
    card.style.animationDelay = `${index * 0.04}s`;

    card.href = `/DN_Physics/pp-quiz/quiz.html?topic=${encodeURIComponent(
      topic
    )}&subtopic=${encodeURIComponent(subtopic)}&set=${encodeURIComponent(set.slug)}`;

    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-body">
          <div class="topic-pill">Quiz Set</div>
          <h2 class="topic-title">${escapeHtml(set.title)}</h2>
          <p class="topic-desc">${escapeHtml(description)}</p>
        </div>
        <div class="topic-icon" aria-hidden="true">🧠</div>
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
        <span class="stat-pill">Last: ${escapeHtml(stats.lastPlayedAt)}</span>
        <span class="stat-pill">Streak: ${stats.streak} day${stats.streak === 1 ? "" : "s"}</span>
      </div>

      <span class="action-btn primary-btn enter-topic-btn">
        ${stats.attempts > 0 ? "Continue Practice" : "Start Practice"}
      </span>
    `;

    attachSmoothCardTouch(card);
    return card;
  }

  async function renderPage() {
    if (!topic || !subtopic) {
      subtopicTitle.textContent = "Subtopic Not Found";
      if (subtopicSubtitle) subtopicSubtitle.textContent = "Missing topic or subtopic.";
      showError("Missing topic or subtopic in the page URL.");
      return;
    }

    const niceName = makeNiceTitle(subtopic);

    subtopicTitle.textContent = niceName;
    if (subtopicSubtitle) {
      subtopicSubtitle.textContent = "Choose a quiz set to start practicing.";
    }
    if (heroTitle) heroTitle.textContent = niceName;
    if (heroText) {
      heroText.textContent = `Practice ${niceName} with structured MCQ sets and track your progress.`;
    }

    const sets = await loadQuizSets();

    if (!sets || sets.length === 0) {
      showEmpty("Add sets.json for this subtopic to display quiz sets.");
      return;
    }

    quizSetsGrid.innerHTML = "";
    sets.forEach((set, index) => {
      quizSetsGrid.appendChild(buildSetCard(set, index));
    });

    showGrid();
  }

  retrySubtopicBtn.addEventListener("click", () => {
    window.location.reload();
  });

  await renderPage();
});
