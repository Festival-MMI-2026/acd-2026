export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email as string;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  const registration = await prisma.registration.findFirst({
    where: { email },
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
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return registration;
});
