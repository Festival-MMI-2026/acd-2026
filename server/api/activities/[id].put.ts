export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readValidated(event, activitySchema.partial());

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      startTime: body.allDay ? "" : body.startTime,
      endTime: body.allDay ? "" : body.endTime,
      allDay: body.allDay,
      maxParticipants: body.maxParticipants ?? null,
      price: body.price ?? 0,
    },
  });

  logAudit("activity.updated", "Activity", id, null, { name: activity.name });

  return activity;
});
