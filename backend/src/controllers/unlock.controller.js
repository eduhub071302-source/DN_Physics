export async function verifyUnlock(req, res) {
  const userId = req.user.id;

  const unlock = await prisma.unlock.findUnique({
    where: { userId }
  });

  res.json({
    paid: unlock?.active || false,
    order_id: unlock?.orderId || ""
  });
}
