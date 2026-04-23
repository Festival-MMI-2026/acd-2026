export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const mealId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!mealId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Meal ID is required",
    });
  }

  if (!body.name || !body.optionType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name and optionType are required",
    });
  }

  const option = await prisma.mealOption.create({
    data: {
      mealId,
      name: body.name,
      optionType: body.optionType,
      hasAllergens: body.hasAllergens || false,
      allergens: body.allergens || [],
    },
  });

  return option;
});
