// 🔐 Access Control Layer for DN Physics
// Stable access checks for notes and quiz

function dnNormalizeAccessSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function dnGetFreePdfSubjects() {
  return (window.DN_CONFIG?.ACCESS?.FREE_PDF_SUBJECTS || [])
    .map(dnNormalizeAccessSlug);
}

function dnGetFreeQuizTopics() {
  return (window.DN_CONFIG?.ACCESS?.FREE_QUIZ_TOPICS || [])
    .map(dnNormalizeAccessSlug);
}

function dnHasPaidAccessSafe() {
  try {
    if (typeof window.hasPaidAccess === "function") {
      return window.hasPaidAccess();
    }
  } catch (error) {
    console.warn("dnHasPaidAccessSafe failed:", error);
  }

  return false;
}

function dnHasPaidAccessOnly() {
  return dnHasPaidAccessSafe();
}

function canAccessPdfFast(subject) {
  const normalizedSubject = dnNormalizeAccessSlug(subject);
  const freeSubjects = dnGetFreePdfSubjects();

  // ✅ Free subjects should always work immediately
  if (freeSubjects.includes(normalizedSubject)) {
    return true;
  }

  // ✅ Paid / owner unlocks all others
  if (dnHasPaidAccessOnly()) {
    return true;
  }

  return false;
}

function canAccessQuizFast(topic) {
  const normalizedTopic = dnNormalizeAccessSlug(topic);
  const freeTopics = dnGetFreeQuizTopics();

  // ✅ Free quiz topics should always work immediately
  if (freeTopics.includes(normalizedTopic)) {
    return true;
  }

  // ✅ Paid / owner unlocks all others
  if (dnHasPaidAccessOnly()) {
    return true;
  }

  return false;
}

function getPdfLockState(subject) {
  return {
    subject: subject || "",
    normalizedSubject: dnNormalizeAccessSlug(subject),
    freeSubjects: dnGetFreePdfSubjects(),
    hasPaidAccess: dnHasPaidAccessOnly(),
    allowed: canAccessPdfFast(subject),
  };
}

function getQuizLockState(topic) {
  return {
    topic: topic || "",
    normalizedTopic: dnNormalizeAccessSlug(topic),
    freeTopics: dnGetFreeQuizTopics(),
    hasPaidAccess: dnHasPaidAccessOnly(),
    allowed: canAccessQuizFast(topic),
  };
}

window.dnNormalizeAccessSlug = dnNormalizeAccessSlug;
window.dnGetFreePdfSubjects = dnGetFreePdfSubjects;
window.dnGetFreeQuizTopics = dnGetFreeQuizTopics;
window.dnHasPaidAccessSafe = dnHasPaidAccessSafe;
window.canAccessPdfFast = canAccessPdfFast;
window.canAccessQuizFast = canAccessQuizFast;
window.getPdfLockState = getPdfLockState;
window.getQuizLockState = getQuizLockState;
