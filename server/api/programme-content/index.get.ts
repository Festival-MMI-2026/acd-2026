export default defineEventHandler(async () => {
  const content = await prisma.programmeContent.upsert({
    where: { id: "programme_content" },
    update: {},
    create: { id: "programme_content" },
  });
  return content;
});
