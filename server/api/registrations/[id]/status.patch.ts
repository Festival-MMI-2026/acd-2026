export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Registration ID is required",
    });
  }

  // Validate status
  const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
  if (!body.status || !validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid status. Must be PENDING, CONFIRMED, or CANCELLED",
    });
  }

  const oldRegistration = await prisma.registration.findUnique({ where: { id }, select: { status: true } });

  const updatedRegistration = await prisma.registration.update({
    where: { id },
    data: {
      status: body.status,
    },
  });

  logAudit("registration.status_changed", "Registration", id, null, {
    name: `${updatedRegistration.firstName} ${updatedRegistration.lastName}`,
    oldStatus: oldRegistration?.status,
    newStatus: body.status,
  });

  return updatedRegistration;
});
