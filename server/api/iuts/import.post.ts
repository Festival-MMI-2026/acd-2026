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
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

  // Basic CSV parsing (assuming Name,City,Code or similar format)
  // Or just Name if simple list.
  // Let's assume header might exist, or user provides format.
  // For simplicity: Name;City;Code

  const createdCount = 0;
  const errors = [];

  // Skip header if looks like header
  const firstLine = lines[0];
  const startIndex =
    firstLine && firstLine.toLowerCase().includes("nom") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(/[;,]/).map((p) => p.trim());

    if (parts.length < 1) continue;

    const name = parts[0];
    const city = parts[1] || null;
    const code = parts[2] || null;

    if (!name) continue;

    try {
      // Upsert by name to avoid duplicates
      // Note: Name isn't unique in schema yet, but good practice.
      // If not unique, createMany is faster but duplicates risks.
      // Let's check existence first manually or simple create.

      await prisma.iut.create({
        data: {
          name,
          city,
          code,
        },
      });
    } catch (err: any) {
      errors.push(`Ligne ${i + 1}: ${err.message}`);
    }
  }

  return {
    success: true,
    message: "Import terminé",
    meta: {
      totalLines: lines.length - startIndex,
      errors,
    },
  };
});
