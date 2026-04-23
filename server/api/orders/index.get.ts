export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const orders = await prisma.order.findMany({
    include: {
      registration: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return orders;
});
