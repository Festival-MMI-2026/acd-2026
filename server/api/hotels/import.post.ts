export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Aucun fichier envoyé" });
  }

  const file = formData[0];
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: "Fichier invalide" });
  }

  const content = file.data.toString("utf-8");
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Fichier vide" });
  }

  // Skip header if present
  const firstCells = (rows[0] ?? []).map((c) => c.toLowerCase());
  const hasHeader =
    firstCells.includes("nom") || firstCells.includes("name") || firstCells.includes("hotel");
  const startIndex = hasHeader ? 1 : 0;

  const rowErrors: string[] = [];
  let created = 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const parts = row.map((p) => p.trim());
    const [rawName, rawAddress, rawPostal, rawCity, rawPhone, rawEmail, rawWebsite, rawMaps, rawLat, rawLng] = parts;

    if (!rawName || !rawAddress || !rawPostal || !rawCity) {
      rowErrors.push(`Ligne ${i + 1}: nom, adresse, code_postal et ville sont obligatoires`);
      continue;
    }

    const latitude = rawLat ? parseFloat(rawLat) : null;
    const longitude = rawLng ? parseFloat(rawLng) : null;

    if (rawLat && isNaN(latitude!)) {
      rowErrors.push(`Ligne ${i + 1}: latitude invalide "${rawLat}"`);
      continue;
    }
    if (rawLng && isNaN(longitude!)) {
      rowErrors.push(`Ligne ${i + 1}: longitude invalide "${rawLng}"`);
      continue;
    }

    try {
      await prisma.hotel.create({
        data: {
          name: rawName,
          address: rawAddress,
          postalCode: rawPostal,
          city: rawCity,
          phone: rawPhone || null,
          email: rawEmail || null,
          websiteUrl: rawWebsite || null,
          googleMapsUrl: rawMaps || null,
          latitude: latitude,
          longitude: longitude,
        },
      });
      created++;
    } catch (err: any) {
      rowErrors.push(`Ligne ${i + 1}: ${err.message}`);
    }
  }

  return { success: true, created, errors: rowErrors };
});
