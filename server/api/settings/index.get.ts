export default defineEventHandler(async () => {
  const settings = await prisma.setting.upsert({
    where: { id: "site_settings" },
    update: {},
    create: { id: "site_settings" },
  });
  return settings;
});
