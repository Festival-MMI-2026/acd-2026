export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const optionId = getRouterParam(event, "optionId");
  const body = await readBody(event);

  if (!optionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Option ID is required",
    });
  }

  const option = await prisma.mealOption.update({
    where: { id: optionId },
    data: {
      name: body.name,
      optionType: body.optionType,
      hasAllergens: body.hasAllergens,
      allergens: body.allergens,
    },
  });

  return option;
});
