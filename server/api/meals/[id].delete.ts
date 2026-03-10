export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Meal ID is required",
    });
  }

  await prisma.meal.delete({
    where: { id },
  });

  logAudit("meal.deleted", "Meal", id);

  return { success: true };
});
