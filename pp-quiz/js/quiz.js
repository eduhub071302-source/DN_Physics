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

function makeNiceTitle(slug) {
  return (slug || "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const quizConfig = {
  "units": {
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

if (
  topic &&
  subtopic &&
  quizConfig[topic] &&
  quizConfig[topic][subtopic]
) {
  totalQuestions = quizConfig[topic][subtopic].totalQuestions;
  answerKey = quizConfig[topic][subtopic].answers;
}

quizTitle.textContent = `${makeNiceTitle(subtopic)} - ${makeNiceTitle(setName)}`;
quizSubtitle.textContent = `${makeNiceTitle(topic)} / ${makeNiceTitle(subtopic)}`;

backToSubtopic.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}`;

function getImagePath(questionNumber) {
  return `/DN_Physics/pp-quiz/images/${topic}/${subtopic}/q${questionNumber}.jpg`;
}

function getAnsweredCount() {
  return Object.keys(userAnswers).length;
}

function updateAnswerButtons() {
  const selected = userAnswers[currentQuestion];

  answerButtons.forEach((button) => {
    const buttonValue = Number(button.dataset.answer);
    button.classList.toggle("selected", buttonValue === selected);
  });
}

function updateSubmitVisibility() {
  const answeredCount = getAnsweredCount();
  answeredCounter.textContent = `Answered: ${answeredCount} / ${totalQuestions}`;

  if (answeredCount === totalQuestions) {
    submitQuizBtn.style.display = "inline-flex";
  } else {
    submitQuizBtn.style.display = "none";
  }
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

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedAnswer = Number(button.dataset.answer);
    userAnswers[currentQuestion] = selectedAnswer;
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

  const percentageBase = answeredQuestions > 0 ? answeredQuestions : 1;
  const scorePercent = ((correct / percentageBase) * 100).toFixed(1);

  const modeText =
    mode === "full"
      ? "Calculated from all questions."
      : "Calculated only from answered questions.";

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

  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth" });
}

submitQuizBtn.addEventListener("click", () => {
  showResult("full");
});

finishQuizBtn.addEventListener("click", () => {
  showResult("partial");
});

questionImage.addEventListener("error", () => {
  questionImage.alt = "Question image not found";
});

updateQuestionView();
