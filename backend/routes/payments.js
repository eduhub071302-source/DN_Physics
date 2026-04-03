import express from "express";
import { buildCancelUrl, buildReturnUrl, generateCheckoutHash, formatAmount, verifyNotifyMd5Sig } from "../lib/payhere.js";
import { getOrder, upsertOrder } from "../lib/storage.js";

const router = express.Router();

function makeOrderId() {
  return `DNP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

router.post("/create-order", async (req, res) => {
  try {
    const {
      first_name = "DN",
      last_name = "Physics User",
      email = "student@example.com",
      phone = "0770000000",
      address = "Sri Lanka",
      city = "Colombo",
      country = "Sri Lanka"
    } = req.body || {};

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const frontendSiteUrl = process.env.FRONTEND_SITE_URL;
    const appBasePath = process.env.APP_BASE_PATH || "/DN_Physics";
    const currency = process.env.PAYHERE_CURRENCY || "LKR";
    const amount = formatAmount(process.env.PRODUCT_PRICE || "100.00");
    const productId = process.env.PRODUCT_ID || "dn-physics-full-unlock";
    const productName = process.env.PRODUCT_NAME || "DN Physics Full Unlock";

    if (!merchantId || !merchantSecret || !frontendSiteUrl) {
      return res.status(500).json({ ok: false, message: "Backend PayHere config is incomplete." });
    }  

    const orderId = makeOrderId();
    const hash = generateCheckoutHash({
      merchantId,
      merchantSecret,
      orderId,
      amount,
      currency
    });

    const returnUrl = buildReturnUrl(frontendSiteUrl, appBasePath, "/payment-success.html", orderId);
    const cancelUrl = buildCancelUrl(frontendSiteUrl, appBasePath, "/payment-cancel.html", orderId);
    const notifyUrl = `${String(process.env.FRONTEND_SITE_URL).replace(/\/+$/, "")}/api/payments/notify`;

    await upsertOrder({
      order_id: orderId,
      product_id: productId,
      product_name: productName,
      amount,  
      currency,
      status_code: "0",
      paid: false,
      customer: { first_name, last_name, email, phone, address, city, country }
    });

    return res.json({
      ok: true,
      checkout_url: process.env.APP_ENV === "sandbox"
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout",
      fields: {
        merchant_id: merchantId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: orderId,
        items: productName,
        currency,
        amount,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        country,
        custom_1: productId,
        custom_2: "dn_physics_unlock",
        hash
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Failed to create order." });
  }
});

router.post("/notify", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const payload = req.body || {};

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const isValid = verifyNotifyMd5Sig({
      merchantId,
      merchantSecret,
      orderId: payload.order_id,
      payhereAmount: payload.payhere_amount,
      payhereCurrency: payload.payhere_currency,
      statusCode: payload.status_code,
      md5sig: payload.md5sig
    });

    const paid = isValid && String(payload.status_code) === "2";

    const existing = await getOrder(payload.order_id);
    await upsertOrder({
      ...(existing || {}),
      order_id: payload.order_id,
      payment_id: payload.payment_id || "",
      method: payload.method || "",
      payhere_amount: payload.payhere_amount || "",
      payhere_currency: payload.payhere_currency || "",
      status_code: payload.status_code || "",
      status_message: payload.status_message || "",
      md5sig: payload.md5sig || "",
      paid,
      verified: isValid
    });

    return res.status(200).send("OK");
  } catch {
    return res.status(200).send("OK");
  }
});

export default router;
