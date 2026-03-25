const params = new URLSearchParams(window.location.search);
const topic = params.get("topic");
const subtopic = params.get("subtopic");
const setName = params.get("set");

const quizTitle = document.getElementById("quizTitle");
const quizSubtitle = document.getElementById("quizSubtitle");
const backToSubtopic = document.getElementById("backToSubtopic");
const questionCounter = document.getElementById("questionCounter");
const questionImage = document.getElementById("questionImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function makeNiceTitle(slug) {
  return (slug || "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/*
  IMPORTANT:
  Add question counts here for each ready subtopic.
*/
const quizConfig = {
  "units": {
    "unit-dimensions": 32
  }
};

let currentQuestion = 1;
let totalQuestions = 1;

if (
  topic &&
  subtopic &&
  quizConfig[topic] &&
  quizConfig[topic][subtopic]
) {
  totalQuestions = quizConfig[topic][subtopic];
}

quizTitle.textContent = `${makeNiceTitle(subtopic)} - ${makeNiceTitle(setName)}`;
quizSubtitle.textContent = `${makeNiceTitle(topic)} / ${makeNiceTitle(subtopic)}`;

backToSubtopic.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}`;

function getImagePath(questionNumber) {
  return `/DN_Physics/pp-quiz/images/${topic}/${subtopic}/q${questionNumber}.jpg`;
}

function updateQuestionView() {
  questionCounter.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
  questionImage.src = getImagePath(currentQuestion);
  questionImage.alt = `${makeNiceTitle(subtopic)} question ${currentQuestion}`;

  prevBtn.disabled = currentQuestion === 1;
  nextBtn.disabled = currentQuestion === totalQuestions;
}

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

questionImage.addEventListener("error", () => {
  questionImage.alt = "Question image not found";
});

updateQuestionView();
