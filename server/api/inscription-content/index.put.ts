export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const content = await prisma.inscriptionContent.upsert({
    where: { id: "inscription_content" },
    update: {
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
    create: {
      id: "inscription_content",
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
    },
  });

  return content;
});
