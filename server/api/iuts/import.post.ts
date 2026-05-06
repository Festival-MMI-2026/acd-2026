export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucun fichier envoyé",
    });
  }

  const file = formData[0];
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: "Fichier invalide",
    });
  }
  const content = file.data.toString("utf-8");
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Fichier vide" });
  }

  const errors: string[] = [];

  // Skip header if first row looks like one
  const firstCells = (rows[0] ?? []).map((c) => c.toLowerCase());
  const hasHeader = firstCells.some((c) => c === "nom" || c === "name");
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const parts = row.map((p) => p.trim());
    const name = parts[0];
    const city = parts[1] || null;
    const code = parts[2] || null;

    if (!name) continue;

    try {
      await prisma.iut.create({
        data: { name, city, code },
      });
    } catch (err: any) {
      errors.push(`Ligne ${i + 1}: ${err.message}`);
    }
  }

  return {
    success: true,
    message: "Import terminé",
    meta: {
      totalLines: rows.length - startIndex,
      errors,
    },
  };
});
