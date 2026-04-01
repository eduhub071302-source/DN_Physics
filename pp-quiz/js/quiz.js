document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");
  const setName = params.get("set") || "set-1";

  const quizTitle = document.getElementById("quizTitle");
  const quizSubtitle = document.getElementById("quizSubtitle");
  const backToSubtopic = document.getElementById("backToSubtopic");

  const questionCounter = document.getElementById("questionCounter");
  const answeredCounter = document.getElementById("answeredCounter");
  const flaggedCounter = document.getElementById("flaggedCounter");

  const questionImage = document.getElementById("questionImage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitQuizBtn = document.getElementById("submitQuizBtn");
  const finishQuizBtn = document.getElementById("finishQuizBtn");

  const resultCard = document.getElementById("resultCard");
  const resultSummary = document.getElementById("resultSummary");
  const historyCard = document.getElementById("historyCard");
  const historySummary = document.getElementById("historySummary");

  const answerButtons = Array.from(document.querySelectorAll(".answer-btn"));
  const attemptInfo = document.getElementById("attemptInfo");
  const performanceSummary = document.getElementById("performanceSummary");

  const reviewNote = document.getElementById("reviewNote");
  const postResultActions = document.getElementById("postResultActions");
  const retryQuizBtn = document.getElementById("retryQuizBtn");
  const retryWrongBtn = document.getElementById("retryWrongBtn");
  const retryUnansweredBtn = document.getElementById("retryUnansweredBtn");
  const retryMarkedBtn = document.getElementById("retryMarkedBtn");
  const wrongOnlyBtn = document.getElementById("wrongOnlyBtn");

  const hintBtn = null;
  const hintBox = null;
  const hintText = null;
  const closeHintBtn = null;

  const zoomBtn = document.getElementById("zoomBtn");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeImageModal = document.getElementById("closeImageModal");
  const imageModalViewport = document.getElementById("imageModalViewport");

  const quizTimerDisplay = document.getElementById("quizTimerDisplay");
  const questionTimerDisplay = document.getElementById("questionTimerDisplay");

  const markReviewBtn = document.getElementById("markReviewBtn");
  const jumpBtn = document.getElementById("jumpBtn");
  const jumpWrap = document.getElementById("jumpWrap");
  const jumpInput = document.getElementById("jumpInput");
  const jumpConfirmBtn = document.getElementById("jumpConfirmBtn");

  const questionPalette = document.getElementById("questionPalette");
  const quizProgressFill = document.getElementById("quizProgressFill");
  const quizProgressText = document.getElementById("quizProgressText");

  const answerExplanation = document.getElementById("answerExplanation");
  const answerExplanationText = document.getElementById("answerExplanationText");

  const resumeCard = document.getElementById("resumeCard");
  const resumeSummary = document.getElementById("resumeSummary");
  const resumeQuizBtn = document.getElementById("resumeQuizBtn");
  const discardResumeBtn = document.getElementById("discardResumeBtn");

  const motivationBar = document.getElementById("motivationBar");
  const finalScoreEl = document.getElementById("finalScore");
  const resultHeadline = document.getElementById("resultHeadline");
  const resultMotivation = document.getElementById("resultMotivation");

  const refreshQuizBtn = document.getElementById("refreshQuizBtn");

  const requiredElements = [
    refreshQuizBtn,
    quizTitle,
    quizSubtitle,
    backToSubtopic,
    questionCounter,
    answeredCounter,
    flaggedCounter,
    questionImage,
    prevBtn,
    nextBtn,
    submitQuizBtn,
    finishQuizBtn,
    resultCard,
    resultSummary,
    historyCard,
    historySummary,
    attemptInfo,
    performanceSummary,
    reviewNote,
    postResultActions,
    retryQuizBtn,
    retryWrongBtn,
    retryUnansweredBtn,
    retryMarkedBtn,
    wrongOnlyBtn,
    zoomBtn,
    imageModal,
    modalImage,
    closeImageModal,
    imageModalViewport,
    quizTimerDisplay,
    questionTimerDisplay,
    markReviewBtn,
    jumpBtn,
    jumpWrap,
    jumpInput,
    jumpConfirmBtn,
    questionPalette,
    quizProgressFill,
    quizProgressText,
    answerExplanation,
    answerExplanationText,
    resumeCard,
    resumeSummary,
    resumeQuizBtn,
    discardResumeBtn
  ];

  if (!topic || !subtopic) {
    console.error("Missing topic or subtopic in URL.");
    if (quizTitle) quizTitle.textContent = "Quiz Not Found";
    if (quizSubtitle) quizSubtitle.textContent = "Missing topic or subtopic.";
    return;
  }

  if (requiredElements.some((el) => !el) || answerButtons.length === 0) {
    console.error("Quiz page elements missing. Check quiz.html IDs and classes.");
    return;
  }

  const QUIZ_PROGRESS_KEY = "dnPhysicsQuizProgress";
  const QUIZ_SESSION_KEY = "dnPhysicsQuizSessions";

  let pendingServiceWorkerUpdate = false;
  let isQuizActive = true;

  let renderScheduled = false;
  let saveTimeout = null;

  let currentQuestion = 1;
  let totalQuestions = 1;
  let answerKey = {};
  let explanations = {};
  let hintData = {};
  let userAnswers = {};
  let reviewMode = false;
  let wrongQuestionsGlobal = [];
  let wrongQuestionPointer = 0;
  let practiceWrongOnlyMode = false;
  let currentDisplayIndex = 1;
  let pinchStartDistance = 0;
  let modalScale = 1;
  let flaggedQuestions = new Set();

  let quizTimerInterval = null;
  let questionTimerInterval = null;
  let quizElapsedSeconds = 0;
  let questionElapsedSeconds = 0;

  let quizTimeLimitSeconds = null;
  let questionTimeLimitSeconds = null;

  let retryModeType = "full";
  let retryQuestionList = [];

  const MOTIVATION_LINES = [
    "Stay focused. Every question improves your rank.",
    "Small improvements create big rank jumps.",
    "You are training like top exam competitors.",
    "Discipline beats talent when talent is lazy.",
    "Do not rush. Accuracy is your power.",
    "Every correct answer builds your confidence.",
    "You vs yesterday. That is the real battle."
  ];

  function showToast(message = "Done") {
    let toast = document.getElementById("globalToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function hideHintBox() {
    // Hint system disabled
  }

  function showHintBox() {
    // Hint system disabled (Exam Mode)
  }

  function scheduleRender(fn) {
    if (renderScheduled) return;

    renderScheduled = true;

    requestAnimationFrame(() => {
      fn();
      renderScheduled = false;
    });
  }

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function makeNiceTitle(slug) {
    return (slug || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function escapeHtml(value) {
    return String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatHintMath(value) {
    let text = escapeHtml(value);

    text = text
      .replace(/gamma/gi, "γ")
      .replace(/rho/gi, "ρ")
      .replace(/lambda/gi, "λ")
      .replace(/theta/gi, "θ")
      .replace(/pi/gi, "π");

    return text;
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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

  function getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function getYesterdayDateString(dateString) {
    const d = new Date(`${dateString}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getProgressStore() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgressStore(store) {
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(store));
  }

  function getSessionStore() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_SESSION_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveSessionStore(store) {
    localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(store));
  }

  function getQuizProgressId(topicSlug, subtopicSlug, currentSetName = "set-1") {
    return `${topicSlug}__${subtopicSlug}__${currentSetName}`;
  }

  function getLegacyStorageKey() {
    return `dn_physics_pp-quiz_${topic}_${subtopic}_${setName}`;
  }

  function getDefaultAttemptData() {
    return {
      lastCorrect: 0,
      lastAnswered: 0,
      lastPercentage: "0.0",
      bestCorrect: 0,
      bestAnswered: 0,
      bestPercentage: "0.0",
      attempts: 0,
      bestFullBadgePercentage: null,
      lastPlayedAt: null,
      streak: 0,
      completedFullQuiz: false,
      totalWrongBank: [],
      bestHistory: []
    };
  }

  function normalizeArrayOfNumbers(arr) {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
  }

  function normalizeAttemptData(data) {
    const base = getDefaultAttemptData();
    if (!data || typeof data !== "object") return base;

    return {
      lastCorrect: Number(data.lastCorrect) || 0,
      lastAnswered: Number(data.lastAnswered) || 0,
      lastPercentage: data.lastPercentage ?? "0.0",
      bestCorrect: Number(data.bestCorrect) || 0,
      bestAnswered: Number(data.bestAnswered) || 0,
      bestPercentage: data.bestPercentage ?? "0.0",
      attempts: Number(data.attempts) || 0,
      bestFullBadgePercentage:
        data.bestFullBadgePercentage === null || data.bestFullBadgePercentage === undefined
          ? null
          : data.bestFullBadgePercentage,
      lastPlayedAt: data.lastPlayedAt || null,
      streak: Number(data.streak) || 0,
      completedFullQuiz: Boolean(data.completedFullQuiz),
      totalWrongBank: normalizeArrayOfNumbers(data.totalWrongBank),
      bestHistory: Array.isArray(data.bestHistory) ? data.bestHistory.slice(0, 10) : []
    };
  }

  function loadAttemptData() {
    const store = getProgressStore();
    const progressId = getQuizProgressId(topic, subtopic, setName);

    if (store[progressId]) {
      return normalizeAttemptData(store[progressId]);
    }

    try {
      const legacy = JSON.parse(localStorage.getItem(getLegacyStorageKey()));
      if (legacy) {
        const normalized = normalizeAttemptData(legacy);
        store[progressId] = normalized;
        saveProgressStore(store);
        return normalized;
      }
    } catch {
      // ignore
    }

    return null;
  }

  function saveAttemptData(data) {
    const store = getProgressStore();
    const progressId = getQuizProgressId(topic, subtopic, setName);
    store[progressId] = normalizeAttemptData(data);
    saveProgressStore(store);
  }

  function getSavedSession() {
    const store = getSessionStore();
    const sessionId = getQuizProgressId(topic, subtopic, setName);
    return store[sessionId] || null;
  }

  function saveCurrentSession() {
    if (reviewMode) return;

    const store = getSessionStore();
    const sessionId = getQuizProgressId(topic, subtopic, setName);

    store[sessionId] = {
      currentQuestion,
      currentDisplayIndex,
      userAnswers,
      flaggedQuestions: Array.from(flaggedQuestions),
      unansweredSnapshot: getUnansweredQuestions(),
      practiceWrongOnlyMode,
      retryModeType,
      retryQuestionList,
      quizElapsedSeconds,
      questionElapsedSeconds,
      savedAt: Date.now()
    };

    saveSessionStore(store);
  }

  function smartSaveSession() {
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
      saveCurrentSession();
    }, 800);
  }

  function clearSavedSession() {
    const store = getSessionStore();
    const sessionId = getQuizProgressId(topic, subtopic, setName);
    delete store[sessionId];
    saveSessionStore(store);
  }

  function showJumpWrap(show) {
    if (!jumpWrap) return;
    jumpWrap.classList.toggle("show", show);
  }

  function closeJumpWrap() {
    showJumpWrap(false);
  }

  function scrollQuestionIntoView(behavior = "smooth") {
    const target =
      document.querySelector(".quiz-status-card") ||
      document.querySelector(".quiz-main-card") ||
      questionImage;

    if (!target) return;

    const header = document.querySelector(".quiz-header");
    const headerOffset = (header ? header.offsetHeight : 78) + 8;

    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, y),
      behavior: isMobileView() ? "auto" : behavior
    });
  }

  function renderAttemptInfo() {
    const saved = loadAttemptData();

    if (!saved || saved.attempts <= 0) {
      attemptInfo.innerHTML = `
        <div><strong>Last Score:</strong> No previous attempt</div>
        <div><strong>Best Score:</strong> No previous attempt</div>
        <div><strong>Attempts:</strong> 0</div>
        <div><strong>Badge:</strong> None</div>
        <div><strong>Wrong Bank:</strong> 0 questions</div>
      `;
      return;
    }

    const badge = saved.bestFullBadgePercentage ? getBadgeData(saved.bestFullBadgePercentage) : null;

    attemptInfo.innerHTML = `
      <div><strong>Last Score:</strong> ${saved.lastCorrect} / ${saved.lastAnswered} (${saved.lastPercentage}%)</div>
      <div><strong>Best Score:</strong> ${saved.bestCorrect} / ${saved.bestAnswered} (${saved.bestPercentage}%)</div>
      <div><strong>Attempts:</strong> ${saved.attempts}</div>
      <div><strong>Badge:</strong> ${badge ? `<span class="${badge.className}">${badge.label}</span>` : "None"}</div>
      <div><strong>Wrong Bank:</strong> ${saved.totalWrongBank.length} questions</div>
    `;
  }

  function renderPerformanceCard() {
    const saved = loadAttemptData() || getDefaultAttemptData();
    const mastery = getMasteryLevel(saved.bestFullBadgePercentage);
    const lastPlayedText = saved.lastPlayedAt ? saved.lastPlayedAt : "Never";

    performanceSummary.innerHTML = `
      <div><strong>Mastery:</strong> ${mastery}</div>
      <div><strong>Completed Full Quiz:</strong> ${saved.completedFullQuiz ? "Yes" : "No"}</div>
      <div><strong>Last Played:</strong> ${lastPlayedText}</div>
      <div><strong>Streak:</strong> ${saved.streak} day${saved.streak === 1 ? "" : "s"}</div>
    `;
  }

  function renderHistoryCard() {
    const saved = loadAttemptData() || getDefaultAttemptData();
    const history = Array.isArray(saved.bestHistory) ? saved.bestHistory : [];

    historyCard.style.display = history.length ? "block" : "none";

    if (!history.length) {
      historySummary.innerHTML = `<div>No history yet.</div>`;
      return;
    }

    historySummary.innerHTML = history
      .map((item, index) => {
        return `
          <div>
            <strong>#${index + 1}</strong> — ${item.date || "Unknown"} — ${item.mode || "quiz"} — ${item.percentage || "0.0"}%
          </div>
        `;
      })
      .join("");
  }

  function updateMotivationBar() {
    if (!motivationBar) return;

    const total = getCurrentTotalCount();
    const answered = getAnsweredCount();
    const progress = total > 0 ? (answered / total) * 100 : 0;

    let text = "";

    if (reviewMode) {
      text = "Review mode active. Learn deeply from every mistake.";
    } else if (progress < 25) {
      text = "Start strong. Focus deeply.";
    } else if (progress < 60) {
      text = "Good momentum. Keep going.";
    } else if (progress < 90) {
      text = "Almost there. Stay sharp.";
    } else {
      text = "Final push. Finish strong.";
    }

    const randomLine = MOTIVATION_LINES[Math.floor(Math.random() * MOTIVATION_LINES.length)];
    motivationBar.textContent = `${text} • ${randomLine}`;
  }

  async function loadQuizData() {
    const jsonPath = `/DN_Physics/pp-quiz/data/${topic}/${subtopic}/${setName}.json`;

    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load quiz JSON: ${jsonPath}`);
      }

      const data = await response.json();
      totalQuestions = Number(data.totalQuestions) || 1;
      answerKey = data.answers || {};
      explanations = data.explanations || {};
      quizTimeLimitSeconds = Number(data.quizTimeLimitSeconds) || null;
      questionTimeLimitSeconds = Number(data.questionTimeLimitSeconds) || null;

      quizTitle.textContent = `${makeNiceTitle(subtopic)} - ${data.title || makeNiceTitle(setName)}`;
      quizSubtitle.textContent = `${makeNiceTitle(topic)} / ${makeNiceTitle(subtopic)}`;
    } catch (error) {
      console.error(error);
      quizTitle.textContent = "Quiz Not Found";
      quizSubtitle.textContent = "Could not load quiz data.";
      return false;
    }

    return true;
  }

  backToSubtopic.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}`;

  function getImagePath(questionNumber) {
    return `/DN_Physics/pp-quiz/images/${topic}/${subtopic}/q${questionNumber}.jpg`;
  }

  function getAnsweredCount() {
    const relevantQuestions = getQuestionListForCurrentMode();
    return relevantQuestions.filter((q) => userAnswers[q] !== undefined).length;
  }

  function getFlaggedCount() {
    const relevantQuestions = getQuestionListForCurrentMode();
    return relevantQuestions.filter((q) => flaggedQuestions.has(q)).length;
  }

  function getQuestionListForCurrentMode() {
    if (retryModeType === "list" || practiceWrongOnlyMode) {
      return [...retryQuestionList];
    }
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  }

  function getCurrentQuestionNumber() {
    if (retryModeType === "list" || practiceWrongOnlyMode) {
      return retryQuestionList[currentDisplayIndex - 1];
    }
    return currentQuestion;
  }

  function getCurrentTotalCount() {
    if (retryModeType === "list" || practiceWrongOnlyMode) {
      return retryQuestionList.length;
    }
    return totalQuestions;
  }

  function getCurrentShownIndex() {
    if (retryModeType === "list" || practiceWrongOnlyMode) {
      return currentDisplayIndex;
    }
    return currentQuestion;
  }

  function getUnansweredQuestions() {
    const questionList = getQuestionListForCurrentMode();
    return questionList.filter((q) => userAnswers[q] === undefined);
  }

  function clearReviewClasses() {
    answerButtons.forEach((button) => {
      button.classList.remove("selected", "correct-answer", "wrong-answer", "review-dim");
    });
  }

  function updateExplanationBox() {
    if (!reviewMode) {
      answerExplanation.style.display = "none";
      return;
    }

    const questionNumber = getCurrentQuestionNumber();
    const explanation = explanations[String(questionNumber)];

    if (explanation) {
      answerExplanation.style.display = "block";
      answerExplanationText.textContent = explanation;
    } else {
      answerExplanation.style.display = "none";
      answerExplanationText.textContent = "No explanation available.";
    }
  }

  function updateAnswerButtons() {
    clearReviewClasses();

    const questionNumber = getCurrentQuestionNumber();
    const selected = userAnswers[questionNumber];
    const validAnswers = answerKey[String(questionNumber)] || [];

    if (!reviewMode) {
      answerButtons.forEach((button) => {
        const value = Number(button.dataset.answer);
        button.classList.toggle("selected", value === selected);
      });
      updateExplanationBox();
      return;
    }

    answerButtons.forEach((button) => {
      const value = Number(button.dataset.answer);
      const isSelected = value === selected;
      const isCorrect = validAnswers.includes(value);

      if (isCorrect) {
        button.classList.add("correct-answer");
      } else if (isSelected && !isCorrect) {
        button.classList.add("wrong-answer");
      } else {
        button.classList.add("review-dim");
      }
    });

    updateExplanationBox();
  }

  function updateProgressBar() {
    const answeredCount = getAnsweredCount();
    const totalCount = getCurrentTotalCount();
    const percent = totalCount > 0 ? ((answeredCount / totalCount) * 100).toFixed(1) : "0.0";

    quizProgressFill.style.width = `${percent}%`;
    quizProgressText.textContent = `${percent}%`;

    const percentNum = Number(percent);

    if (percentNum >= 80) {
      quizProgressFill.style.background = "linear-gradient(90deg, #22c55e, #4ade80)";
    } else if (percentNum >= 50) {
      quizProgressFill.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
    } else {
      quizProgressFill.style.background = "linear-gradient(90deg, #3b82f6, #60a5fa)";
    }
  }

  function updatePalette() {
    const currentQ = getCurrentQuestionNumber();
    const list = getQuestionListForCurrentMode();

    questionPalette.innerHTML = "";

    list.forEach((questionNumber) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "palette-btn";
      btn.textContent = questionNumber;

      if (questionNumber === currentQ) btn.classList.add("is-current");
      if (userAnswers[questionNumber] !== undefined) btn.classList.add("is-answered");
      if (flaggedQuestions.has(questionNumber)) btn.classList.add("is-flagged");
      if (userAnswers[questionNumber] === undefined) btn.classList.add("is-unanswered");

      btn.addEventListener("click", () => {
        goToQuestionByActualNumber(questionNumber);
        closeJumpWrap();
      });

      questionPalette.appendChild(btn);
    });

    markReviewBtn.textContent = flaggedQuestions.has(currentQ)
      ? "★ Unmark Review"
      : "☆ Mark for Review";
  }

  function updateSubmitVisibility() {
    const answeredCount = getAnsweredCount();
    const currentTotal = getCurrentTotalCount();

    answeredCounter.textContent = `Answered: ${answeredCount} / ${currentTotal}`;
    flaggedCounter.textContent = `Flagged: ${getFlaggedCount()}`;

    const allAnswered = answeredCount === currentTotal && !reviewMode;

    submitQuizBtn.style.display = allAnswered ? "inline-flex" : "none";
    finishQuizBtn.style.display = allAnswered ? "none" : "inline-flex";
    finishQuizBtn.disabled = reviewMode;

    updateProgressBar();
    updatePalette();
  }

  function animateQuestionChange() {
    const card = document.querySelector(".quiz-main-card");
    if (!card) return;

    card.classList.remove("fade-slide-up");
    void card.offsetWidth;
    card.classList.add("fade-slide-up");

    setTimeout(() => {
      card.classList.remove("fade-slide-up");
    }, 250);
  }

  function updateQuestionView() {
    const questionNumber = getCurrentQuestionNumber();
    const totalCount = getCurrentTotalCount();
    const shownIndex = getCurrentShownIndex();

    hideHintBox();

    questionCounter.textContent = `Question ${shownIndex} of ${totalCount}`;
    questionImage.src = getImagePath(questionNumber);
    questionImage.alt = `${makeNiceTitle(subtopic)} question ${questionNumber}`;
    modalImage.src = questionImage.src;

    prevBtn.disabled = shownIndex === 1;
    nextBtn.disabled = shownIndex === totalCount;

    updateAnswerButtons();
    updateSubmitVisibility();
    updateMotivationBar();
    resetQuestionTimer();
    animateQuestionChange();
    smartSaveSession();
  }

  function stopTimers() {
    if (quizTimerInterval) {
      clearInterval(quizTimerInterval);
      quizTimerInterval = null;
    }
    if (questionTimerInterval) {
      clearInterval(questionTimerInterval);
      questionTimerInterval = null;
    }
  }

  function updateTimerDisplays() {
    if (quizTimeLimitSeconds) {
      quizTimerDisplay.textContent = formatTime(Math.max(0, quizTimeLimitSeconds - quizElapsedSeconds));
    } else {
      quizTimerDisplay.textContent = formatTime(quizElapsedSeconds);
    }

    if (questionTimeLimitSeconds) {
      questionTimerDisplay.textContent = formatTime(Math.max(0, questionTimeLimitSeconds - questionElapsedSeconds));
    } else {
      questionTimerDisplay.textContent = formatTime(questionElapsedSeconds);
    }
  }

  function startTimers() {
    stopTimers();

    quizTimerInterval = setInterval(() => {
      quizElapsedSeconds++;
      updateTimerDisplays();
      smartSaveSession();

      if (quizTimeLimitSeconds && quizElapsedSeconds >= quizTimeLimitSeconds && !reviewMode) {
        showResult("full");
      }
    }, 1000);

    questionTimerInterval = setInterval(() => {
      questionElapsedSeconds++;
      updateTimerDisplays();

      if (questionTimeLimitSeconds && questionElapsedSeconds >= questionTimeLimitSeconds && !reviewMode) {
        autoAdvanceQuestion();
      }
    }, 1000);
  }

  function resetQuestionTimer() {
    questionElapsedSeconds = 0;
    updateTimerDisplays();

    if (questionTimerInterval) {
      clearInterval(questionTimerInterval);
      questionTimerInterval = setInterval(() => {
        questionElapsedSeconds++;
        updateTimerDisplays();

        if (questionTimeLimitSeconds && questionElapsedSeconds >= questionTimeLimitSeconds && !reviewMode) {
          autoAdvanceQuestion();
        }
      }, 1000);
    }
  }

  function autoAdvanceQuestion() {
    const shownIndex = getCurrentShownIndex();
    const total = getCurrentTotalCount();

    if (shownIndex < total) {
      if (retryModeType === "list" || practiceWrongOnlyMode) {
        currentDisplayIndex++;
      } else {
        currentQuestion++;
      }
      scheduleRender(updateQuestionView);
      setTimeout(() => {
        scrollQuestionIntoView("auto");
      }, 50);
      return;
    }

    if (!reviewMode) {
      showResult("partial");
    }
  }

  function resetCurrentQuizState() {
    currentQuestion = 1;
    currentDisplayIndex = 1;
    userAnswers = {};
    reviewMode = false;
    wrongQuestionsGlobal = [];
    wrongQuestionPointer = 0;
    practiceWrongOnlyMode = false;
    retryModeType = "full";
    retryQuestionList = [];
    flaggedQuestions = new Set();
    quizElapsedSeconds = 0;
    questionElapsedSeconds = 0;
    isQuizActive = true;

    reviewNote.style.display = "none";
    resultCard.style.display = "none";
    historyCard.style.display = "none";
    postResultActions.style.display = "none";
    wrongOnlyBtn.style.display = "none";
    retryWrongBtn.style.display = "none";
    retryUnansweredBtn.style.display = "none";
    retryMarkedBtn.style.display = "none";
    finishQuizBtn.style.display = "inline-flex";
    submitQuizBtn.style.display = "none";
    answerExplanation.style.display = "none";
    hideHintBox();

    if (finalScoreEl) finalScoreEl.textContent = "0%";
    if (resultHeadline) resultHeadline.textContent = "Good Try";
    if (resultMotivation) resultMotivation.textContent = "Keep pushing. Improvement comes from consistency.";

    closeJumpWrap();
    clearSavedSession();
    scheduleRender(updateQuestionView);
    updateTimerDisplays();
    startTimers();
    window.scrollTo(0, 0);
  }

  function startListRetryMode(questionList) {
    if (!Array.isArray(questionList) || !questionList.length) return;

    retryModeType = "list";
    retryQuestionList = [...questionList];
    currentDisplayIndex = 1;
    reviewMode = false;
    userAnswers = {};
    questionElapsedSeconds = 0;
    isQuizActive = true;

    reviewNote.style.display = "none";
    resultCard.style.display = "none";
    historyCard.style.display = "none";
    postResultActions.style.display = "none";
    wrongOnlyBtn.style.display = "none";
    retryWrongBtn.style.display = "none";
    retryUnansweredBtn.style.display = "none";
    retryMarkedBtn.style.display = "none";
    finishQuizBtn.style.display = "inline-flex";
    submitQuizBtn.style.display = "none";
    answerExplanation.style.display = "none";
    hideHintBox();

    closeJumpWrap();
    scheduleRender(updateQuestionView);
    startTimers();
    scrollQuestionIntoView();
  }

  function finalizeAttempt(correct, wrong, unanswered, answeredQuestions, wrongQuestions, mode) {
    const percentageBase = answeredQuestions > 0 ? answeredQuestions : 1;
    const scorePercent = ((correct / percentageBase) * 100).toFixed(1);

    const previous = loadAttemptData() || getDefaultAttemptData();
    const previousBestPercentage = Number(previous.bestPercentage) || 0;
    const bestShouldUpdate = Number(scorePercent) > previousBestPercentage;

    const fullQuizPercentage = ((correct / totalQuestions) * 100).toFixed(1);
    const previousBestFullBadgePercentage = previous.bestFullBadgePercentage ?? null;

    const shouldUpdateFullBadge =
      mode === "full" &&
      (previousBestFullBadgePercentage === null ||
        Number(fullQuizPercentage) > Number(previousBestFullBadgePercentage));

    const today = getTodayDateString();
    let nextStreak = previous.streak || 0;

    if (!previous.lastPlayedAt) {
      nextStreak = 1;
    } else if (previous.lastPlayedAt === today) {
      nextStreak = previous.streak || 1;
    } else if (previous.lastPlayedAt === getYesterdayDateString(today)) {
      nextStreak = (previous.streak || 0) + 1;
    } else {
      nextStreak = 1;
    }

    const wrongBankSet = new Set(previous.totalWrongBank || []);
    wrongQuestions.forEach((q) => wrongBankSet.add(q));

    const history = Array.isArray(previous.bestHistory) ? [...previous.bestHistory] : [];
    history.unshift({
      date: today,
      mode,
      percentage: mode === "full" ? fullQuizPercentage : scorePercent
    });

    const newData = {
      lastCorrect: correct,
      lastAnswered: answeredQuestions,
      lastPercentage: scorePercent,
      bestCorrect: bestShouldUpdate ? correct : previous.bestCorrect,
      bestAnswered: bestShouldUpdate ? answeredQuestions : previous.bestAnswered,
      bestPercentage: bestShouldUpdate ? scorePercent : previous.bestPercentage,
      attempts: (previous.attempts || 0) + 1,
      bestFullBadgePercentage: shouldUpdateFullBadge
        ? fullQuizPercentage
        : previousBestFullBadgePercentage,
      lastPlayedAt: today,
      streak: nextStreak,
      completedFullQuiz: previous.completedFullQuiz || mode === "full",
      totalWrongBank: [...wrongBankSet].sort((a, b) => a - b),
      bestHistory: history.slice(0, 10)
    };

    saveAttemptData(newData);
    clearSavedSession();
    renderAttemptInfo();
    renderPerformanceCard();
    renderHistoryCard();

    const earnedBadge = mode === "full" ? getBadgeData(fullQuizPercentage) : null;
    const masteryLevel = getMasteryLevel(newData.bestFullBadgePercentage);

    const modeText =
      mode === "full"
        ? "Calculated from all questions after full submit."
        : mode === "wrong-only"
        ? "Calculated from wrong-question practice only."
        : mode === "partial"
        ? "Calculated only from answered questions after finishing now."
        : "Calculated from the selected retry list.";

    const scoreValue = Number(mode === "full" ? fullQuizPercentage : scorePercent);

    if (finalScoreEl) finalScoreEl.textContent = `${scoreValue}%`;

    if (resultHeadline && resultMotivation) {
      if (scoreValue >= 90) {
        resultHeadline.textContent = "Excellent 🔥";
        resultMotivation.textContent = "This is island-rank level performance.";
      } else if (scoreValue >= 75) {
        resultHeadline.textContent = "Strong 💪";
        resultMotivation.textContent = "You're close to top level. Keep pushing.";
      } else if (scoreValue >= 50) {
        resultHeadline.textContent = "Improving 📈";
        resultMotivation.textContent = "You're building the foundation. Stay consistent.";
      } else {
        resultHeadline.textContent = "Keep Going ⚡";
        resultMotivation.textContent = "Every mistake is training. Don't stop now.";
      }
    }

    resultSummary.innerHTML = `
      <div><strong>Total Questions:</strong> ${getCurrentTotalCount()}</div>
      <div><strong>Answered Questions:</strong> ${answeredQuestions}</div>
      <div><strong>Correct:</strong> ${correct}</div>
      <div><strong>Wrong:</strong> ${wrong}</div>
      <div><strong>Unanswered:</strong> ${unanswered}</div>
      <div><strong>Score:</strong> ${correct} / ${answeredQuestions > 0 ? answeredQuestions : 0}</div>
      <div><strong>Percentage:</strong> ${answeredQuestions > 0 ? scorePercent : "0.0"}%</div>
      ${
        mode === "full"
          ? `<div><strong>Full Quiz Percentage:</strong> ${fullQuizPercentage}% out of all ${totalQuestions} questions</div>`
          : ""
      }
      <div><strong>Mastery:</strong> ${masteryLevel}</div>
      <div><strong>Last Played:</strong> ${today}</div>
      <div><strong>Streak:</strong> ${newData.streak} day${newData.streak === 1 ? "" : "s"}</div>
      ${
        earnedBadge
          ? `<div><strong>Badge Earned:</strong> <span class="${earnedBadge.className}">${earnedBadge.label}</span></div>`
          : mode === "full"
          ? `<div><strong>Badge Earned:</strong> None</div>`
          : ""
      }
      <div><strong>Wrong Question Numbers:</strong> ${wrongQuestions.length ? wrongQuestions.join(", ") : "None"}</div>
      <div><strong>Result Mode:</strong> ${modeText}</div>
    `;

    reviewMode = true;
    wrongQuestionsGlobal = [...wrongQuestions];
    wrongQuestionPointer = 0;
    isQuizActive = false;

    reviewNote.style.display = "block";
    resultCard.style.display = "block";
    historyCard.style.display = "block";
    postResultActions.style.display = "flex";
    retryQuizBtn.style.display = "inline-flex";
    wrongOnlyBtn.style.display = wrongQuestionsGlobal.length > 0 ? "inline-flex" : "none";
    retryWrongBtn.style.display = wrongQuestions.length > 0 ? "inline-flex" : "none";
    retryUnansweredBtn.style.display = unanswered > 0 ? "inline-flex" : "none";
    retryMarkedBtn.style.display = flaggedQuestions.size > 0 ? "inline-flex" : "none";

    hideHintBox();
    closeJumpWrap();
    stopTimers();
    scheduleRender(updateQuestionView);
    scrollQuestionIntoView();

    if (pendingServiceWorkerUpdate) {
      setTimeout(async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();

          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          window.location.reload();
        } catch (error) {
          console.log("Auto update after quiz error:", error);
        }
      }, 1500);
    }
  }

  function showResult(mode) {
    const questionList =
      retryModeType === "list" || practiceWrongOnlyMode
        ? [...retryQuestionList]
        : Array.from({ length: totalQuestions }, (_, i) => i + 1);

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let wrongQuestions = [];
    let answeredQuestions = 0;

    for (const questionNumber of questionList) {
      const userAnswer = userAnswers[questionNumber];
      const validAnswers = answerKey[String(questionNumber)] || [];

      if (userAnswer === undefined) {
        unanswered++;
        continue;
      }

      answeredQuestions++;

      if (validAnswers.includes(userAnswer)) {
        correct++;
      } else {
        wrong++;
        wrongQuestions.push(questionNumber);
      }
    }

    finalizeAttempt(correct, wrong, unanswered, answeredQuestions, wrongQuestions, mode);
  }

  function goToQuestionByActualNumber(questionNumber) {
    const target = Number(questionNumber);
    if (!Number.isFinite(target)) return;

    if (retryModeType === "list" || practiceWrongOnlyMode) {
      const index = retryQuestionList.indexOf(target);
      if (index === -1) return;
      currentDisplayIndex = index + 1;
    } else {
      if (target < 1 || target > totalQuestions) return;
      currentQuestion = target;
    }

    scheduleRender(updateQuestionView);
    scrollQuestionIntoView();
  }

  function promptJumpToQuestion() {
    const willShow = !jumpWrap.classList.contains("show");
    showJumpWrap(willShow);

    if (willShow) {
      jumpInput.max = String(getCurrentTotalCount());
      jumpInput.value = String(getCurrentShownIndex());
      setTimeout(() => jumpInput.focus(), 30);
    }
  }

  function restoreSessionUI(savedSession) {
    if (!savedSession) return;

    currentQuestion = Number(savedSession.currentQuestion) || 1;
    currentDisplayIndex = Number(savedSession.currentDisplayIndex) || 1;
    userAnswers = savedSession.userAnswers || {};
    flaggedQuestions = new Set(Array.isArray(savedSession.flaggedQuestions) ? savedSession.flaggedQuestions : []);
    practiceWrongOnlyMode = Boolean(savedSession.practiceWrongOnlyMode);
    retryModeType = savedSession.retryModeType || (savedSession.practiceWrongOnlyMode ? "list" : "full");
    retryQuestionList = Array.isArray(savedSession.retryQuestionList) && savedSession.retryQuestionList.length
      ? savedSession.retryQuestionList
      : [];
    quizElapsedSeconds = Number(savedSession.quizElapsedSeconds) || 0;
    questionElapsedSeconds = Number(savedSession.questionElapsedSeconds) || 0;

    reviewMode = false;
    wrongQuestionsGlobal = [];
    wrongQuestionPointer = 0;
    isQuizActive = true;

    reviewNote.style.display = "none";
    resultCard.style.display = "none";
    postResultActions.style.display = "none";
    answerExplanation.style.display = "none";
    hideHintBox();

    closeJumpWrap();
    scheduleRender(updateQuestionView);
    updateTimerDisplays();
    startTimers();
    scrollQuestionIntoView("auto");
  }

  function checkResumeCard() {
    const savedSession = getSavedSession();
    if (!savedSession || !savedSession.userAnswers || Object.keys(savedSession.userAnswers).length === 0) {
      resumeCard.style.display = "none";
      return;
    }

    const answered = Object.keys(savedSession.userAnswers).length;
    const savedAt = savedSession.savedAt ? new Date(savedSession.savedAt).toLocaleString() : "Earlier";
    resumeSummary.textContent = `Answered ${answered} question(s). Saved at ${savedAt}.`;
    resumeCard.style.display = "block";

    resumeQuizBtn.onclick = () => {
      resumeCard.style.display = "none";
      restoreSessionUI(savedSession);
    };

    discardResumeBtn.onclick = () => {
      clearSavedSession();
      resumeCard.style.display = "none";
      resetCurrentQuizState();
    };
  }

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (reviewMode) return;
      
      const questionNumber = getCurrentQuestionNumber();
      userAnswers[questionNumber] = Number(button.dataset.answer);
      
      updateAnswerButtons();
      updateSubmitVisibility();
      updateMotivationBar();
      smartSaveSession();

      const total = getCurrentTotalCount();
      const index = getCurrentShownIndex();

      if (index < total) {
        setTimeout(() => {
          if (!reviewMode) {
            nextBtn.click();
          }
        }, 250);
      }
    });
  });

  prevBtn.addEventListener("click", () => {
    const shownIndex = getCurrentShownIndex();

    if (shownIndex > 1) {
      if (retryModeType === "list" || practiceWrongOnlyMode) {
        currentDisplayIndex--;
      } else {
        currentQuestion--;
      }
      scheduleRender(updateQuestionView);
    }
  });

  nextBtn.addEventListener("click", () => {
    const shownIndex = getCurrentShownIndex();
    const total = getCurrentTotalCount();

    if (shownIndex < total) {
      if (retryModeType === "list" || practiceWrongOnlyMode) {
        currentDisplayIndex++;
      } else {
        currentQuestion++;
      }
      scheduleRender(updateQuestionView);
    }
  });

  refreshQuizBtn.addEventListener("click", () => {
    document.body.classList.add("page-is-refreshing");
    setTimeout(() => {
      window.location.reload();
    }, 120);
  });

  retryQuizBtn.addEventListener("click", resetCurrentQuizState);

  retryWrongBtn.addEventListener("click", () => {
    if (!wrongQuestionsGlobal.length) return;
    practiceWrongOnlyMode = false;
    startListRetryMode(wrongQuestionsGlobal);
  });

  retryUnansweredBtn.addEventListener("click", () => {
    const unanswered = getQuestionListForCurrentMode().filter((q) => userAnswers[q] === undefined);
    if (!unanswered.length) return;
    practiceWrongOnlyMode = false;
    startListRetryMode(unanswered);
  });

  retryMarkedBtn.addEventListener("click", () => {
    const marked = getQuestionListForCurrentMode().filter((q) => flaggedQuestions.has(q));
    if (!marked.length) return;
    practiceWrongOnlyMode = false;
    startListRetryMode(marked);
  });

  wrongOnlyBtn.addEventListener("click", () => {
    if (!wrongQuestionsGlobal.length) return;

    const questionNo = wrongQuestionsGlobal[wrongQuestionPointer];
    goToQuestionByActualNumber(questionNo);

    wrongQuestionPointer++;
    if (wrongQuestionPointer >= wrongQuestionsGlobal.length) {
      wrongQuestionPointer = 0;
    }
  });

  submitQuizBtn.addEventListener("click", () => showResult("full"));

  finishQuizBtn.addEventListener("click", () => {
    const mode =
      retryModeType === "list" || practiceWrongOnlyMode ? "custom-list" : "partial";
    showResult(mode);
  });

  markReviewBtn.addEventListener("click", () => {
    if (reviewMode) return;
    const q = getCurrentQuestionNumber();

    if (flaggedQuestions.has(q)) {
      flaggedQuestions.delete(q);
    } else {
      flaggedQuestions.add(q);
    }

    updateSubmitVisibility();
    smartSaveSession();
  });

  jumpBtn.addEventListener("click", promptJumpToQuestion);

  jumpConfirmBtn.addEventListener("click", () => {
    const value = Number(jumpInput.value);
    if (!Number.isFinite(value)) return;

    if (retryModeType === "list" || practiceWrongOnlyMode) {
      const actualQuestion = retryQuestionList[value - 1];
      if (actualQuestion) {
        currentDisplayIndex = value;
        scheduleRender(updateQuestionView);
        closeJumpWrap();
        jumpInput.blur();
        scrollQuestionIntoView();
      }
    } else if (value >= 1 && value <= totalQuestions) {
      currentQuestion = value;
      scheduleRender(updateQuestionView);
      closeJumpWrap();
      jumpInput.blur();
      scrollQuestionIntoView();
    }
  });

  jumpInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      jumpConfirmBtn.click();
    }
  });

  questionImage.addEventListener("error", () => {
    questionImage.alt = "Question image not found";
  });

  function openImageModal() {
    modalImage.src = questionImage.src;
    modalScale = 1;
    modalImage.style.transform = "scale(1)";
    imageModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    imageModal.style.display = "none";
    document.body.style.overflow = "";
    modalScale = 1;
    modalImage.style.transform = `scale(${modalScale})`;
  }

  function applyModalScale() {
    if (modalScale < 1) modalScale = 1;
    if (modalScale > 3) modalScale = 3;
    modalImage.style.transform = `scale(${modalScale})`;
  }

  zoomBtn.addEventListener("click", openImageModal);
  questionImage.addEventListener("click", openImageModal);
  closeImageModal.addEventListener("click", closeModal);

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) closeModal();
  });

  modalImage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      modalScale += e.deltaY < 0 ? 0.15 : -0.15;
      applyModalScale();
    },
    { passive: false }
  );

  imageModalViewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDistance = Math.hypot(dx, dy);
      }
    },
    { passive: true }
  );

  imageModalViewport.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);

        if (pinchStartDistance) {
          const ratio = currentDistance / pinchStartDistance;
          modalScale *= ratio;
          pinchStartDistance = currentDistance;
          applyModalScale();
        }
      }
    },
    { passive: true }
  );

  imageModalViewport.addEventListener("touchend", () => {
    pinchStartDistance = 0;
  });

  window.addEventListener("beforeunload", () => {
    saveCurrentSession();

    if (!pendingServiceWorkerUpdate) return;

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch((error) => {
        console.log("SW apply on unload warning:", error);
      });
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        pendingServiceWorkerUpdate = true;
        showToast("New update available after quiz 🚀");
        console.log("Update will apply after quiz.");
      }
    });
  }

  const loaded = await loadQuizData();
  if (!loaded) return;

  renderAttemptInfo();
  renderPerformanceCard();
  renderHistoryCard();
  updateTimerDisplays();
  updateQuestionView();
  checkResumeCard();

  if (resumeCard.style.display === "none") {
    startTimers();
  }
});
