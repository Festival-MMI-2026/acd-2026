export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);

  // Taux de TVA en % : validé entre 0 et 100, sinon ignoré (ne casse pas la sauvegarde)
  const parsedVatRate = Number(body.vatRate);
  const vatRate =
    Number.isFinite(parsedVatRate) && parsedVatRate >= 0 && parsedVatRate <= 100
      ? parsedVatRate
      : undefined;

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
      sendInvoicePdf: body.sendInvoicePdf ?? undefined,
      vatRate,
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
      sendInvoicePdf: body.sendInvoicePdf ?? true,
      vatRate: vatRate ?? 0,
      maintenanceMode: body.maintenanceMode ?? false,
      legalMentions: body.legalMentions ?? "",
      privacyPolicy: body.privacyPolicy ?? "",
    },
  });

  logAudit("settings.updated", "Setting", "site_settings");

  return settings;
});
