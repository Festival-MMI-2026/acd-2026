export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const take = Math.min(Number(query.limit) || 50, 100);

  const logs = await prisma.auditLog.findMany({
    take,
    orderBy: { createdAt: "desc" },
  });

  return logs;
});
