export default defineEventHandler(async () => {
  const registrations = await prisma.registration.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  // Recalculate totalPrice for each registration from actual meal + activity prices
  return registrations.map((reg) => {
    let computedTotal = 0;
    for (const m of reg.meals as any[]) {
      computedTotal += Number(m.meal?.price) || 0;
    }
    for (const a of reg.activities as any[]) {
      computedTotal += Number(a.activity?.price) || 0;
    }
    return { ...reg, totalPrice: computedTotal };
  });
});
