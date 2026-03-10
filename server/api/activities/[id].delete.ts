export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  await prisma.activity.delete({
    where: { id },
  });

  logAudit("activity.deleted", "Activity", id);

  return { success: true };
});
