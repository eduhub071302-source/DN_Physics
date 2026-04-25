// js/network-guard.js

const DN_NETWORK_ADMIN_EMAILS = [
  "eduhub071302@gmail.com",
  "eduhub0713@gmail.com",
];

const DN_NETWORK_CHECK_URL =
  "https://polished-fire-9f44.eduhub071302.workers.dev/api/security/check-network";

function dnNetworkGetAuth() {
  return window.firebaseAuth || null;
}

function dnNetworkIsAdminUser() {
  const email = String(dnNetworkGetAuth()?.currentUser?.email || "").toLowerCase();
  return DN_NETWORK_ADMIN_EMAILS.includes(email);
}

function dnNetworkShowModal(message = "VPN or proxy detected. Please turn off VPN and reload the app.") {
  if (document.getElementById("dnNetworkModal")) return;

  const modal = document.createElement("div");
  modal.id = "dnNetworkModal";
  modal.className = "auth-modal";
  modal.setAttribute("aria-hidden", "false");

  modal.innerHTML = `
    <div class="auth-box premium-auth-box" style="max-width:420px;text-align:center;">
      <div class="unlock-modal-badge">DN Physics Security</div>
      <h2>⚠️ VPN Detected</h2>
      <p>${message}</p>
      <p style="color:var(--muted);font-size:0.92rem;">
        VPN/proxy connections can slow down loading and affect app security.
        Please turn it off, then reload the app.
      </p>
      <button class="btn btn-primary" type="button" onclick="location.reload()">
        🔄 Reload App
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
}

async function dnNetworkCheckOnce() {
  if (dnNetworkIsAdminUser()) return;

  try {
    const res = await fetch(DN_NETWORK_CHECK_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();

    if (data?.blocked) {
      dnNetworkShowModal(
        data?.message || "VPN or proxy detected. Please turn off VPN and reload the app."
      );
    }
  } catch (error) {
    console.warn("Network guard check failed:", error);
  }
}

function dnNetworkBoot() {
  const sdk = window.firebaseSdk || null;
  const auth = window.firebaseAuth || null;

  if (sdk?.onAuthStateChanged && auth) {
    sdk.onAuthStateChanged(auth, () => {
      dnNetworkCheckOnce();
    });
    return;
  }

  setTimeout(dnNetworkCheckOnce, 900);
}

window.dnNetworkCheckOnce = dnNetworkCheckOnce;

dnNetworkBoot();
