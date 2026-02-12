export default defineEventHandler(async () => {
  const content = await prisma.hotelsContent.upsert({
    where: { id: "hotels_content" },
    update: {},
    create: { id: "hotels_content" },
  });
  return content;
});
