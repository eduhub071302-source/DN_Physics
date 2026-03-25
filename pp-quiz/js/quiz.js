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
const wrongOnlyBtn = document.getElementById("wrongOnlyBtn");

function makeNiceTitle(slug) {
  return (slug || "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  } catch {
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
    `;
    return;
  }

  attemptInfo.innerHTML = `
    <div><strong>Last Score:</strong> ${saved.lastCorrect} / ${saved.lastAnswered} (${saved.lastPercentage}%)</div>
    <div><strong>Best Score:</strong> ${saved.bestCorrect} / ${saved.bestAnswered} (${saved.bestPercentage}%)</div>
    <div><strong>Attempts:</strong> ${saved.attempts}</div>
  `;
}

function getAnsweredCount() {
  return Object.keys(userAnswers).length;
}

function clearReviewClasses() {
  answerButtons.forEach((button) => {
    button.classList.remove("selected", "correct-answer", "wrong-answer", "review-dim");
  });
}

function updateAnswerButtons() {
  clearReviewClasses();

  const selected = userAnswers[currentQuestion];
  const validAnswers = answerKey[currentQuestion] || [];

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
  answeredCounter.textContent = `Answered: ${answeredCount} / ${totalQuestions}`;

  submitQuizBtn.style.display =
    answeredCount === totalQuestions && !reviewMode ? "inline-flex" : "none";

  finishQuizBtn.disabled = reviewMode;
}

function updateQuestionView() {
  questionCounter.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
  questionImage.src = getImagePath(currentQuestion);
  questionImage.alt = `${makeNiceTitle(subtopic)} question ${currentQuestion}`;

  prevBtn.disabled = currentQuestion === 1;
  nextBtn.disabled = currentQuestion === totalQuestions;

  updateAnswerButtons();
  updateSubmitVisibility();
}

function resetCurrentQuizState() {
  currentQuestion = 1;
  userAnswers = {};
  reviewMode = false;
  wrongQuestionsGlobal = [];
  wrongQuestionPointer = 0;

  reviewNote.style.display = "none";
  resultCard.style.display = "none";
  postResultActions.style.display = "none";
  wrongOnlyBtn.style.display = "none";

  updateQuestionView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finalizeAttempt(correct, wrong, unanswered, answeredQuestions, wrongQuestions, mode) {
  const percentageBase = answeredQuestions > 0 ? answeredQuestions : 1;
  const scorePercent = ((correct / percentageBase) * 100).toFixed(1);

  const previous = loadAttemptData();
  const previousBestPercentage = previous ? Number(previous.bestPercentage) : -1;
  const bestShouldUpdate = Number(scorePercent) > previousBestPercentage;

  const newData = {
    lastCorrect: correct,
    lastAnswered: answeredQuestions,
    lastPercentage: scorePercent,
    bestCorrect: bestShouldUpdate ? correct : previous?.bestCorrect ?? correct,
    bestAnswered: bestShouldUpdate ? answeredQuestions : previous?.bestAnswered ?? answeredQuestions,
    bestPercentage: bestShouldUpdate ? scorePercent : previous?.bestPercentage ?? scorePercent,
    attempts: (previous?.attempts || 0) + 1
  };

  saveAttemptData(newData);
  renderAttemptInfo();

  const modeText =
    mode === "full"
      ? "Calculated from all answered questions after full submit."
      : "Calculated only from answered questions after finishing now.";

  resultSummary.innerHTML = `
    <div><strong>Total Questions:</strong> ${totalQuestions}</div>
    <div><strong>Answered Questions:</strong> ${answeredQuestions}</div>
    <div><strong>Correct:</strong> ${correct}</div>
    <div><strong>Wrong:</strong> ${wrong}</div>
    <div><strong>Unanswered:</strong> ${unanswered}</div>
    <div><strong>Score:</strong> ${correct} / ${answeredQuestions > 0 ? answeredQuestions : 0}</div>
    <div><strong>Percentage:</strong> ${answeredQuestions > 0 ? scorePercent : "0.0"}%</div>
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

  updateQuestionView();
  resultCard.scrollIntoView({ behavior: "smooth" });
}

function showResult(mode) {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let wrongQuestions = [];
  let answeredQuestions = 0;

  for (let i = 1; i <= totalQuestions; i++) {
    const userAnswer = userAnswers[i];
    const validAnswers = answerKey[i] || [];

    if (!userAnswer) {
      unanswered++;
      continue;
    }

    answeredQuestions++;

    if (validAnswers.includes(userAnswer)) {
      correct++;
    } else {
      wrong++;
      wrongQuestions.push(i);
    }
  }

  finalizeAttempt(correct, wrong, unanswered, answeredQuestions, wrongQuestions, mode);
}

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (reviewMode) return;
    userAnswers[currentQuestion] = Number(button.dataset.answer);
    updateAnswerButtons();
    updateSubmitVisibility();
  });
});

prevBtn.addEventListener("click", () => {
  if (currentQuestion > 1) {
    currentQuestion--;
    updateQuestionView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  if (currentQuestion < totalQuestions) {
    currentQuestion++;
    updateQuestionView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

retryQuizBtn.addEventListener("click", resetCurrentQuizState);

wrongOnlyBtn.addEventListener("click", () => {
  if (!wrongQuestionsGlobal.length) return;

  currentQuestion = wrongQuestionsGlobal[wrongQuestionPointer];
  updateQuestionView();
  window.scrollTo({ top: 0, behavior: "smooth" });

  wrongQuestionPointer++;
  if (wrongQuestionPointer >= wrongQuestionsGlobal.length) {
    wrongQuestionPointer = 0;
  }
});

submitQuizBtn.addEventListener("click", () => showResult("full"));
finishQuizBtn.addEventListener("click", () => showResult("partial"));

questionImage.addEventListener("error", () => {
  questionImage.alt = "Question image not found";
});

renderAttemptInfo();
updateQuestionView();
