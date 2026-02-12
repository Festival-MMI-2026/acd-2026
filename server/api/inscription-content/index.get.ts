export default defineEventHandler(async () => {
  const content = await prisma.inscriptionContent.upsert({
    where: { id: "inscription_content" },
    update: {},
    create: { id: "inscription_content" },
  });
  return content;
});
