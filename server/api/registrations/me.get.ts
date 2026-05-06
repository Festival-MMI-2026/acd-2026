export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const registration = await prisma.registration.findFirst({
    where: { email: user.email },
    include: {
      meals: {
        include: {
          meal: true,
          starterOption: true,
          mainOption: true,
          cheeseOption: true,
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
