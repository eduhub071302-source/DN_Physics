// js/pdf-sync.js

function dnPdfGetCurrentUserId() {
  try {
    const firebaseUid = window.firebaseAuth?.currentUser?.uid;
    if (firebaseUid) return firebaseUid;

    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.id) return cachedUser.id;
  } catch (error) {
    console.warn("dnPdfGetCurrentUserId failed:", error);
  }

  return "guest";
}

function dnPdfIsGuestMode() {
  try {
    return (localStorage.getItem("dn_app_mode") || "guest") === "guest";
  } catch {
    return true;
  }
}

function dnPdfStorageKeysForCurrentUser() {
  const uid = dnPdfGetCurrentUserId();

  return {
    recent: `dnPdfRecent_${uid}`,
    favorites: `dnPdfFavorites_${uid}`,
    lastOpened: `dnPdfLastOpened_${uid}`,
    pinned: `dnPhysicsPinnedSubjects_${uid}`,
  };
}

function dnPdfReadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function dnPdfWriteLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("dnPdfWriteLocal failed:", error);
  }
}

function dnPdfGetDbRef(path) {
  const db = window.firebaseDb || null;
  const sdk = window.firebaseSdk || null;
  if (!db || !sdk?.ref) return null;
  return sdk.ref(db, path);
}

async function dnPdfPushCurrentLocalToCloud() {
  if (dnPdfIsGuestMode()) return false;

  const uid = dnPdfGetCurrentUserId();
  if (!uid || uid === "guest") return false;

  const sdk = window.firebaseSdk || null;
  if (!sdk?.set) return false;

  const keys = dnPdfStorageKeysForCurrentUser();

  const payload = {
    recent: dnPdfReadLocal(keys.recent, []),
    favorites: dnPdfReadLocal(keys.favorites, []),
    last_opened: dnPdfReadLocal(keys.lastOpened, null),
    pinned_subjects: dnPdfReadLocal(keys.pinned, []),
    updated_at: new Date().toISOString(),
  };

  const ref = dnPdfGetDbRef(`/user_pdf_state/${uid}`);
  if (!ref) return false;

  try {
    await sdk.set(ref, payload);
    return true;
  } catch (error) {
    console.warn("dnPdfPushCurrentLocalToCloud failed:", error);
    return false;
  }
}

async function dnPdfPullCloudToCurrentLocal() {
  if (dnPdfIsGuestMode()) return false;

  const uid = dnPdfGetCurrentUserId();
  if (!uid || uid === "guest") return false;

  const sdk = window.firebaseSdk || null;
  if (!sdk?.get) return false;

  const ref = dnPdfGetDbRef(`/user_pdf_state/${uid}`);
  if (!ref) return false;

  try {
    const snapshot = await sdk.get(ref);
    if (!snapshot.exists()) return false;

    const data = snapshot.val() || {};
    const keys = dnPdfStorageKeysForCurrentUser();

    dnPdfWriteLocal(keys.recent, Array.isArray(data.recent) ? data.recent : []);
    dnPdfWriteLocal(
      keys.favorites,
      Array.isArray(data.favorites) ? data.favorites : [],
    );
    dnPdfWriteLocal(keys.lastOpened, data.last_opened || null);
    dnPdfWriteLocal(
      keys.pinned,
      Array.isArray(data.pinned_subjects) ? data.pinned_subjects : [],
    );

    return true;
  } catch (error) {
    console.warn("dnPdfPullCloudToCurrentLocal failed:", error);
    return false;
  }
}

async function dnPdfSaveRecentEntry(entry) {
  const keys = dnPdfStorageKeysForCurrentUser();
  const recent = dnPdfReadLocal(keys.recent, []);

  const filtered = recent.filter((item) => item.id !== entry.id);
  filtered.unshift(entry);

  dnPdfWriteLocal(keys.recent, filtered.slice(0, 10));
  dnPdfWriteLocal(keys.lastOpened, entry);

  await dnPdfPushCurrentLocalToCloud();
}

async function dnPdfToggleFavoriteEntry(entry) {
  const keys = dnPdfStorageKeysForCurrentUser();
  const favorites = dnPdfReadLocal(keys.favorites, []);

  const exists = favorites.some((item) => item.id === entry.id);
  const nextFavorites = exists
    ? favorites.filter((item) => item.id !== entry.id)
    : [...favorites, entry];

  dnPdfWriteLocal(keys.favorites, nextFavorites);
  await dnPdfPushCurrentLocalToCloud();

  return nextFavorites;
}

function dnPdfIsFavoriteEntry(entryId) {
  const keys = dnPdfStorageKeysForCurrentUser();
  const favorites = dnPdfReadLocal(keys.favorites, []);
  return favorites.some((item) => item.id === entryId);
}

function dnPdfGetPinnedSubjects() {
  const keys = dnPdfStorageKeysForCurrentUser();
  return dnPdfReadLocal(keys.pinned, []);
}

async function dnPdfSetPinnedSubjects(items) {
  const keys = dnPdfStorageKeysForCurrentUser();
  dnPdfWriteLocal(keys.pinned, items);
  await dnPdfPushCurrentLocalToCloud();
}

window.dnPdfStorageKeysForCurrentUser = dnPdfStorageKeysForCurrentUser;
window.dnPdfPullCloudToCurrentLocal = dnPdfPullCloudToCurrentLocal;
window.dnPdfPushCurrentLocalToCloud = dnPdfPushCurrentLocalToCloud;
window.dnPdfSaveRecentEntry = dnPdfSaveRecentEntry;
window.dnPdfToggleFavoriteEntry = dnPdfToggleFavoriteEntry;
window.dnPdfIsFavoriteEntry = dnPdfIsFavoriteEntry;
window.dnPdfGetPinnedSubjects = dnPdfGetPinnedSubjects;
window.dnPdfSetPinnedSubjects = dnPdfSetPinnedSubjects;
