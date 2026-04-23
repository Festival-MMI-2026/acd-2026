export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);

  const content = await prisma.hotelsContent.upsert({
    where: { id: "hotels_content" },
    update: {
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
    create: {
      id: "hotels_content",
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
  });

  return content;
});
