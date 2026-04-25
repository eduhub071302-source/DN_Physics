const ADMIN_EMAILS = [
  "eduhub071302@gmail.com",
  "eduhub0713@gmail.com"
];

const state = {
  allItems: [],
  filteredItems: [],
  selectedId: null,
};

function getEl(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showAdminFeedback(message, type = "success") {
  const box = getEl("adminFeedback");
  if (!box) return;
  box.className = `admin-feedback show ${type}`;
  box.textContent = message;
}

function formatStatusLabel(status) {
  if (status === "read") return "Read";
  if (status === "replied") return "Replied";
  if (status === "closed") return "Closed";
  return "Open";
}

function normalizeStatus(value) {
  const v = String(value || "").toLowerCase();
  if (v === "read" || v === "replied" || v === "closed") return v;
  return "open";
}

function getCurrentUser() {
  try {
    return window.firebaseAuth?.currentUser || null;
  } catch {
    return null;
  }
}

function isAdminUser() {
  try {
    const email = String(window.firebaseAuth?.currentUser?.email || "").toLowerCase();
    return Boolean(email && ADMIN_EMAILS.includes(email));
  } catch {
    return false;
  }
}

function getDb() {
  return window.firebaseDb || null;
}

function getSdk() {
  return window.firebaseSdk || null;
}

async function readNode(path) {
  const db = getDb();
  const sdk = getSdk();
  if (!db || !sdk?.ref || !sdk?.get) return {};

  const snapshot = await sdk.get(sdk.ref(db, path));
  return snapshot.exists() ? snapshot.val() || {} : {};
}

async function updateNode(path, payload) {
  const db = getDb();
  const sdk = getSdk();
  if (!db || !sdk?.ref || !sdk?.set) {
    throw new Error("Firebase not ready");
  }

  await sdk.set(sdk.ref(db, path), payload);
}

function buildUnifiedItems(supportMap, refundMap) {
  const supportItems = Object.entries(supportMap || {}).map(([id, item]) => {
    const status = normalizeStatus(item?.status);
    return {
      id,
      type: "support",
      typeLabel: "Support",
      title: item?.categoryLabel || "Support",
      email: item?.email || "",
      uid: item?.uid || "",
      name: item?.name || "",
      message: item?.message || "",
      createdAt: item?.createdAt || "",
      status,
      statusLabel: formatStatusLabel(status),
      raw: item || {},
      path: `support_messages/${id}`,
      userPath: item?.uid ? `user_support_messages/${item.uid}/${id}` : "",
    };
  });

  const refundItems = Object.entries(refundMap || {}).map(([id, item]) => {
    const status = normalizeStatus(item?.status);
    return {
      id,
      type: "refund",
      typeLabel: "Refund",
      title: item?.reasonLabel || item?.reason || "Refund Request",
      email: item?.email || "",
      uid: item?.uid || "",
      name: item?.name || "",
      message: item?.message || "",
      createdAt: item?.createdAt || "",
      status,
      statusLabel: formatStatusLabel(status),
      raw: item || {},
      path: `refund_requests/${id}`,
      userPath: item?.uid ? `user_refund_requests/${item.uid}/${id}` : "",
    };
  });

  return [...supportItems, ...refundItems].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime() || 0;
    const bTime = new Date(b.createdAt || 0).getTime() || 0;
    return bTime - aTime;
  });
}

function updateStats(items) {
  getEl("statTotal").textContent = String(items.length);
  getEl("statOpen").textContent = String(items.filter((x) => normalizeStatus(x.status) === "open").length);
  getEl("statRead").textContent = String(items.filter((x) => normalizeStatus(x.status) === "read").length);
  getEl("statSupport").textContent = String(items.filter((x) => x.type === "support").length);
  getEl("statRefund").textContent = String(items.filter((x) => x.type === "refund").length);
}

function applyFilters() {
  const search = String(getEl("adminSearchInput")?.value || "").trim().toLowerCase();
  const typeFilter = getEl("adminTypeFilter")?.value || "all";
  const statusFilter = getEl("adminStatusFilter")?.value || "all";

  state.filteredItems = state.allItems.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || normalizeStatus(item.status) === statusFilter;

    const haystack = [
      item.id,
      item.typeLabel,
      item.title,
      item.email,
      item.uid,
      item.name,
      item.message,
      item.createdAt,
      item.raw?.order_id || "",
      item.raw?.admin_note || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search);
    return matchesType && matchesStatus && matchesSearch;
  });

  updateStats(state.filteredItems);
  renderList();

  if (state.selectedId) {
    const exists = state.filteredItems.some((x) => x.id === state.selectedId);
    if (!exists) {
      state.selectedId = null;
    }
  }

  renderDetail();
}

function renderList() {
  const list = getEl("adminList");
  if (!list) return;

  if (!state.filteredItems.length) {
    list.innerHTML = `<div class="admin-detail-empty">No matching requests found.</div>`;
    return;
  }

  list.innerHTML = state.filteredItems
    .map((item) => {
      const activeClass = item.id === state.selectedId ? "active" : "";
      return `
        <article class="admin-ticket-card ${activeClass}" data-id="${escapeHtml(item.id)}">
          <div class="admin-ticket-top">
            <div>
              <div class="admin-ticket-title">${escapeHtml(item.title)}</div>
              <div class="admin-ticket-sub">${escapeHtml(item.email || "No email")}</div>
            </div>
            <span class="ticket-status-pill ${escapeHtml(item.status)}">${escapeHtml(item.statusLabel)}</span>
          </div>
          <div class="admin-ticket-msg">${escapeHtml(item.message || "No message")}</div>
          <div class="admin-ticket-meta">
            ${escapeHtml(item.typeLabel)} · ${escapeHtml(item.id)} · ${escapeHtml(item.createdAt || "No date")}
          </div>
        </article>
      `;
    })
    .join("");

  list.querySelectorAll(".admin-ticket-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedId = card.dataset.id;
      renderList();
      renderDetail();
    });
  });
}

function renderDetail() {
  const wrap = getEl("adminDetail");
  if (!wrap) return;

  if (!state.selectedId) {
    wrap.innerHTML = `<div class="admin-detail-empty">Select a request to view details.</div>`;
    return;
  }

  const item =
    state.filteredItems.find((x) => x.id === state.selectedId) ||
    state.allItems.find((x) => x.id === state.selectedId);

  if (!item) {
    wrap.innerHTML = `<div class="admin-detail-empty">Request not found.</div>`;
    return;
  }

  const extraOrderId = item.type === "refund"
    ? `
      <div class="admin-detail-card">
        <div class="admin-detail-label">Order ID / Payment Reference</div>
        <div class="admin-detail-value">${escapeHtml(item.raw?.order_id || "—")}</div>
      </div>
    `
    : "";

  const adminNote = escapeHtml(item.raw?.admin_note || "");

  wrap.innerHTML = `
    <div class="admin-detail-block">
      <div class="admin-detail-card">
        <div class="admin-detail-label">Type</div>
        <div class="admin-detail-value">${escapeHtml(item.typeLabel)}</div>
      </div>

      <div class="admin-detail-card">
        <div class="admin-detail-label">Request ID</div>
        <div class="admin-detail-value">${escapeHtml(item.id)}</div>
      </div>

      <div class="admin-detail-card">
        <div class="admin-detail-label">Name</div>
        <div class="admin-detail-value">${escapeHtml(item.name || "—")}</div>
      </div>

      <div class="admin-detail-card">
        <div class="admin-detail-label">Email</div>
        <div class="admin-detail-value">${escapeHtml(item.email || "—")}</div>
      </div>

      <div class="admin-detail-card">
        <div class="admin-detail-label">UID</div>
        <div class="admin-detail-value">${escapeHtml(item.uid || "—")}</div>
      </div>

      <div class="admin-detail-card">
        <div class="admin-detail-label">Submitted</div>
        <div class="admin-detail-value">${escapeHtml(item.createdAt || "—")}</div>
      </div>

      ${extraOrderId}

      <div class="admin-detail-card">
        <div class="admin-detail-label">Message</div>
        <div class="admin-detail-value">${escapeHtml(item.message || "—")}</div>
      </div>

      <div class="admin-detail-actions">
        <select id="adminStatusSelect">
          <option value="open" ${item.status === "open" ? "selected" : ""}>Open</option>
          <option value="read" ${item.status === "read" ? "selected" : ""}>Read</option>
          <option value="replied" ${item.status === "replied" ? "selected" : ""}>Replied</option>
          <option value="closed" ${item.status === "closed" ? "selected" : ""}>Closed</option>
        </select>

        <textarea id="adminNoteInput" placeholder="Internal admin note...">${adminNote}</textarea>

        <div class="admin-action-row">
          <button id="adminSaveBtn" class="btn btn-primary" type="button">💾 Save Update</button>
          <a
            class="btn"
            href="mailto:${encodeURIComponent(item.email || "")}?subject=${encodeURIComponent(`DN Physics ${item.typeLabel} Reply: ${item.id}`)}"
          >
            ✉ Email User
          </a>
        </div>
      </div>
    </div>
  `;

  getEl("adminSaveBtn")?.addEventListener("click", async () => {
    await saveSelectedItem();
  });
}

async function saveSelectedItem() {
  const item = state.allItems.find((x) => x.id === state.selectedId);
  if (!item) return;

  const statusSelect = getEl("adminStatusSelect");
  const adminNoteInput = getEl("adminNoteInput");

  const nextStatus = normalizeStatus(statusSelect?.value || item.status);
  const adminNote = String(adminNoteInput?.value || "").trim();

  const updatedPayload = {
    ...item.raw,
    status: nextStatus,
    statusLabel: formatStatusLabel(nextStatus),
    admin_note: adminNote,
    updatedAt: new Date().toLocaleString(),
  };

  try {
    await updateNode(item.path, updatedPayload);

    if (item.userPath) {
      await updateNode(item.userPath, updatedPayload);
    }

    showAdminFeedback("Request updated successfully.", "success");
    await loadAllRequests();
  } catch (error) {
    console.error("Admin save failed:", error);
    showAdminFeedback("Could not update request.", "error");
  }
}

async function loadAllRequests() {
  const list = getEl("adminList");
  if (list) {
    list.innerHTML = `<div class="admin-detail-empty">Loading requests...</div>`;
  }

  try {
    const [supportMap, refundMap] = await Promise.all([
      readNode("support_messages"),
      readNode("refund_requests"),
    ]);

    state.allItems = buildUnifiedItems(supportMap, refundMap);
    applyFilters();
  } catch (error) {
    console.error("Failed loading admin requests:", error);
    if (list) {
      list.innerHTML = `<div class="admin-detail-empty">Could not load requests.</div>`;
    }
  }
}

function bindFilters() {
  getEl("adminSearchInput")?.addEventListener("input", applyFilters);
  getEl("adminTypeFilter")?.addEventListener("change", applyFilters);
  getEl("adminStatusFilter")?.addEventListener("change", applyFilters);

  getEl("adminClearFiltersBtn")?.addEventListener("click", () => {
    getEl("adminSearchInput").value = "";
    getEl("adminTypeFilter").value = "all";
    getEl("adminStatusFilter").value = "all";
    applyFilters();
  });

  getEl("adminRefreshBtn")?.addEventListener("click", async () => {
    await loadAllRequests();
  });
}

function renderAccessState() {
  const meta = getEl("adminUserMeta");
  const user = getCurrentUser();

  if (!user) {
    meta.textContent = "You must log in first.";
    return false;
  }

  if (!isAdminUser()) {
    meta.textContent = `Logged in as ${user.email || "user"} · admin access required`;
    return false;
  }

  meta.textContent = `Admin access granted · ${user.email || user.uid}`;
  return true;
}

function showLockedAdminScreen(message) {
  const list = getEl("adminList");
  const detail = getEl("adminDetail");
  if (list) list.innerHTML = `<div class="admin-detail-empty">${escapeHtml(message)}</div>`;
  if (detail) detail.innerHTML = `<div class="admin-detail-empty">Admin panel locked.</div>`;
}

// ==============================
// 🚧 MAINTENANCE CONTROL
// ==============================

const MAINTENANCE_PATH = "app_settings/maintenance";

async function loadMaintenanceStatus() {
  const textEl = getEl("maintenanceStatusText");
  const onBtn = getEl("maintenanceOnBtn");
  const offBtn = getEl("maintenanceOffBtn");

  if (!textEl) return;

  try {
    const data = await readNode(MAINTENANCE_PATH);
    const enabled = Boolean(data?.enabled);

    textEl.textContent = enabled
      ? "Status: ON — normal users are blocked"
      : "Status: OFF — app is live";

    if (onBtn) onBtn.disabled = enabled;
    if (offBtn) offBtn.disabled = !enabled;
  } catch (error) {
    console.error("Maintenance status load failed:", error);
    textEl.textContent = "Status: Could not load";
  }
}

async function setMaintenanceStatus(enabled) {
  try {
    await updateNode(MAINTENANCE_PATH, {
      enabled,
      message: "App is under maintenance. Please try again later.",
      updatedAt: new Date().toISOString(),
      updatedBy: getCurrentUser()?.email || "",
    });

    showAdminFeedback(
      enabled ? "Maintenance mode turned ON." : "Maintenance mode turned OFF.",
      "success"
    );

    await loadMaintenanceStatus();
  } catch (error) {
    console.error("Maintenance update failed:", error);
    showAdminFeedback("Could not update maintenance mode.", "error");
  }
}

function bindMaintenanceControls() {
  getEl("maintenanceOnBtn")?.addEventListener("click", async () => {
    await setMaintenanceStatus(true);
  });

  getEl("maintenanceOffBtn")?.addEventListener("click", async () => {
    await setMaintenanceStatus(false);
  });
}

function waitForAuthThenInit() {
  const sdk = getSdk();
  const auth = window.firebaseAuth || null;

  if (!sdk?.onAuthStateChanged || !auth) {
    showLockedAdminScreen("Firebase auth not ready.");
    return;
  }

  sdk.onAuthStateChanged(auth, async () => {
    const ok = renderAccessState();
    if (!ok) {
      showLockedAdminScreen("Please log in with your admin account.");
      return;
    }

    await loadAllRequests();
  });
}

bindFilters();
bindMaintenanceControls();
waitForAuthThenInit();
