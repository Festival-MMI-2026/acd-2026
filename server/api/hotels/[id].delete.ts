export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  await prisma.hotel.delete({
    where: { id },
  });

  logAudit("hotel.deleted", "Hotel", id);

  return { success: true };
});
