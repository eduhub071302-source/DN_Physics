import { corsHeaders, handleCors } from "./shared/cors.js";
import { firebaseGet } from "./shared/db.js";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ ok: false, message: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id") || "";

    const firebaseDatabaseUrl = Deno.env.get("FIREBASE_DATABASE_URL") || "";
    const firebaseDatabaseSecret = Deno.env.get("FIREBASE_DATABASE_SECRET") || "";

    if (!orderId || !firebaseDatabaseUrl) {
      return new Response(JSON.stringify({ ok: false, paid: false }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const unlockRecord = await firebaseGet(
      `verified_unlocks_by_order/${orderId}`,
      firebaseDatabaseUrl,
      firebaseDatabaseSecret,
    );

    if (!unlockRecord) {
      return new Response(
        JSON.stringify({
          ok: true,
          paid: false,
        }),
        {
          status: 200,
          headers: corsHeaders(),
        },
      );
    }

    const expiresAt = Number(unlockRecord.expiresAt) || 0;
    const paid = unlockRecord.status === "active" && expiresAt > Date.now();

    return new Response(
      JSON.stringify({
        ok: true,
        paid,
        order_id: orderId,
        expiresAt,
      }),
      {
        status: 200,
        headers: corsHeaders(),
      },
    );
  } catch (error) {
    console.error("verify-unlock error:", error);
    return new Response(
      JSON.stringify({ ok: false, paid: false }),
      {
        status: 500,
        headers: corsHeaders(),
      },
    );
  }
});
