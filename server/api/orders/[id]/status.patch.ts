export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID is required",
    });
  }

  const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  if (!body.paymentStatus || !validStatuses.includes(body.paymentStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payment status",
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

  logAudit("order.status_changed", "Order", id, null, {
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
