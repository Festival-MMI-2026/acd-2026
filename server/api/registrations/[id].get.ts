export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Registration ID is required",
    });
  }

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      meals: {
        include: {
          meal: true,
          starterOption: true,
          mainOption: true,
          dessertOption: true,
        },
      },
      activities: {
        include: {
          activity: true,
        },
      },
    },
  });

  if (!registration) {
    throw createError({
      statusCode: 404,
      statusMessage: "Registration not found",
    });
  }

  return registration;
});
