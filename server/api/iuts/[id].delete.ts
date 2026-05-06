export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "IUT ID is required",
    });
  }

  await prisma.iut.delete({
    where: { id },
  });

  logAudit("iut.deleted", "Iut", id);

  return { success: true };
});
