export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name || !body.address || !body.city || !body.postalCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name, address, city and postalCode are required",
    });
  }

  const hotel = await prisma.hotel.create({
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

  logAudit("hotel.created", "Hotel", hotel.id, null, { name: hotel.name });

  return hotel;
});
