export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID requis" });
  }

  const body = await readBody(event);
  const checkedIn: boolean = body.checkedIn ?? true;

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      checkedIn,
      checkedInAt: checkedIn ? new Date() : null,
    },
  });

  logAudit("registration.checkin", "Registration", id, null, {
    name: `${registration.firstName} ${registration.lastName}`,
    checkedIn,
  });

  return registration;
});
