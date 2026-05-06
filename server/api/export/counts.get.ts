export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    const [registrations, events, meals, activities, hotels, iuts] =
      await Promise.all([
        prisma.registration.count(),
        prisma.event.count(),
        prisma.meal.count(),
        prisma.activity.count(),
        prisma.hotel.count(),
        prisma.iut.count(),
      ]);

    return {
      registrations,
      events,
      meals,
      activities,
      hotels,
      iuts,
    };
  } catch (error) {
    console.error("Error fetching counts:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des compteurs",
    });
  }
});
