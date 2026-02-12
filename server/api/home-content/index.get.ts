export default defineEventHandler(async () => {
  // Upsert to ensure the singleton always exists with defaults
  const content = await prisma.homeContent.upsert({
    where: { id: "home_content" },
    update: {},
    create: { id: "home_content" },
  });
  return content;
});
