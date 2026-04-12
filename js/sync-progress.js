// 🔄 DN Physics cloud progress sync (Firebase-only, user-scoped storage)

import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";

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

function dnParseProgressKey(key) {
  const parts = String(key || "").split("__");

  return {
    subject_slug: parts[0] || "physics",
    topic_slug: parts[1] || "",
    subtopic_slug: parts[2] || "",
    set_slug: parts[3] || "set-1",
  };
}

function dnBuildProgressKey(subject, topic, subtopic = "", setName = "set-1") {
  return `${subject || "physics"}__${topic || ""}__${subtopic || ""}__${setName || "set-1"}`;
}

async function dnGetAuthedUser() {
  try {
    const auth = window.firebaseAuth || getAuth();
    return auth.currentUser || null;
  } catch (error) {
    console.warn("dnGetAuthedUser failed:", error);
    return null;
  }
}

function dnGetProgressRef(userId) {
  const db = window.firebaseDb || getDatabase();
  return ref(db, `quiz_progress/${userId}`);
}

async function syncCloudProgressToLocal() {
  const user = await dnGetAuthedUser();
  if (!user || !navigator.onLine) return false;

  try {
    const snapshot = await get(dnGetProgressRef(user.uid));
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
        subject_slug: parsed.subject_slug || "physics",
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

    await set(dnGetProgressRef(user.uid), rows);
    return true;
  } catch (error) {
    console.warn("Local -> cloud sync failed:", error);
    return false;
  }
}

window.syncCloudProgressToLocal = syncCloudProgressToLocal;
window.syncLocalProgressToCloud = syncLocalProgressToCloud;
