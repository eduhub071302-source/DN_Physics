// 🔐 Unlock System (Global)

function hasPaidAccess() {
  return localStorage.getItem("dn_paid_unlock") === "true";
}

function isOwnerMode() {
  return localStorage.getItem("dn_owner_mode") === "true";
}

function canAccessPdf(subject) {
  if (isOwnerMode() || hasPaidAccess()) return true;
  return DN_CONFIG.FREE_PDF_SUBJECTS.includes(subject);
}

function canAccessQuiz(topic) {
  if (isOwnerMode() || hasPaidAccess()) return true;
  return DN_CONFIG.FREE_QUIZ_TOPICS.includes(topic);
}

function unlockWithOwnerCode(code) {
  if (code === DN_CONFIG.OWNER_CODE) {
    localStorage.setItem("dn_owner_mode", "true");
    localStorage.setItem("dn_paid_unlock", "true");
    alert("Owner mode activated 🔓");
    location.reload();
  } else {
    alert("Invalid code ❌");
  }
}

// 🔥 TEMP (for testing payment)
function simulatePurchase() {
  localStorage.setItem("dn_paid_unlock", "true");
  alert("Unlocked all content 🎉");
  location.reload();
}

function lockAlert() {
  alert("🔒 Locked content\nBuy full access for Rs.100");
}
