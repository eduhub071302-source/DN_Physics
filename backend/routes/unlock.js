import express from "express";
import { getOrder } from "../lib/storage.js";

const router = express.Router();

router.get("/status", async (req, res) => {
  try {
    const orderId = String(req.query.order_id || "").trim();
    if (!orderId) {
      return res.status(400).json({ ok: false, paid: false, message: "order_id is required" });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return res.json({ ok: true, paid: false, order_id: orderId });
    }

    return res.json({
      ok: true,
      paid: Boolean(order.paid),
      verified: Boolean(order.verified),
      order_id: order.order_id,
      status_code: order.status_code || ""
    });
  } catch (error) {
    return res.status(500).json({ ok: false, paid: false, message: error.message || "Status check failed" });
  }
});

export default router;  
