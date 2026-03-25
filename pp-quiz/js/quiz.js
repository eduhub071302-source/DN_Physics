document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");
  const setName = params.get("set");

  const quizTitle = document.getElementById("quizTitle");
  const quizSubtitle = document.getElementById("quizSubtitle");
  const backToSubtopic = document.getElementById("backToSubtopic");
  const questionCounter = document.getElementById("questionCounter");
  const answeredCounter = document.getElementById("answeredCounter");
  const questionImage = document.getElementById("questionImage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitQuizBtn = document.getElementById("submitQuizBtn");
  const finishQuizBtn = document.getElementById("finishQuizBtn");
  const resultCard = document.getElementById("resultCard");
  const resultSummary = document.getElementById("resultSummary");
  const answerButtons = Array.from(document.querySelectorAll(".answer-btn"));
  const attemptInfo = document.getElementById("attemptInfo");
  const reviewNote = document.getElementById("reviewNote");
  const postResultActions = document.getElementById("postResultActions");
  const retryQuizBtn = document.getElementById("retryQuizBtn");
  const retryWrongBtn = document.getElementById("retryWrongBtn");
  const wrongOnlyBtn = document.getElementById("wrongOnlyBtn");
  const zoomBtn = document.getElementById("zoomBtn");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeImageModal = document.getElementById("closeImageModal");
  const imageModalViewport = document.getElementById("imageModalViewport");

  const requiredElements = [
    quizTitle,
    quizSubtitle,
    backToSubtopic,
    questionCounter,
    answeredCounter,
    questionImage,
    prevBtn,
    nextBtn,
    submitQuizBtn,
    finishQuizBtn,
    resultCard,
    resultSummary,
    attemptInfo,
    reviewNote,
    postResultActions,
    retryQuizBtn,
    retryWrongBtn,
    wrongOnlyBtn,
    zoomBtn,
    imageModal,
    modalImage,
    closeImageModal,
    imageModalViewport
  ];

  if (requiredElements.some((el) => !el) || answerButtons.length === 0) {
    console.error("Quiz page elements missing. Check quiz.html IDs and classes.");
    return;
  }

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

  const quizConfig = {
    units: {
      "unit-dimensions": {
        totalQuestions: 32,
        answers: {
          1: [2],
          2: [3],
          3: [2],
          4: [1],
          5: [2],
          6: [4],
          7: [3],
          8: [2],
          9: [5],
          10: [4],
          11: [2],
          12: [5],
          13: [2],
          14: [3],
          15: [1],
          16: [2],
          17: [3, 4],
          18: [4],
          19: [5],
          20: [4],
          21: [3],
          22: [4],
          23: [5],
          24: [3],
          25: [4],
          26: [1],
          27: [1],
          28: [2],
          29: [5],
          30: [3],
          31: [1],
          32: [1]
        }
      }
    }
  };

  let currentQuestion = 1;
  let totalQuestions = 1;
  let answerKey = {};
  let userAnswers = {};
  let reviewMode = false;
  let wrongQuestionsGlobal = [];
  let wrongQuestionPointer = 0;
  let practiceWrongOnlyMode = false;
  let practiceWrongQuestions = [];
  let currentDisplayIndex = 1;
  let pinchStartDistance = 0;
  let modalScale = 1;

  if (topic && subtopic && quizConfig[topic] && quizConfig[topic][subtopic]) {
    totalQuestions = quizConfig[topic][subtopic].totalQuestions;
    answerKey = quizConfig[topic][subtopic].answers;
  }

  quizTitle.textContent = `${makeNiceTitle(subtopic)} - ${makeNiceTitle(setName)}`;
  quizSubtitle.textContent = `${makeNiceTitle(topic)} / ${makeNiceTitle(subtopic)}`;
  backToSubtopic.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}`;

  function getImagePath(questionNumber) {
    return `/DN_Physics/pp-quiz/images/${topic}/${subtopic}/q${questionNumber}.jpg`;
  }

  function getStorageKey() {
    return `dnphysics_ppquiz_${topic}_${subtopic}_${setName}`;
  }

  function loadAttemptData() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey())) || null;
    } catch (error) {
      return null;
    }
  }

  function saveAttemptData(data) {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  }

  function renderAttemptInfo() {
    const saved = loadAttemptData();

    if (!saved) {
      attemptInfo.innerHTML = `
        <div><strong>Last Score:</strong> No previous attempt</div>
        <div><strong>Best Score:</strong> No previous attempt</div>
        <div><strong>Attempts:</strong> 0</div>
        <div><strong>Badge System:</strong> Earn badges by scoring <strong>50%+</strong>, <strong>75%+</strong>, and <strong>90%+</strong> out of <strong>all questions</strong> in a <strong>full quiz</strong>.</div>
      `;
      return;
    }

    const badge = saved.bestFullBadgePercentage ? getBadgeData(saved.bestFullBadgePercentage) : null;

    attemptInfo.innerHTML = `
      <div><strong>Last Score:</strong> ${saved.lastCorrect} / ${saved.lastAnswered} (${saved.lastPercentage}%)</div>
      <div><strong>Best Score:</strong> ${saved.bestCorrect} / ${saved.bestAnswered} (${saved.bestPercentage}%)</div>
      <div><strong>Attempts:</strong> ${saved.attempts}</div>
      ${badge ? `<div><strong>Badge:</strong> <span class="${badge.className}">${badge.label}</span></div>` : ""}
      <div><strong>Badge System:</strong> Earn badges by scoring <strong>50%+</strong>, <strong>75%+</strong>, and <strong>90%+</strong> out of <strong>all questions</strong> in a <strong>full quiz</strong>.</div>
    `;
  }

  function getAnsweredCount() {
    return Object.keys(userAnswers).length;
  }

  function getCurrentQuestionNumber() {
    if (practiceWrongOnlyMode) {
      return practiceWrongQuestions[currentDisplayIndex - 1];
    }
    return currentQuestion;
  }

  function getCurrentTotalCount() {
    return practiceWrongOnlyMode ? practiceWrongQuestions.length : totalQuestions;
  }

  function clearReviewClasses() {
    answerButtons.forEach((button) => {
      button.classList.remove("selected", "correct-answer", "wrong-answer", "review-dim");
    });
  }

  function updateAnswerButtons() {
    clearReviewClasses();

    const questionNumber = getCurrentQuestionNumber();
    const selected = userAnswers[questionNumber];
    const validAnswers = answerKey[questionNumber] || [];

    if (!reviewMode) {
      answerButtons.forEach((button) => {
        const value = Number(button.dataset.answer);
        button.classList.toggle("selected", value === selected);
      });
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
  }

  function updateSubmitVisibility() {
    const answeredCount = getAnsweredCount();
    const currentTotal = getCurrentTotalCount();
    answeredCounter.textContent = `Answered: ${answeredCount} / ${currentTotal}`;

    const allAnswered =
      answeredCount === currentTotal && !reviewMode && !practiceWrongOnlyMode;

    submitQuizBtn.style.display = allAnswered ? "inline-flex" : "none";
    finishQuizBtn.style.display = allAnswered ? "none" : "inline-flex";
    finishQuizBtn.disabled = reviewMode;
  }

  function updateQuestionView() {
    const questionNumber = getCurrentQuestionNumber();
    const totalCount = getCurrentTotalCount();
    const shownIndex = practiceWrongOnlyMode ? currentDisplayIndex : currentQuestion;

    questionCounter.textContent = `Question ${shownIndex} of ${totalCount}`;
    questionImage.src = getImagePath(questionNumber);
    questionImage.alt = `${makeNiceTitle(subtopic)} question ${questionNumber}`;
    modalImage.src = questionImage.src;

    prevBtn.disabled = shownIndex === 1;
    nextBtn.disabled = shownIndex === totalCount;

    updateAnswerButtons();
    updateSubmitVisibility();
  }

  function resetCurrentQuizState() {
    currentQuestion = 1;
    currentDisplayIndex = 1;
    userAnswers = {};
    reviewMode = false;
    wrongQuestionsGlobal = [];
    wrongQuestionPointer = 0;
    practiceWrongOnlyMode = false;
    practiceWrongQuestions = [];

    reviewNote.style.display = "none";
    resultCard.style.display = "none";
    postResultActions.style.display = "none";
    wrongOnlyBtn.style.display = "none";
    retryWrongBtn.style.display = "none";
    finishQuizBtn.style.display = "inline-flex";
    submitQuizBtn.style.display = "none";

    updateQuestionView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startWrongOnlyPractice() {
    if (!wrongQuestionsGlobal.length) return;

    practiceWrongOnlyMode = true;
    practiceWrongQuestions = [...wrongQuestionsGlobal];
    currentDisplayIndex = 1;
    userAnswers = {};
    reviewMode = false;

    reviewNote.style.display = "none";
    resultCard.style.display = "none";
    postResultActions.style.display = "none";
    wrongOnlyBtn.style.display = "none";
    retryWrongBtn.style.display = "none";
    finishQuizBtn.style.display = "inline-flex";
    submitQuizBtn.style.display = "none";

    updateQuestionView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finalizeAttempt(correct, wrong, unanswered, answeredQuestions, wrongQuestions, mode) {
    const percentageBase = answeredQuestions > 0 ? answeredQuestions : 1;
    const scorePercent = ((correct / percentageBase) * 100).toFixed(1);

    const previous = loadAttemptData();
    const previousBestPercentage = previous ? Number(previous.bestPercentage) : -1;
    const bestShouldUpdate = Number(scorePercent) > previousBestPercentage;

    const fullQuizPercentage = ((correct / totalQuestions) * 100).toFixed(1);
    const previousBestFullBadgePercentage = previous?.bestFullBadgePercentage ?? null;
    const shouldUpdateFullBadge =
      mode === "full" &&
      (previousBestFullBadgePercentage === null ||
        Number(fullQuizPercentage) > Number(previousBestFullBadgePercentage));

    const newData = {
      lastCorrect: correct,
      lastAnswered: answeredQuestions,
      lastPercentage: scorePercent,
      bestCorrect: bestShouldUpdate ? correct : previous?.bestCorrect ?? correct,
      bestAnswered: bestShouldUpdate ? answeredQuestions : previous?.bestAnswered ?? answeredQuestions,
      bestPercentage: bestShouldUpdate ? scorePercent : previous?.bestPercentage ?? scorePercent,
      attempts: (previous?.attempts || 0) + 1,
      bestFullBadgePercentage: shouldUpdateFullBadge
        ? fullQuizPercentage
        : previousBestFullBadgePercentage
    };

    saveAttemptData(newData);
    renderAttemptInfo();

    const earnedBadge = mode === "full" ? getBadgeData(fullQuizPercentage) : null;

    const modeText =
      mode === "full"
        ? "Calculated from all answered questions after full submit."
        : mode === "wrong-only"
        ? "Calculated from wrong-question practice only."
        : "Calculated only from answered questions after finishing now.";

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

    reviewNote.style.display = "block";
    resultCard.style.display = "block";
    postResultActions.style.display = "flex";
    retryQuizBtn.style.display = "inline-flex";
    wrongOnlyBtn.style.display = wrongQuestionsGlobal.length > 0 ? "inline-flex" : "none";
    retryWrongBtn.style.display = wrongQuestions.length > 0 ? "inline-flex" : "none";

    updateQuestionView();
    resultCard.scrollIntoView({ behavior: "smooth" });
  }

  function showResult(mode) {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let wrongQuestions = [];
    let answeredQuestions = 0;

    const questionList = practiceWrongOnlyMode
      ? practiceWrongQuestions
      : Array.from({ length: totalQuestions }, (_, i) => i + 1);

    for (const questionNumber of questionList) {
      const userAnswer = userAnswers[questionNumber];
      const validAnswers = answerKey[questionNumber] || [];

      if (!userAnswer) {
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

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (reviewMode) return;
      const questionNumber = getCurrentQuestionNumber();
      userAnswers[questionNumber] = Number(button.dataset.answer);
      updateAnswerButtons();
      updateSubmitVisibility();
    });
  });

  prevBtn.addEventListener("click", () => {
    if (practiceWrongOnlyMode) {
      if (currentDisplayIndex > 1) {
        currentDisplayIndex--;
        updateQuestionView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (currentQuestion > 1) {
      currentQuestion--;
      updateQuestionView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextBtn.addEventListener("click", () => {
    if (practiceWrongOnlyMode) {
      if (currentDisplayIndex < practiceWrongQuestions.length) {
        currentDisplayIndex++;
        updateQuestionView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (currentQuestion < totalQuestions) {
      currentQuestion++;
      updateQuestionView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  retryQuizBtn.addEventListener("click", resetCurrentQuizState);
  retryWrongBtn.addEventListener("click", startWrongOnlyPractice);

  wrongOnlyBtn.addEventListener("click", () => {
    if (!wrongQuestionsGlobal.length) return;

    currentQuestion = wrongQuestionsGlobal[wrongQuestionPointer];
    practiceWrongOnlyMode = false;
    updateQuestionView();
    window.scrollTo({ top: 0, behavior: "smooth" });

    wrongQuestionPointer++;
    if (wrongQuestionPointer >= wrongQuestionsGlobal.length) {
      wrongQuestionPointer = 0;
    }
  });

  submitQuizBtn.addEventListener("click", () => showResult("full"));
  finishQuizBtn.addEventListener("click", () =>
    showResult(practiceWrongOnlyMode ? "wrong-only" : "partial")
  );

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

  renderAttemptInfo();
  updateQuestionView();
});
