export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID is required",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      registration: {
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
        },
      },
    },
  });

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: "Order not found",
    });
  }

  return order;
});
