export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  await prisma.event.delete({
    where: { id },
  });

  logAudit("event.deleted", "Event", id);

  return { success: true };
});
