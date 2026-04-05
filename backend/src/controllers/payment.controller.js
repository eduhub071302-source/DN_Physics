export async function createOrder(req, res) {
  const userId = req.user.id;

  const orderId = "DN-" + Date.now();

  await prisma.payment.create({
    data: {
      orderId,
      userId,
      amount: 100,
      status: "pending"
    }
  });

  res.json({
    ok: true,
    checkout_url: "https://sandbox.payhere.lk/pay/checkout",
    fields: {
      order_id: orderId,
      amount: "100.00",
      currency: "LKR"
    }
  });
}
