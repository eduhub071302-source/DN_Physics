import { corsHeaders, handleCors } from "./shared/cors.js";
import { buildPayHereHash, createOrderId, normalizeAmount } from "./shared/payhere.js";
import { firebaseSet } from "./shared/db.js";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, message: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const body = await req.json();

    const merchantId = Deno.env.get("PAYHERE_MERCHANT_ID") || "";
    const merchantSecret = Deno.env.get("PAYHERE_MERCHANT_SECRET") || "";
    const payhereSandbox = (Deno.env.get("PAYHERE_SANDBOX") || "false") === "true";
    const firebaseDatabaseUrl = Deno.env.get("FIREBASE_DATABASE_URL") || "";
    const firebaseDatabaseSecret = Deno.env.get("FIREBASE_DATABASE_SECRET") || "";
    const frontendBaseUrl = Deno.env.get("FRONTEND_BASE_URL") || "https://dnphysics.com.lk";

    if (!merchantId || !merchantSecret || !firebaseDatabaseUrl) {
      return new Response(
        JSON.stringify({ ok: false, message: "Server payment configuration missing" }),
        { status: 500, headers: corsHeaders() },
      );
    }

    const orderId = createOrderId("DNP");
    const amount = normalizeAmount(70.0);
    const currency = "LKR";

    const hash = await buildPayHereHash({
      merchantId,
      orderId,
      amount,
      currency,
      merchantSecret,
    });

    const checkoutUrl = payhereSandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

    const payload = {
      order_id: orderId,
      status: "pending",
      amount,
      currency,
      created_at: new Date().toISOString(),
      customer: {
        first_name: body.first_name || "DN",
        last_name: body.last_name || "User",
        email: body.email || "",
        phone: body.phone || "",
        address: body.address || "",
        city: body.city || "",
        country: body.country || "Sri Lanka",
      },
      product: {
        name: "DN Physics Monthly Subscription",
        duration_days: 30,
      },
    };

    await firebaseSet(
      `payment_orders/${orderId}`,
      payload,
      firebaseDatabaseUrl,
      firebaseDatabaseSecret,
    );

    const fields = {
      merchant_id: merchantId,
      return_url: `${frontendBaseUrl}/payment-success.html`,
      cancel_url: `${frontendBaseUrl}/payment-cancel.html`,
      notify_url: `${Deno.env.get("BACKEND_BASE_URL") || ""}/api/payments/notify`,
      order_id: orderId,
      items: "DN Physics Monthly Subscription",
      currency,
      amount,
      first_name: body.first_name || "DN",
      last_name: body.last_name || "User",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || "Sri Lanka",
      city: body.city || "Colombo",
      country: body.country || "Sri Lanka",
      hash,
    };

    return new Response(
      JSON.stringify({
        ok: true,
        checkout_url: checkoutUrl,
        fields,
      }),
      {
        status: 200,
        headers: corsHeaders(),
      },
    );
  } catch (error) {
    console.error("create-order error:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Could not create payment order" }),
      {
        status: 500,
        headers: corsHeaders(),
      },
    );
  }
});
