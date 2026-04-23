export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    // Get all registrations with their creation dates and prices
    const registrations = await prisma.registration.findMany({
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date and aggregate
    const dataByDate = new Map<
      string,
      { inscriptions: number; revenus: number }
    >();

    for (const reg of registrations) {
      const dateKey = reg.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const current = dataByDate.get(dateKey) || {
        inscriptions: 0,
        revenus: 0,
      };
      current.inscriptions += 1;
      current.revenus += Number(reg.totalPrice);
      dataByDate.set(dateKey, current);
    }

    // Convert to array sorted by date
    const chartData = Array.from(dataByDate.entries())
      .map(([date, data]) => ({
        date,
        inscriptions: data.inscriptions,
        revenus: Math.round(data.revenus * 100) / 100, // Round to 2 decimals
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des données du graphique",
    });
  }
});
