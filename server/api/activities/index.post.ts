export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readValidated(event, activitySchema);

  const activity = await prisma.activity.create({
    data: {
      name: body.name,
      description: body.description || null,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      maxParticipants: body.maxParticipants ?? null,
      price: body.price ?? 0,
    },
  });

  logAudit("activity.created", "Activity", activity.id, null, {
    name: activity.name,
  });

  return activity;
});
