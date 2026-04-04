import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

function makeOrderCode() {
  const part = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${Date.now()}-${part}`;
}

function normalizeItemType(itemType) {
  const value = String(itemType || "").trim().toUpperCase();

  if (["PDF_TOPIC", "QUIZ_TOPIC", "FULL_BUNDLE"].includes(value)) {
    return value;
  }

  return null;
}

function sanitizeOrder(order) {
  return {
    id: order.id,
    orderCode: order.orderCode,
    itemType: order.itemType,
    itemKey: order.itemKey,
    itemTitle: order.itemTitle,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentGateway: order.paymentGateway,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function sanitizePayment(payment) {
  return {
    id: payment.id,
    orderId: payment.orderId,
    gateway: payment.gateway,
    gatewayPaymentId: payment.gatewayPaymentId,
    gatewayOrderId: payment.gatewayOrderId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt
  };
}

function sanitizeUnlock(unlock) {
  return {
    id: unlock.id,
    itemType: unlock.itemType,
    itemKey: unlock.itemKey,
    grantedBy: unlock.grantedBy,
    active: unlock.active,
    startsAt: unlock.startsAt,
    expiresAt: unlock.expiresAt,
    createdAt: unlock.createdAt,
    updatedAt: unlock.updatedAt
  };
}

/**
 * POST /api/billing/create-order
 * user must be logged in
 */
export async function createOrder(req, res) {
  try {
    const userId = req.user.userId;
    const itemType = normalizeItemType(req.body?.itemType);
    const itemKey = String(req.body?.itemKey || "").trim();
    const itemTitle = String(req.body?.itemTitle || "").trim();
    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency || "LKR").trim().toUpperCase();

    if (!itemType) {
      return res.status(400).json({
        success: false,
        message: "Valid itemType is required."
      });
    }

    if (!itemKey) {
      return res.status(400).json({
        success: false,
        message: "itemKey is required."
      });
    }

    if (!itemTitle) {
      return res.status(400).json({
        success: false,
        message: "itemTitle is required."
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required."
      });
    }

    const existingUnlock = await prisma.unlock.findUnique({
      where: {
        userId_itemType_itemKey: {
          userId,
          itemType,
          itemKey
        }
      }
    });

    if (existingUnlock && existingUnlock.active) {
      return res.status(409).json({
        success: false,
        message: "This content is already unlocked for the user."
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        orderCode: makeOrderCode(),
        itemType,
        itemKey,
        itemTitle,
        amount,
        currency,
        status: "PENDING",
        paymentGateway: "PAYHERE"
      }
    });

    return res.status(201).json({
      success: true,
      order: sanitizeOrder(order)
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order."
    });
  }
}

/**
 * GET /api/billing/my-orders
 */
export async function getMyOrders(req, res) {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      orders: orders.map(sanitizeOrder)
    });
  } catch (error) {
    console.error("GET_MY_ORDERS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders."
    });
  }
}

/**
 * GET /api/billing/my-unlocks
 */
export async function getMyUnlocks(req, res) {
  try {
    const userId = req.user.userId;

    const unlocks = await prisma.unlock.findMany({
      where: {
        userId,
        active: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      success: true,
      unlocks: unlocks.map(sanitizeUnlock)
    });
  } catch (error) {
    console.error("GET_MY_UNLOCKS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch unlocks."
    });
  }
}

/**
 * POST /api/billing/check-access
 */
export async function checkAccess(req, res) {
  try {
    const userId = req.user.userId;
    const itemType = normalizeItemType(req.body?.itemType);
    const itemKey = String(req.body?.itemKey || "").trim();

    if (!itemType || !itemKey) {
      return res.status(400).json({
        success: false,
        message: "itemType and itemKey are required."
      });
    }

    const unlock = await prisma.unlock.findUnique({
      where: {
        userId_itemType_itemKey: {
          userId,
          itemType,
          itemKey
        }
      }
    });

    const hasAccess =
      !!unlock &&
      unlock.active &&
      (!unlock.expiresAt || new Date(unlock.expiresAt) > new Date());

    return res.json({
      success: true,
      hasAccess,
      unlock: unlock ? sanitizeUnlock(unlock) : null
    });
  } catch (error) {
    console.error("CHECK_ACCESS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check access."
    });
  }
}

/**
 * POST /api/billing/dev-mark-paid
 * DEV ONLY
 * This simulates a successful payment and auto-unlock.
 */
export async function devMarkOrderPaid(req, res) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "This route is not available in production."
      });
    }

    const userId = req.user.userId;
    const orderId = String(req.body?.orderId || "").trim();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required."
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentMethod: "DEV_SIMULATION"
        }
      });

      let payment = await tx.payment.findUnique({
        where: { orderId: order.id }
      });

      if (!payment) {
        payment = await tx.payment.create({
          data: {
            userId,
            orderId: order.id,
            gateway: "PAYHERE",
            gatewayPaymentId: `DEV-${Date.now()}`,
            gatewayOrderId: order.orderCode,
            amount: order.amount,
            currency: order.currency,
            status: "SUCCESS",
            paidAt: new Date(),
            rawPayload: {
              simulated: true
            }
          }
        });
      } else {
        payment = await tx.payment.update({
          where: { orderId: order.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date()
          }
        });
      }

      const unlock = await tx.unlock.upsert({
        where: {
          userId_itemType_itemKey: {
            userId,
            itemType: order.itemType,
            itemKey: order.itemKey
          }
        },
        update: {
          active: true,
          grantedBy: "PAYMENT",
          startsAt: new Date(),
          expiresAt: null,
          orderId: order.id
        },
        create: {
          userId,
          orderId: order.id,
          itemType: order.itemType,
          itemKey: order.itemKey,
          grantedBy: "PAYMENT",
          active: true,
          startsAt: new Date()
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: { paid: true }
      });

      return {
        updatedOrder,
        payment,
        unlock
      };
    });

    return res.json({
      success: true,
      message: "Order marked as paid and content unlocked.",
      order: sanitizeOrder(result.updatedOrder),
      payment: sanitizePayment(result.payment),
      unlock: sanitizeUnlock(result.unlock)
    });
  } catch (error) {
    console.error("DEV_MARK_ORDER_PAID_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark order as paid."
    });
  }
}
