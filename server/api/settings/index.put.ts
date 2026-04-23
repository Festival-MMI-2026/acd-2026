export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);

  const settings = await prisma.setting.upsert({
    where: { id: "site_settings" },
    update: {
      headerBadgeText: body.headerBadgeText,
      siteName: body.siteName,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      eventEndDate: body.eventEndDate ? new Date(body.eventEndDate) : undefined,
      location: body.location,
      locationAddress: body.locationAddress,
      showProgramme: body.showProgramme,
      showInscription: body.showInscription,
      showAcces: body.showAcces,
      showHotels: body.showHotels,
      notificationEmails: body.notificationEmails ?? undefined,
      maintenanceMode: body.maintenanceMode ?? undefined,
      legalMentions: body.legalMentions ?? undefined,
      privacyPolicy: body.privacyPolicy ?? undefined,
    },
    create: {
      id: "site_settings",
      headerBadgeText: body.headerBadgeText,
      siteName: body.siteName,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      eventEndDate: body.eventEndDate ? new Date(body.eventEndDate) : undefined,
      location: body.location,
      locationAddress: body.locationAddress,
      showProgramme: body.showProgramme,
      showInscription: body.showInscription,
      showAcces: body.showAcces,
      showHotels: body.showHotels,
      notificationEmails: body.notificationEmails ?? [],
      maintenanceMode: body.maintenanceMode ?? false,
      legalMentions: body.legalMentions ?? "",
      privacyPolicy: body.privacyPolicy ?? "",
    },
  });

  logAudit("settings.updated", "Setting", "site_settings");

  return settings;
});
