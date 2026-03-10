export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return { registrations: [], orders: [], activities: [], meals: [] };
  }

  const search = q.trim();

  const [registrations, orders, activities, meals] = await Promise.all([
    prisma.registration.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        amount: true,
        paymentStatus: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        date: true,
      },
      take: 5,
    }),
    prisma.meal.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        date: true,
        mealType: true,
      },
      take: 5,
    }),
  ]);

  return { registrations, orders, activities, meals };
});
