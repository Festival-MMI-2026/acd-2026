export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Meal ID is required",
    });
  }

  const meal = await prisma.meal.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      mealType: body.mealType,
      price: body.price,
    },
    include: {
      options: true,
    },
  });

  logAudit("meal.updated", "Meal", id, null, { name: meal.name });

  return meal;
});
