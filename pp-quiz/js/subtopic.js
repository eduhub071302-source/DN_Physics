const params = new URLSearchParams(window.location.search);
const topic = params.get("topic");
const subtopic = params.get("subtopic");

const subtopicTitle = document.getElementById("subtopicTitle");
const quizSetsGrid = document.getElementById("quizSetsGrid");
const backToTopic = document.getElementById("backToTopic");

backToTopic.href = `/DN_Physics/pp-quiz/topic.html?topic=${encodeURIComponent(topic || "")}`;

function makeNiceTitle(slug) {
  return (slug || "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

subtopicTitle.textContent = makeNiceTitle(subtopic);

const quizSets = [
  { slug: "set-1", title: "Set 1" }
];

quizSets.forEach((set) => {
  const card = document.createElement("a");
  card.className = "topic-card";
  card.href = `/DN_Physics/pp-quiz/quiz.html?topic=${encodeURIComponent(topic || "")}&subtopic=${encodeURIComponent(subtopic || "")}&set=${encodeURIComponent(set.slug)}`;
  card.innerHTML = `
    <h2>${set.title}</h2>
    <p>Start quiz</p>
  `;
  quizSetsGrid.appendChild(card);
});
