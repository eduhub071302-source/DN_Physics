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

function dnIsOwnerModeSafe() {
  try {
    if (typeof window.isOwnerMode === "function") {
      return window.isOwnerMode();
    }
  } catch (error) {
    console.warn("dnIsOwnerModeSafe failed:", error);
  }

  return false;
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

function dnHasPaidOrOwnerAccess() {
  return dnIsOwnerModeSafe() || dnHasPaidAccessSafe();
}

function canAccessPdfFast(subject) {
  const normalizedSubject = dnNormalizeAccessSlug(subject);
  const freeSubjects = dnGetFreePdfSubjects();

  // ✅ Free subjects should always work immediately
  if (freeSubjects.includes(normalizedSubject)) {
    return true;
  }

  // ✅ Paid / owner unlocks all others
  if (dnHasPaidOrOwnerAccess()) {
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
  if (dnHasPaidOrOwnerAccess()) {
    return true;
  }

  return false;
}

function getPdfLockState(subject) {
  return {
    subject: subject || "",
    normalizedSubject: dnNormalizeAccessSlug(subject),
    freeSubjects: dnGetFreePdfSubjects(),
    hasPaidOrOwnerAccess: dnHasPaidOrOwnerAccess(),
    allowed: canAccessPdfFast(subject),
  };
}

function getQuizLockState(topic) {
  return {
    topic: topic || "",
    normalizedTopic: dnNormalizeAccessSlug(topic),
    freeTopics: dnGetFreeQuizTopics(),
    hasPaidOrOwnerAccess: dnHasPaidOrOwnerAccess(),
    allowed: canAccessQuizFast(topic),
  };
}

window.dnNormalizeAccessSlug = dnNormalizeAccessSlug;
window.dnGetFreePdfSubjects = dnGetFreePdfSubjects;
window.dnGetFreeQuizTopics = dnGetFreeQuizTopics;
window.dnIsOwnerModeSafe = dnIsOwnerModeSafe;
window.dnHasPaidAccessSafe = dnHasPaidAccessSafe;
window.dnHasPaidOrOwnerAccess = dnHasPaidOrOwnerAccess;
window.canAccessPdfFast = canAccessPdfFast;
window.canAccessQuizFast = canAccessQuizFast;
window.getPdfLockState = getPdfLockState;
window.getQuizLockState = getQuizLockState;
