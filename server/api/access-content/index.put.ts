export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);

  const content = await prisma.accessContent.upsert({
    where: { id: "access_content" },
    update: {
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
      locationTitle: body.locationTitle,
      locationName: body.locationName,
      locationAddress1: body.locationAddress1,
      locationAddress2: body.locationAddress2,
      locationMapUrl: body.locationMapUrl,
      trainTitle: body.trainTitle,
      trainStation: body.trainStation,
      trainDuration: body.trainDuration,
      trainAccessTitle: body.trainAccessTitle,
      trainAccessLine: body.trainAccessLine,
      trainAccessTime: body.trainAccessTime,
      carTitle: body.carTitle,
      carParking: body.carParking,
      carAccess: body.carAccess,
      mapLatitude: body.mapLatitude,
      mapLongitude: body.mapLongitude,
      mapTooltipTitle: body.mapTooltipTitle,
      mapTooltipSubtitle: body.mapTooltipSubtitle,
    },
    create: {
      id: "access_content",
      pageTitle: body.pageTitle,
      pageSubtitle: body.pageSubtitle,
      locationTitle: body.locationTitle,
      locationName: body.locationName,
      locationAddress1: body.locationAddress1,
      locationAddress2: body.locationAddress2,
      locationMapUrl: body.locationMapUrl,
      trainTitle: body.trainTitle,
      trainStation: body.trainStation,
      trainDuration: body.trainDuration,
      trainAccessTitle: body.trainAccessTitle,
      trainAccessLine: body.trainAccessLine,
      trainAccessTime: body.trainAccessTime,
      carTitle: body.carTitle,
      carParking: body.carParking,
      carAccess: body.carAccess,
      mapLatitude: body.mapLatitude,
      mapLongitude: body.mapLongitude,
      mapTooltipTitle: body.mapTooltipTitle,
      mapTooltipSubtitle: body.mapTooltipSubtitle,
    },
  });

  return content;
});
