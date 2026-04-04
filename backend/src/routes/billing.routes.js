import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getMyUnlocks,
  checkAccess,
  devMarkOrderPaid
} from "../controllers/billing.controller.js";

const router = express.Router();

router.post("/create-order", requireAuth, createOrder);
router.get("/my-orders", requireAuth, getMyOrders);
router.get("/my-unlocks", requireAuth, getMyUnlocks);
router.post("/check-access", requireAuth, checkAccess);
router.post("/dev-mark-paid", requireAuth, devMarkOrderPaid);

export default router;
