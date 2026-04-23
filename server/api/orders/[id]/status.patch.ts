export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readValidated(
    event,
    orderStatusSchema.extend({
      notes: z.string().max(2000).optional(),
    }),
  );

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID is required",
    });
  }

  if (!body.paymentStatus) {
    throw createError({
      statusCode: 400,
      statusMessage: "paymentStatus is required",
    });
  }

  const updateData: any = {
    paymentStatus: body.paymentStatus,
  };

  // Set paidAt when marking as PAID
  if (body.paymentStatus === "PAID") {
    updateData.paidAt = new Date();
  }

  // Set payment method if provided
  if (body.paymentMethod) {
    updateData.paymentMethod = body.paymentMethod;
  }

  // Set notes if provided
  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }

  const oldOrder = await prisma.order.findUnique({ where: { id }, select: { paymentStatus: true } });

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  });

  logAudit("order.status_changed", "Order", id, admin.id, {
    orderNumber: order.orderNumber,
    oldStatus: oldOrder?.paymentStatus,
    newStatus: body.paymentStatus,
    paymentMethod: body.paymentMethod || null,
  });

  // Also update registration status based on payment
  if (body.paymentStatus === "PAID") {
    await prisma.registration.update({
      where: { id: order.registrationId },
      data: { status: "CONFIRMED" },
    });
  }

  return order;
});
