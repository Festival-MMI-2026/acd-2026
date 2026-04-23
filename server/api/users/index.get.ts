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
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  try {
    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des utilisateurs",
    });
  }
});
