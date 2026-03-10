export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name || !body.date || !body.mealType || !body.price) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name, date and mealType and price are required",
    });
  }

  const meal = await prisma.meal.create({
    data: {
      name: body.name,
      date: new Date(body.date),
      mealType: body.mealType,
      price: body.price,
    },
    include: {
      options: true,
    },
  });

  logAudit("meal.created", "Meal", meal.id, null, { name: meal.name });

  return meal;
});
