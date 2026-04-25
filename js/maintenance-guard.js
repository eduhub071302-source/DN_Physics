// js/maintenance-guard.js

const DN_MAINTENANCE_ADMIN_EMAILS = [
  "eduhub071302@gmail.com",
  "eduhub0713@gmail.com",
];

const DN_MAINTENANCE_PATH = "app_settings/maintenance";

function dnMaintenanceGetSdk() {
  return window.firebaseSdk || null;
}

function dnMaintenanceGetDb() {
  return window.firebaseDb || null;
}

function dnMaintenanceGetAuth() {
  return window.firebaseAuth || null;
}

function dnMaintenanceIsAdminUser() {
  const email = String(dnMaintenanceGetAuth()?.currentUser?.email || "").toLowerCase();
  return DN_MAINTENANCE_ADMIN_EMAILS.includes(email);
}

function dnMaintenanceShowModal(message = "App is under maintenance. Please try again later.") {
  if (document.getElementById("dnMaintenanceModal")) return;

  const modal = document.createElement("div");
  modal.id = "dnMaintenanceModal";
  modal.className = "auth-modal";
  modal.setAttribute("aria-hidden", "false");

  modal.innerHTML = `
    <div class="auth-box premium-auth-box" style="max-width:420px;text-align:center;">
      <div class="unlock-modal-badge">DN Physics</div>
      <h2>🚧 App Under Maintenance</h2>
      <p>${message}</p>
      <p style="color:var(--muted);font-size:0.92rem;">
        We are updating the app to improve your learning experience.
      </p>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
}

async function dnMaintenanceCheckOnce() {
  const db = dnMaintenanceGetDb();
  const sdk = dnMaintenanceGetSdk();

  if (!db || !sdk?.ref || !sdk?.get) return;

  try {
    const snap = await sdk.get(sdk.ref(db, DN_MAINTENANCE_PATH));
    const data = snap.exists() ? snap.val() : {};

    const enabled = Boolean(data?.enabled);
    const message = data?.message || "App is under maintenance. Please try again later.";

    if (enabled && !dnMaintenanceIsAdminUser()) {
      dnMaintenanceShowModal(message);
    }
  } catch (error) {
    console.warn("Maintenance check failed:", error);
  }
}

function dnMaintenanceBoot() {
  const sdk = dnMaintenanceGetSdk();
  const auth = dnMaintenanceGetAuth();

  if (sdk?.onAuthStateChanged && auth) {
    sdk.onAuthStateChanged(auth, () => {
      dnMaintenanceCheckOnce();
    });
    return;
  }

  setTimeout(dnMaintenanceCheckOnce, 800);
}

window.dnMaintenanceCheckOnce = dnMaintenanceCheckOnce;

dnMaintenanceBoot();
