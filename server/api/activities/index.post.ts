export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name || !body.date || !body.startTime || !body.endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name, date, startTime and endTime are required",
    });
  }

  const activity = await prisma.activity.create({
    data: {
      name: body.name,
      description: body.description || null,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      maxParticipants: body.maxParticipants
        ? Number(body.maxParticipants)
        : null,
      price: body.price ? Number(body.price) : 0,
    },
  });

  logAudit("activity.created", "Activity", activity.id, null, { name: activity.name });

  return activity;
});
