export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);

  const content = await prisma.programmeContent.upsert({
    where: { id: "programme_content" },
    update: {
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
    create: {
      id: "programme_content",
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
  });

  return content;
});
