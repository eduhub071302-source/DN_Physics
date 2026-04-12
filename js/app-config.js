// 🔐 DN Physics App Configuration (Finalized)

const DN_CONFIG = {
  APP: {
    NAME: "DN Physics",
    VERSION: "1.0.0",
  },

  ACCESS: {
    FREE_PDF_SUBJECTS: ["gravitational-field", "current-electricity", "units"],
    FREE_QUIZ_TOPICS: ["units"],
    OWNER_CODE: "DN-OWNER-2026",
  },

  PRODUCT: {
    FULL_UNLOCK_ID: "dn-physics-monthly-subscription",
    FULL_UNLOCK_NAME: "DN Physics Monthly Subscription",
    PRICE: "70.00",
    CURRENCY: "LKR",
    BILLING_PERIOD: "monthly",
    DURATION_DAYS: 30,
  },

  FRONTEND: {
    SITE_URL: "",
    APP_BASE_PATH: "",
    SUCCESS_PATH: "/payment-success.html",
    CANCEL_PATH: "/payment-cancel.html",
  },

  PAYHERE: {
    MERCHANT_ID: "",
    MERCHANT_SECRET: "",
    SANDBOX: false,
    LIVE_CHECKOUT_URL: "https://www.payhere.lk/pay/checkout",
    SANDBOX_CHECKOUT_URL: "https://sandbox.payhere.lk/pay/checkout",
  },

  BACKEND: {
    // This is your backend host. It can stay here even if frontend auth no longer uses Supabase.
    API_BASE_URL: "https://aqhktwashmnqkgvmauxv.supabase.co/functions/v1",

    CREATE_ORDER_URL: "/api/payments/create-order",
    NOTIFY_URL: "/api/payments/notify",
    VERIFY_UNLOCK_URL: "/api/unlock/verify",
    ACTIVATE_UNLOCK_URL: "/api/unlock/activate",

    AUTH_REGISTER_URL: "/register",
    AUTH_LOGIN_URL: "/api/auth/login",
    AUTH_LOGOUT_URL: "/api/auth/logout",
    AUTH_ME_URL: "/me",
    AUTH_FORGOT_PASSWORD_URL: "/api/auth/forgot-password",
    AUTH_RESET_PASSWORD_URL: "/api/auth/reset-password",
    PROFILE_ME_URL: "/api/profile/me",
    PROFILE_UPDATE_URL: "/api/profile/me",
  },

  STORAGE_KEYS: {
    OWNER_MODE: "dn_owner_mode",
    PAID_UNLOCK: "dn_paid_unlock",
    UNLOCK_SOURCE: "dn_unlock_source",
    UNLOCK_TIME: "dn_unlock_time",
    UNLOCK_ORDER_ID: "dn_unlock_order_id",
    UNLOCK_PENDING_ORDER_ID: "dn_unlock_pending_order_id",
    UNLOCK_EXPIRES_AT: "dn_unlock_expires_at",
    USER_SESSION_TOKEN: "dn_user_session_token",
    USER_PROFILE: "dn_user_profile",
  },
};

// ---------- URL Helpers ----------

function dnTrimTrailingSlashes(value = "") {
  return String(value || "").replace(/\/+$/, "");
}

function dnTrimLeadingSlashes(value = "") {
  return String(value || "").replace(/^\/+/, "");
}

function dnJoinUrl(base = "", path = "") {
  const cleanBase = dnTrimTrailingSlashes(base);
  const cleanPath = dnTrimLeadingSlashes(path);

  if (!cleanBase && !cleanPath) return "";
  if (!cleanBase) return `/${cleanPath}`;
  if (!cleanPath) return cleanBase;

  return `${cleanBase}/${cleanPath}`;
}

function dnGetSiteUrl() {
  const fromConfig = (DN_CONFIG.FRONTEND.SITE_URL || "").trim();
  if (fromConfig) return dnTrimTrailingSlashes(fromConfig);
  return dnTrimTrailingSlashes(window.location.origin);
}

function dnGetAppBaseUrl() {
  return dnJoinUrl(
    dnGetSiteUrl(),
    DN_CONFIG.FRONTEND.APP_BASE_PATH || "",
  );
}

function dnGetSuccessUrl() {
  return dnJoinUrl(
    dnGetAppBaseUrl(),
    DN_CONFIG.FRONTEND.SUCCESS_PATH || "",
  );
}

function dnGetCancelUrl() {
  return dnJoinUrl(
    dnGetAppBaseUrl(),
    DN_CONFIG.FRONTEND.CANCEL_PATH || "",
  );
}

function dnGetCheckoutUrl() {
  return DN_CONFIG.PAYHERE.SANDBOX
    ? DN_CONFIG.PAYHERE.SANDBOX_CHECKOUT_URL
    : DN_CONFIG.PAYHERE.LIVE_CHECKOUT_URL;
}

function dnGetBackendUrl(path = "") {
  return dnJoinUrl(DN_CONFIG.BACKEND.API_BASE_URL || "", path);
}

function dnGetStorageKey(name, fallback = "") {
  return DN_CONFIG?.STORAGE_KEYS?.[name] || fallback;
}
