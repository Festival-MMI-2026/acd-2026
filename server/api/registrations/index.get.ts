export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 50));
  const skip = (page - 1) * pageSize;
  const search = typeof query.search === "string" ? query.search.trim() : "";

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [total, registrations] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      include: {
        meals: {
          include: {
            meal: true,
            starterOption: true,
            mainOption: true,
            dessertOption: true,
          },
        },
        activities: { include: { activity: true } },
        order: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const items = registrations.map((reg) => {
    let computedTotal = 0;
    for (const m of reg.meals as any[])
      computedTotal += Number(m.meal?.price) || 0;
    for (const a of reg.activities as any[])
      computedTotal += Number(a.activity?.price) || 0;
    return { ...reg, totalPrice: computedTotal };
  });

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
});
