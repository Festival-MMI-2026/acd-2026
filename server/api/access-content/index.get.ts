export default defineEventHandler(async () => {
  const content = await prisma.accessContent.upsert({
    where: { id: "access_content" },
    update: {},
    create: { id: "access_content" },
  });
  return content;
});
