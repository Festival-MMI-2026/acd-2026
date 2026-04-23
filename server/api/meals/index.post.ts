export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readValidated(event, mealSchema);

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
