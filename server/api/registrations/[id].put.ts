export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = getRouterParam(event, "id");
  const body = await readValidated(event, registrationUpdateSchema);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Registration ID is required",
    });
  }

  const existing = await prisma.registration.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const admin = isAdmin(user);
  const isOwner = existing.email === user.email;
  if (!admin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  if (body.status && !admin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can change status",
    });
  }

  const updatedMeals = body.meals;
  const updatedActivities = body.activities;
  const hasMealsUpdate = Array.isArray(updatedMeals);
  const hasActivitiesUpdate = Array.isArray(updatedActivities);

  let computedTotal: number | undefined;
  if (hasMealsUpdate || hasActivitiesUpdate) {
    const mealIds: string[] = updatedMeals
      ? updatedMeals.map((m) => m.mealId).filter(Boolean)
      : [];
    const activityIds: string[] = updatedActivities
      ? updatedActivities.filter(Boolean)
      : [];

    const [dbMeals, dbActivities, existingMeals, existingActivities] =
      await Promise.all([
        mealIds.length > 0
          ? prisma.meal.findMany({
              where: { id: { in: mealIds } },
              select: { id: true, price: true },
            })
          : Promise.resolve([]),
        activityIds.length > 0
          ? prisma.activity.findMany({
              where: { id: { in: activityIds } },
              select: { id: true, price: true },
            })
          : Promise.resolve([]),
        hasMealsUpdate
          ? Promise.resolve([])
          : prisma.registrationMeal.findMany({
              where: { registrationId: id },
              include: { meal: { select: { price: true } } },
            }),
        hasActivitiesUpdate
          ? Promise.resolve([])
          : prisma.registrationActivity.findMany({
              where: { registrationId: id },
              include: { activity: { select: { price: true } } },
            }),
      ]);

    computedTotal = 0;
    if (hasMealsUpdate) {
      for (const meal of dbMeals) computedTotal += Number(meal.price) || 0;
    } else {
      for (const rm of existingMeals as any[])
        computedTotal += Number(rm.meal?.price) || 0;
    }
    if (hasActivitiesUpdate) {
      for (const act of dbActivities) computedTotal += Number(act.price) || 0;
    } else {
      for (const ra of existingActivities as any[])
        computedTotal += Number(ra.activity?.price) || 0;
    }
  }

  const data: any = {
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    allergens: body.allergens,
    isMotorized: body.isMotorized,
  };
  if (admin) {
    if (body.email !== undefined) data.email = body.email;
    if (body.status !== undefined) data.status = body.status;
  }
  if (computedTotal !== undefined) {
    data.totalPrice = computedTotal;
  }

  const updatedRegistration = await prisma.$transaction(async (tx) => {
    if (updatedMeals) {
      await tx.registrationMeal.deleteMany({ where: { registrationId: id } });
      if (updatedMeals.length > 0) {
        await tx.registrationMeal.createMany({
          data: updatedMeals.map((meal) => ({
            registrationId: id,
            mealId: meal.mealId,
            starterOptionId: meal.starterOptionId || null,
            mainOptionId: meal.mainOptionId || null,
            dessertOptionId: meal.dessertOptionId || null,
          })),
        });
      }
    }

    if (updatedActivities) {
      await tx.registrationActivity.deleteMany({
        where: { registrationId: id },
      });
      if (updatedActivities.length > 0) {
        await tx.registrationActivity.createMany({
          data: updatedActivities.map((activityId) => ({
            registrationId: id,
            activityId,
          })),
        });
      }
    }

    const registration = await tx.registration.update({
      where: { id },
      data,
    });

    if (computedTotal !== undefined) {
      await tx.order.updateMany({
        where: { registrationId: id },
        data: { amount: computedTotal },
      });
    }

    return registration;
  });

  logAudit("registration.updated", "Registration", id, user.id, {
    name: `${updatedRegistration.firstName} ${updatedRegistration.lastName}`,
  });

  return updatedRegistration;
});
