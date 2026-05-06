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
    firstCells.includes("nom") || firstCells.includes("name") || firstCells.includes("titre");
  const startIndex = hasHeader ? 1 : 0;

  const rowErrors: string[] = [];
  let created = 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const parts = row.map((p) => p.trim());
    const [rawName, rawDate, rawStart, rawEnd, rawPrice, rawMax, rawDesc] = parts;

    if (!rawName || !rawDate) {
      rowErrors.push(`Ligne ${i + 1}: nom et date sont obligatoires`);
      continue;
    }

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      rowErrors.push(`Ligne ${i + 1}: date invalide "${rawDate}" (format attendu: YYYY-MM-DD)`);
      continue;
    }

    // Heures vides → activité "toute la journée"
    const allDay = !rawStart && !rawEnd;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!allDay && (!timeRegex.test(rawStart ?? "") || !timeRegex.test(rawEnd ?? ""))) {
      rowErrors.push(`Ligne ${i + 1}: format d'heure invalide (attendu: HH:MM, ou laissez vide pour "toute la journée")`);
      continue;
    }

    const price = parseFloat(rawPrice ?? "0") || 0;
    const maxParticipants = parseInt(rawMax ?? "0") || null;

    try {
      await prisma.activity.create({
        data: {
          name: rawName,
          date: parsedDate,
          startTime: allDay ? "" : rawStart!,
          endTime: allDay ? "" : rawEnd!,
          allDay,
          price,
          maxParticipants,
          description: rawDesc || null,
        },
      });
      created++;
    } catch (err: any) {
      rowErrors.push(`Ligne ${i + 1}: ${err.message}`);
    }
  }

  return { success: true, created, errors: rowErrors };
});
