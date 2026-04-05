// 🔐 DN Physics App Configuration (Future Ready)

const DN_CONFIG = {
  APP: {
    NAME: "DN Physics",
    VERSION: "1.0.0"
  },

  ACCESS: {
    FREE_PDF_SUBJECTS: ["gravitational-field"],
    FREE_QUIZ_TOPICS: ["units"],
    OWNER_CODE: "DN-OWNER-2026"
  },

  PRODUCT: {
    FULL_UNLOCK_ID: "dn-physics-full-unlock",
    FULL_UNLOCK_NAME: "DN Physics Full Unlock",
    PRICE: "100.00",
    CURRENCY: "LKR"
  },

  FRONTEND: {
    SITE_URL: "",
    APP_BASE_PATH: "/DN_Physics",
    SUCCESS_PATH: "/payment-success.html",
    CANCEL_PATH: "/payment-cancel.html"
  },

  PAYHERE: {
    MERCHANT_ID: "",
    MERCHANT_SECRET: "",
    SANDBOX: false,
    LIVE_CHECKOUT_URL: "https://www.payhere.lk/pay/checkout",
    SANDBOX_CHECKOUT_URL: "https://sandbox.payhere.lk/pay/checkout"
  },

  BACKEND: {
    API_BASE_URL: "",

    CREATE_ORDER_URL: "/api/payments/create-order",
    NOTIFY_URL: "/api/payments/notify",
    VERIFY_UNLOCK_URL: "/api/unlock/verify",
    ACTIVATE_UNLOCK_URL: "/api/unlock/activate",

    AUTH_REGISTER_URL: "/api/auth/register",
    AUTH_LOGIN_URL: "/api/auth/login",
    AUTH_LOGOUT_URL: "/api/auth/logout",
    AUTH_ME_URL: "/api/auth/me",
    AUTH_FORGOT_PASSWORD_URL: "/api/auth/forgot-password",
    AUTH_RESET_PASSWORD_URL: "/api/auth/reset-password",
    PROFILE_ME_URL: "/api/profile/me",
    PROFILE_UPDATE_URL: "/api/profile/me"
  },

  STORAGE_KEYS: {
    OWNER_MODE: "dn_owner_mode",
    PAID_UNLOCK: "dn_paid_unlock",
    UNLOCK_SOURCE: "dn_unlock_source",
    UNLOCK_TIME: "dn_unlock_time",
    UNLOCK_ORDER_ID: "dn_unlock_order_id",
    UNLOCK_PENDING_ORDER_ID: "dn_unlock_pending_order_id",
    USER_SESSION_TOKEN: "dn_user_session_token",
    USER_PROFILE: "dn_user_profile"
  }
};

// ---------- Helpers derived from config ----------

function dnGetSiteUrl() {
  const fromConfig = (DN_CONFIG.FRONTEND.SITE_URL || "").trim();
  if (fromConfig) return fromConfig.replace(/\/+$/, "");
  return window.location.origin;
}

function dnGetAppBaseUrl() {
  return `${dnGetSiteUrl()}${DN_CONFIG.FRONTEND.APP_BASE_PATH}`;
}

function dnGetSuccessUrl() {
  return `${dnGetAppBaseUrl()}${DN_CONFIG.FRONTEND.SUCCESS_PATH}`;
}

function dnGetCancelUrl() {
  return `${dnGetAppBaseUrl()}${DN_CONFIG.FRONTEND.CANCEL_PATH}`;
}

function dnGetCheckoutUrl() {
  return DN_CONFIG.PAYHERE.SANDBOX
    ? DN_CONFIG.PAYHERE.SANDBOX_CHECKOUT_URL
    : DN_CONFIG.PAYHERE.LIVE_CHECKOUT_URL;
}
