import { corsHeaders, handleCors } from "./shared/cors.js";
import { buildPayHereMd5sig } from "./shared/payhere.js";
import { firebaseGet, firebasePatch, firebaseSet } from "./shared/db.js";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const formText = await req.text();
    const form = new URLSearchParams(formText);

    const merchantId = form.get("merchant_id") || "";
    const orderId = form.get("order_id") || "";
    const payhereAmount = form.get("payhere_amount") || "";
    const payhereCurrency = form.get("payhere_currency") || "";
    const statusCode = form.get("status_code") || "";
    const receivedMd5sig = (form.get("md5sig") || "").toUpperCase();

    const merchantSecret = Deno.env.get("PAYHERE_MERCHANT_SECRET") || "";
    const firebaseDatabaseUrl = Deno.env.get("FIREBASE_DATABASE_URL") || "";
    const firebaseDatabaseSecret = Deno.env.get("FIREBASE_DATABASE_SECRET") || "";

    if (!merchantId || !orderId || !merchantSecret || !firebaseDatabaseUrl) {
      return new Response("Invalid configuration", {
        status: 500,
        headers: corsHeaders(),
      });
    }

    const expectedMd5sig = await buildPayHereMd5sig({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      merchantSecret,
    });

    if (receivedMd5sig !== expectedMd5sig) {
      console.error("PayHere md5sig mismatch", { orderId });
      return new Response("Invalid signature", {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const order = await firebaseGet(
      `payment_orders/${orderId}`,
      firebaseDatabaseUrl,
      firebaseDatabaseSecret,
    );

    if (!order) {
      return new Response("Order not found", {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const isPaid = statusCode === "2";

    await firebasePatch(
      `payment_orders/${orderId}`,
      {
        status: isPaid ? "paid" : "failed",
        status_code: statusCode,
        paid_at: isPaid ? new Date().toISOString() : null,
        payhere_amount: payhereAmount,
        payhere_currency: payhereCurrency,
        updated_at: new Date().toISOString(),
      },
      firebaseDatabaseUrl,
      firebaseDatabaseSecret,
    );

    if (isPaid && order.customer?.email) {
      const expiresAt =
        Date.now() + 30 * 24 * 60 * 60 * 1000;

      const subscriptionRecord = {
        orderId,
        email: order.customer.email,
        status: "active",
        amount: payhereAmount,
        currency: payhereCurrency,
        activatedAt: new Date().toISOString(),
        expiresAt,
      };

      await firebaseSet(
        `verified_unlocks_by_order/${orderId}`,
        subscriptionRecord,
        firebaseDatabaseUrl,
        firebaseDatabaseSecret,
      );

      /*
        IMPORTANT:
        Best production version is to map payment to the logged-in user UID.
        For that, store uid inside payment_orders during create-order.
        Then write:
          users/{uid}/expiresAt
          users/{uid}/orderId
          subscriptions/{uid}
      */
    }

    return new Response("OK", {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("notify error:", error);
    return new Response("Server error", {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
