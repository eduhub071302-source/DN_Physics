// 🔄 DN Physics cloud progress sync (safe layer on top of localStorage)

const DN_PROGRESS_STORAGE_KEY = "dnPhysicsQuizProgress";

function dnGetProgressStore() {
  try {
    return JSON.parse(localStorage.getItem(DN_PROGRESS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function dnSetProgressStore(store) {
  localStorage.setItem(DN_PROGRESS_STORAGE_KEY, JSON.stringify(store || {}));
}

function dnParseProgressKey(key) {
  const parts = String(key || "").split("__");

  return {
    subject_slug: parts[0] || "physics",
    topic_slug: parts[1] || "",
    subtopic_slug: parts[2] || "",
    set_slug: parts[3] || "set-1"
  };
}

function dnBuildProgressKey(subject, topic, subtopic = "", setName = "set-1") {
  return `${subject || "physics"}__${topic || ""}__${subtopic || ""}__${setName || "set-1"}`;
}

async function dnGetAuthedUser() {
  if (!window.supabaseClient) return null;

  try {
    const { data } = await window.supabaseClient.auth.getUser();
    return data?.user || null;
  } catch (error) {
    console.warn("dnGetAuthedUser failed:", error);
    return null;
  }
}

async function syncCloudProgressToLocal() {
  const user = await dnGetAuthedUser();
  if (!user || !navigator.onLine || !window.supabaseClient) return false;

  try {
    const { data, error } = await window.supabaseClient
      .from("quiz_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.warn("Cloud -> local sync error:", error.message);
      return false;
    }

    const local = dnGetProgressStore();

    (data || []).forEach((row) => {
      const key = dnBuildProgressKey(
        row.subject_slug || "physics",
        row.topic_slug || "",
        row.subtopic_slug || "",
        row.set_slug || "set-1"
      );

      const existing = local[key] || {};

      local[key] = {
        ...existing,
        attempts: Number(row.attempts) || 0,
        bestPercentage:
          row.best_percentage == null ? (existing.bestPercentage || "0.0") : String(row.best_percentage),
        lastPercentage:
          row.last_percentage == null ? (existing.lastPercentage || existing.bestPercentage || "0.0") : String(row.last_percentage),
        completedFullQuiz:
          row.completed == null ? Boolean(existing.completedFullQuiz) : Boolean(row.completed)
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
  if (!user || !navigator.onLine || !window.supabaseClient) return false;

  try {
    const store = dnGetProgressStore();
    const rows = [];

    for (const [key, value] of Object.entries(store)) {
      const parsed = dnParseProgressKey(key);

      if (!parsed.topic_slug) continue;

      rows.push({
        user_id: user.id,
        subject_slug: parsed.subject_slug || "physics",
        topic_slug: parsed.topic_slug || "",
        subtopic_slug: parsed.subtopic_slug || "",
        set_slug: parsed.set_slug || "set-1",
        attempts: Number(value?.attempts) || 0,
        best_percentage: Number(value?.bestPercentage) || 0,
        last_percentage: Number(value?.lastPercentage ?? value?.bestPercentage) || 0,
        completed: Boolean(value?.completedFullQuiz || value?.completed)
      });
    }

    if (!rows.length) return true;

    const { error } = await window.supabaseClient
      .from("quiz_progress")
      .upsert(rows, {
        onConflict: "user_id,subject_slug,topic_slug,subtopic_slug,set_slug"
      });

    if (error) {
      console.warn("Local -> cloud sync error:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Local -> cloud sync failed:", error);
    return false;
  }
}

window.syncCloudProgressToLocal = syncCloudProgressToLocal;
window.syncLocalProgressToCloud = syncLocalProgressToCloud;