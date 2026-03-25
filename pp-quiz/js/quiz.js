const params = new URLSearchParams(window.location.search);
const topic = params.get("topic");
const subtopic = params.get("subtopic");
const setName = params.get("set");

const quizTitle = document.getElementById("quizTitle");
const backToSubtopic = document.getElementById("backToSubtopic");

function makeNiceTitle(slug) {
  return (slug || "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

quizTitle.textContent = `${makeNiceTitle(subtopic)} - ${makeNiceTitle(setName)}`;
backToSubtopic.href = `/DN_Physics/pp-quiz/subtopic.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}`;
