// 🔐 Access Control Layer for DN Physics
// Single source of truth for PDF and Quiz access checks

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

function dnHasPaidOrOwnerAccess() {
  try {
    if (typeof window.isOwnerMode === "function" && window.isOwnerMode()) {
      return true;
    }

    if (typeof window.hasPaidAccess === "function" && window.hasPaidAccess()) {
      return true;
    }
  } catch (error) {
    console.warn("dnHasPaidOrOwnerAccess failed:", error);
  }

  return false;
}

function canAccessPdfFast(subject) {
  if (dnHasPaidOrOwnerAccess()) return true;

  const normalizedSubject = dnNormalizeAccessSlug(subject);
  const freeSubjects = dnGetFreePdfSubjects();

  return freeSubjects.includes(normalizedSubject);
}

function canAccessQuizFast(topic) {
  if (dnHasPaidOrOwnerAccess()) return true;

  const normalizedTopic = dnNormalizeAccessSlug(topic);
  const freeTopics = dnGetFreeQuizTopics();

  return freeTopics.includes(normalizedTopic);
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

// Expose globals
window.dnNormalizeAccessSlug = dnNormalizeAccessSlug;
window.dnGetFreePdfSubjects = dnGetFreePdfSubjects;
window.dnGetFreeQuizTopics = dnGetFreeQuizTopics;
window.dnHasPaidOrOwnerAccess = dnHasPaidOrOwnerAccess;
window.canAccessPdfFast = canAccessPdfFast;
window.canAccessQuizFast = canAccessQuizFast;
window.getPdfLockState = getPdfLockState;
window.getQuizLockState = getQuizLockState;
