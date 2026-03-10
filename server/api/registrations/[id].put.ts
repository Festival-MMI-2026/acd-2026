export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Registration ID is required",
    });
  }

  // Validate status if provided
  const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
  if (body.status && !validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid status. Must be PENDING, CONFIRMED, or CANCELLED",
    });
  }

  const updatedRegistration = await prisma.registration.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      allergens: body.allergens,
      isMotorized: body.isMotorized,
      status: body.status,
      totalPrice: body.totalPrice,
    },
  });

  logAudit("registration.updated", "Registration", id, null, {
    name: `${updatedRegistration.firstName} ${updatedRegistration.lastName}`,
  });

  return updatedRegistration;
});
