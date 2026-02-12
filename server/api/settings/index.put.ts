export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const settings = await prisma.setting.upsert({
    where: { id: "site_settings" },
    update: {
      headerBadgeText: body.headerBadgeText,
      showProgramme: body.showProgramme,
      showInscription: body.showInscription,
      showAcces: body.showAcces,
      showHotels: body.showHotels,
    },
    create: {
      id: "site_settings",
      headerBadgeText: body.headerBadgeText,
      showProgramme: body.showProgramme,
      showInscription: body.showInscription,
      showAcces: body.showAcces,
      showHotels: body.showHotels,
    },
  });

  return settings;
});
