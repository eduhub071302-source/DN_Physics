// 🔄 DN Physics cloud progress sync (Firebase-only, user-scoped storage)

function dnGetCurrentUserId() {
  try {
    const firebaseUid = window.firebaseAuth?.currentUser?.uid;
    if (firebaseUid) return firebaseUid;

    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.id) return cachedUser.id;
  } catch (error) {
    console.warn("dnGetCurrentUserId failed:", error);
  }

  return "guest";
}

function dnGetProgressStorageKey() {
  return `dnPhysicsQuizProgress_${dnGetCurrentUserId()}`;
}

function dnGetProgressStore() {
  try {
    return JSON.parse(localStorage.getItem(dnGetProgressStorageKey())) || {};
  } catch {
    return {};
  }
}

function dnSetProgressStore(store) {
  localStorage.setItem(dnGetProgressStorageKey(), JSON.stringify(store || {}));
}

function dnClearProgressStoreForCurrentMode() {
  try {
    localStorage.removeItem(dnGetProgressStorageKey());
  } catch (error) {
    console.warn("dnClearProgressStoreForCurrentMode failed:", error);
  }
}

function dnParseProgressKey(key) {
  const parts = String(key || "").split("__");

  return {
    subject_slug: parts[0] || "",
    topic_slug: parts[1] || "",
    subtopic_slug: parts[2] || "",
    set_slug: parts[3] || "set-1",
  };
}

function dnBuildProgressKey(subject, topic, subtopic = "", setName = "set-1") {
  return `${subject || ""}__${topic || ""}__${subtopic || ""}__${setName || "set-1"}`;
}

async function dnGetAuthedUser() {
  try {
    const auth = window.firebaseAuth || null;
    return auth?.currentUser || null;
  } catch (error) {
    console.warn("dnGetAuthedUser failed:", error);
    return null;
  }
}

function dnGetProgressRef(userId) {
  const db = window.firebaseDb || null;
  const sdk = window.firebaseSdk || null;
  if (!db || !sdk?.ref) return null;
  return sdk.ref(db, `quiz_progress/${userId}`);
}

async function syncCloudProgressToLocal() {
  const user = await dnGetAuthedUser();
  if (!user || !navigator.onLine) return false;

  try {
    const sdk = window.firebaseSdk || null;
    const progressRef = dnGetProgressRef(user.uid);
    if (!sdk?.get || !progressRef) return false;

    const snapshot = await sdk.get(progressRef);
    if (!snapshot.exists()) return false;

    const cloudData = snapshot.val() || {};
    const local = dnGetProgressStore();

    Object.entries(cloudData).forEach(([key, row]) => {
      const existing = local[key] || {};

      local[key] = {
        ...existing,
        attempts: Number(row?.attempts) || 0,
        bestPercentage:
          row?.best_percentage == null
            ? existing.bestPercentage || "0.0"
            : String(row.best_percentage),
        lastPercentage:
          row?.last_percentage == null
            ? existing.lastPercentage || existing.bestPercentage || "0.0"
            : String(row.last_percentage),
        completedFullQuiz:
          row?.completed == null
            ? Boolean(existing.completedFullQuiz)
            : Boolean(row.completed),
      };
    });

    dnSetProgressStore(local);
    return true;
  } catch (error) {
    console.warn("Cloud -> local sync failed:", error);
    return false;
  }
}

async function syncLocalProgressToCloud() {
  const user = await dnGetAuthedUser();
  if (!user || !navigator.onLine) return false;

  try {
    const store = dnGetProgressStore();
    const rows = {};

    for (const [key, value] of Object.entries(store)) {
      const parsed = dnParseProgressKey(key);
      if (!parsed.topic_slug) continue;

      rows[key] = {
        user_id: user.uid,
        subject_slug: parsed.subject_slug || "",
        topic_slug: parsed.topic_slug || "",
        subtopic_slug: parsed.subtopic_slug || "",
        set_slug: parsed.set_slug || "set-1",
        attempts: Number(value?.attempts) || 0,
        best_percentage: Number(value?.bestPercentage) || 0,
        last_percentage:
          Number(value?.lastPercentage ?? value?.bestPercentage) || 0,
        completed: Boolean(value?.completedFullQuiz || value?.completed),
        updated_at: new Date().toISOString(),
      };
    }

    const sdk = window.firebaseSdk || null;
    const progressRef = dnGetProgressRef(user.uid);
    if (!sdk?.set || !progressRef) return false;

    await sdk.set(progressRef, rows);
    return true;
  } catch (error) {
    console.warn("Local -> cloud sync failed:", error);
    return false;
  }
}

window.syncCloudProgressToLocal = syncCloudProgressToLocal;
window.syncLocalProgressToCloud = syncLocalProgressToCloud;
window.dnClearProgressStoreForCurrentMode = dnClearProgressStoreForCurrentMode;
