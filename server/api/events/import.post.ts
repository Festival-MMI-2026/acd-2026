export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Aucun fichier envoyé" });
  }

  const file = formData[0];
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: "Fichier invalide" });
  }

  const content = file.data.toString("utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Fichier vide" });
  }

  // Skip header if present
  const firstLine = lines[0]?.toLowerCase() ?? "";
  const startIndex =
    firstLine.includes("titre") || firstLine.includes("title") || firstLine.includes("nom")
      ? 1
      : 0;

  const rowErrors: string[] = [];
  let created = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(/[;,]/).map((p) => p.trim());
    const [rawTitle, rawDate, rawStart, rawEnd, rawLocation, rawDesc] = parts;

    if (!rawTitle || !rawDate || !rawStart || !rawEnd) {
      rowErrors.push(`Ligne ${i + 1}: titre, date, heure_debut et heure_fin sont obligatoires`);
      continue;
    }

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      rowErrors.push(`Ligne ${i + 1}: date invalide "${rawDate}" (format attendu: YYYY-MM-DD)`);
      continue;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(rawStart) || !timeRegex.test(rawEnd)) {
      rowErrors.push(`Ligne ${i + 1}: format d'heure invalide (attendu: HH:MM)`);
      continue;
    }

    try {
      await prisma.event.create({
        data: {
          title: rawTitle,
          date: new Date(`${rawDate}T12:00:00`),
          startTime: rawStart,
          endTime: rawEnd,
          location: rawLocation || null,
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
