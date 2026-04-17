const APP_PATH = "";

function prettifySubject(name) {
  return (name || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function createDashCard(title, desc, btnText, link) {
  return `
    <div class="card">
      <h3>${title}</h3>
      <p>${desc}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${link}">${btnText}</a>
      </div>
    </div>
  `;
}

function getCurrentUserId() {
  try {
    const firebaseUid = window.firebaseAuth?.currentUser?.uid;
    if (firebaseUid) return firebaseUid;

    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.id) return cachedUser.id;
  } catch (error) {
    console.warn("Could not resolve current user id:", error);
  }

  return "guest";
}

function getLastPdf() {
  try {
    return JSON.parse(
      localStorage.getItem(`dnPdfLastOpened_${getCurrentUserId()}`),
    );
  } catch {
    return null;
  }
}

function getRecentPdfs() {
  try {
    return (
      JSON.parse(localStorage.getItem(`dnPdfRecent_${getCurrentUserId()}`)) || []
    );
  } catch {
    return [];
  }
}

function getFavorites() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(`dnPdfFavorites_${getCurrentUserId()}`),
      ) || []
    );
  } catch {
    return [];
  }
}

function getQuizProgress() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(`dnPhysicsQuizProgress_${getCurrentUserId()}`),
      ) || {}
    );
  } catch {
    return {};
  }
}

function getTotalQuizAttempts() {
  const store = getQuizProgress();
  return Object.values(store).reduce((sum, item) => {
    return sum + (Number(item?.attempts) || 0);
  }, 0);
}

function parseQuizKey(rawKey) {
  if (!rawKey) {
    return {
      subject: "physics",
      topic: "",
      subtopic: "",
      set: "set-1",
    };
  }

  const parts = rawKey.split("__");

  if (parts.length >= 4) {
    return {
      subject: parts[0] || "physics",
      topic: parts[1] || "",
      subtopic: parts[2] || "",
      set: parts[3] || "set-1",
    };
  }

  if (parts.length === 3) {
    return {
      subject: "physics",
      topic: parts[0] || "",
      subtopic: parts[1] || "",
      set: parts[2] || "set-1",
    };
  }

  return {
    subject: "physics",
    topic: "",
    subtopic: "",
    set: "set-1",
  };
}

function buildQuizUrlFromKey(rawKey) {
  const parsed = parseQuizKey(rawKey);

  if (!parsed.topic) {
    return `${APP_PATH}/pp-quiz/index.html`;
  }

  if (!parsed.subtopic) {
    return `${APP_PATH}/pp-quiz/index.html?subject=${encodeURIComponent(parsed.subject)}`;
  }

  return `${APP_PATH}/pp-quiz/quiz.html?subject=${encodeURIComponent(parsed.subject)}&topic=${encodeURIComponent(parsed.topic)}&subtopic=${encodeURIComponent(parsed.subtopic)}&set=${encodeURIComponent(parsed.set)}`;
}

function prettifyQuizLabel(parsed) {
  const subjectName = prettifySubject(parsed.subject || "physics");
  const topicName = prettifySubject(parsed.topic || "");
  const subtopicName = prettifySubject(parsed.subtopic || "");

  if (topicName && subtopicName) {
    return `${subjectName} · ${topicName} · ${subtopicName}`;
  }

  if (subtopicName) {
    return `${subjectName} · ${subtopicName}`;
  }

  if (topicName) {
    return `${subjectName} · ${topicName}`;
  }

  return subjectName;
}

function getBestQuiz() {
  const store = getQuizProgress();
  let best = null;
  let bestKey = null;

  Object.entries(store).forEach(([key, item]) => {
    const currentBest = Number(item.bestPercentage || 0);
    const bestBest = Number(best?.bestPercentage || 0);

    if (!best || currentBest > bestBest) {
      best = item;
      bestKey = key;
    }
  });

  return bestKey ? { key: bestKey, ...best } : null;
}

function getWeakQuiz() {
  const store = getQuizProgress();
  let weak = null;
  let weakKey = null;

  Object.entries(store).forEach(([key, item]) => {
    const attempts = Number(item.attempts || 0);
    if (attempts <= 0) return;

    const currentBest = Number(item.bestPercentage || 100);
    const weakBest = Number(weak?.bestPercentage || 100);

    if (!weak || currentBest < weakBest) {
      weak = item;
      weakKey = key;
    }
  });

  return weakKey ? { key: weakKey, ...weak } : null;
}

function getMostStudiedSubject(recent) {
  if (!recent.length) return null;

  const count = {};

  recent.forEach((item) => {
    if (!item.subject) return;
    count[item.subject] = (count[item.subject] || 0) + 1;
  });

  let max = 0;
  let best = null;

  Object.entries(count).forEach(([key, val]) => {
    if (val > max) {
      max = val;
      best = key;
    }
  });

  return best || null;
}

function getMostStudiedQuizSubject() {
  const store = getQuizProgress();
  const counts = {};

  Object.entries(store).forEach(([rawKey, item]) => {
    const parsed = parseQuizKey(rawKey);
    const subject = parsed.subject || "default";
    const attempts = Number(item?.attempts) || 0;
    if (attempts <= 0) return;

    counts[subject] = (counts[subject] || 0) + attempts;
  });

  let best = null;
  let max = 0;

  Object.entries(counts).forEach(([subject, total]) => {
    if (total > max) {
      max = total;
      best = subject;
    }
  });

  return best ? prettifySubject(best) : null;
}

function getSubjectRouteMeta(subjectSlug = "") {
  const slug = String(subjectSlug || "").trim().toLowerCase();

  const physicsSubjects = new Set([
    "current-electricity",
    "gravitational-field",
    "units"
  ]);

  const mainMathsSubjects = new Set([
    "vectors",
    "system-of-coplanar-forces-acting-on-a-particle",
    "parallel-forces-moments-couples",
    "coplanar-forces-acting-on-a-rigid-body",
    "jointed-rods",
    "frameworks",
    "centre-of-gravity",
    "friction"
  ]);

  const basicMathsAlgebraSubjects = new Set([
    "binomial-expansion",
    "factorisation",
    "algebraic-fractions",
    "equations",
    "indices-and-logarithms",
    "ratio-and-proportions"
  ]);

  const basicMathsGeometrySubjects = new Set([
    "rectangles-in-connection-with-circles",
    "pythagoras-theorem-and-extensions",
    "bisector-theorem",
    "area",
    "concurrencies-connected-with-triangles"
  ]);

  if (physicsSubjects.has(slug)) {
    return {
      stream: "physics",
      group: "",
      subject: slug,
      url: `${APP_PATH}/subjects/index.html?stream=physics&subject=${encodeURIComponent(slug)}`
    };
  }

  if (mainMathsSubjects.has(slug)) {
    return {
      stream: "main-maths",
      group: "",
      subject: slug,
      url: `${APP_PATH}/subjects/index.html?stream=main-maths&subject=${encodeURIComponent(slug)}`
    };
  }

  if (basicMathsAlgebraSubjects.has(slug)) {
    return {
      stream: "basic-maths",
      group: "algebra",
      subject: slug,
      url: `${APP_PATH}/subjects/index.html?stream=basic-maths&group=algebra&subject=${encodeURIComponent(slug)}`
    };
  }

  if (basicMathsGeometrySubjects.has(slug)) {
    return {
      stream: "basic-maths",
      group: "geometry",
      subject: slug,
      url: `${APP_PATH}/subjects/index.html?stream=basic-maths&group=geometry&subject=${encodeURIComponent(slug)}`
    };
  }

  return {
    stream: "",
    group: "",
    subject: slug,
    url: `${APP_PATH}/notes/index.html`
  };
}

function buildViewerUrlFromEntry(entry) {
  if (!entry?.url) {
    return `${APP_PATH}/notes/index.html`;
  }

  const routeMeta = getSubjectRouteMeta(entry.subject || "");

  let url =
    `${APP_PATH}/topics/viewer.html?pdf=${encodeURIComponent(entry.url)}` +
    `&title=${encodeURIComponent(entry.title || "")}` +
    `&subjectName=${encodeURIComponent(prettifySubject(entry.subject || ""))}`;

  if (routeMeta.stream) {
    url += `&stream=${encodeURIComponent(routeMeta.stream)}`;
  }

  if (routeMeta.group) {
    url += `&group=${encodeURIComponent(routeMeta.group)}`;
  }

  if (routeMeta.subject) {
    url += `&subject=${encodeURIComponent(routeMeta.subject)}`;
  }

  url += `&back=${encodeURIComponent(routeMeta.url)}`;

  return url;
}

function renderDashboard() {
  const dashboardGrid = document.getElementById("dashboardGrid");
  if (!dashboardGrid) return;

  let html = "";

  const lastPdf = getLastPdf();
  const recent = getRecentPdfs();
  const favorites = getFavorites();
  const mostStudiedNoteSubject = getMostStudiedSubject(recent);
  const mostStudiedQuizSubject = getMostStudiedQuizSubject();

  if (lastPdf && lastPdf.url) {
    html += createDashCard(
      "📘 Continue Reading",
      `${lastPdf.title || lastPdf.file || "Open your last note"}`,
      "Open Note",
      buildViewerUrlFromEntry(lastPdf),
    );
  }

  const totalQuizAttempts = getTotalQuizAttempts();

  html += createDashCard(
    "📊 Total Study Sessions",
    `${totalQuizAttempts} quiz attempt${totalQuizAttempts === 1 ? "" : "s"}`,
    "Open PP Quiz",
    `${APP_PATH}/pp-quiz/index.html`,
  );

  if (mostStudiedQuizSubject) {
    html += createDashCard(
      "🧠 Most Studied",
      `${mostStudiedQuizSubject}`,
      "Open PP Quiz",
      `${APP_PATH}/pp-quiz/index.html?subject=${encodeURIComponent(mostStudiedQuizSubject.toLowerCase())}`,
    );
  } else if (mostStudiedNoteSubject) {
    const routeMeta = getSubjectRouteMeta(mostStudiedNoteSubject);

    html += createDashCard(
      "🧠 Most Studied",
      `${prettifySubject(mostStudiedNoteSubject)}`,
      "Open Subject",
      routeMeta.url,
    );
  }

  if (favorites.length > 0) {
    html += createDashCard(
      "⭐ Favorites",
      `${favorites.length} saved topics`,
      "View Notes",
      `${APP_PATH}/notes/index.html`,
    );
  }

  const bestQuiz = getBestQuiz();
  if (bestQuiz) {
    const parsed = parseQuizKey(bestQuiz.key);
    html += createDashCard(
      "🔥 Best Topic",
      `${prettifyQuizLabel(parsed)} · Score: ${bestQuiz.bestPercentage || "0.0"}%`,
      "Improve Score",
      buildQuizUrlFromKey(bestQuiz.key),
    );
  }

  const weakQuiz = getWeakQuiz();
  if (weakQuiz && Number(weakQuiz.bestPercentage || 0) < 50) {
    const parsed = parseQuizKey(weakQuiz.key);
    html += createDashCard(
      "⚠️ Weak Area",
      `${prettifyQuizLabel(parsed)} · Score: ${weakQuiz.bestPercentage || "0.0"}%`,
      "Practice Now",
      buildQuizUrlFromKey(weakQuiz.key),
    );
  }

  const keepGoingLink = weakQuiz ? buildQuizUrlFromKey(weakQuiz.key) : `${APP_PATH}/pp-quiz/index.html`;
  const keepGoingText = weakQuiz
    ? `Return to ${prettifyQuizLabel(parseQuizKey(weakQuiz.key))} and improve your accuracy.`
    : "Consistency builds island rank. Stay focused.";

  html += createDashCard(
    "🚀 Keep Going",
    keepGoingText,
    "Continue Practice",
    keepGoingLink,
  );

  dashboardGrid.innerHTML =
    html ||
    `<div class="empty-state">Start learning to see your progress here 🚀</div>`;
}

async function checkCatalogVersion() {
  try {
    const res = await fetch(`${APP_PATH}/pdfs/catalog.json`, {
      cache: "no-store",
    });
    if (!res.ok) return;

    const items = await res.json();
    const lastVersion = localStorage.getItem("dn_catalog_version");
    const newVersion = String(JSON.stringify(items).length);

    if (lastVersion && lastVersion !== newVersion) {
      if (typeof window.showToast === "function") {
        window.showToast("📚 New notes added!");
      }
    }

    localStorage.setItem("dn_catalog_version", newVersion);
  } catch (error) {
    console.warn("Catalog version check skipped:", error);
  }
}

export { renderDashboard, checkCatalogVersion };
