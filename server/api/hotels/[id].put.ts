export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  const hotel = await prisma.hotel.update({
    where: { id },
    data: {
      name: body.name,
      address: body.address,
      postalCode: body.postalCode,
      city: body.city,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      googleMapsUrl: body.googleMapsUrl || null,
      websiteUrl: body.websiteUrl || null,
      phone: body.phone || null,
      email: body.email || null,
    },
  });

  logAudit("hotel.updated", "Hotel", id, null, { name: hotel.name });

  return hotel;
});
