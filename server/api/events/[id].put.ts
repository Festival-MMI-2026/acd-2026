export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  // Validate required fields
  if (!body.title || !body.date || !body.startTime || !body.endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: title, date, startTime, endTime",
    });
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description || null,
      date: new Date(body.date + "T12:00:00"),
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location || null,
    },
  });

  logAudit("event.updated", "Event", id, null, { name: updatedEvent.title });

  return updatedEvent;
});
