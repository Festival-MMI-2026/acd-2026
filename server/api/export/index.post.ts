export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const {
    categories = [],
    format = "csv",
    includeHeaders = true,
    anonymize = false,
    startDate,
    endDate,
  } = body;

  if (!categories.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucune catégorie sélectionnée",
    });
  }

  const result: Record<string, any[]> = {};

  // Date filter helper
  const dateFilter =
    startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {};

  try {
    // Fetch data for each selected category
    for (const category of categories) {
      switch (category) {
        case "registrations":
          result.registrations = await prisma.registration.findMany({
            where: dateFilter,
            include: {
              meals: { include: { meal: true } },
              activities: { include: { activity: true } },
              order: true,
            },
            orderBy: { createdAt: "desc" },
          });
          break;

        case "events":
          result.events = await prisma.event.findMany({
            where: dateFilter,
            orderBy: { date: "asc" },
          });
          break;

        case "meals":
          result.meals = await prisma.meal.findMany({
            where: dateFilter,
            include: { options: true },
            orderBy: { date: "asc" },
          });
          break;

        case "activities":
          result.activities = await prisma.activity.findMany({
            where: dateFilter,
            orderBy: { date: "asc" },
          });
          break;
      }
    }

    // Anonymize data if requested
    if (anonymize) {
      if (result.registrations) {
        result.registrations = result.registrations.map((r: any) => ({
          ...r,
          firstName: "***",
          lastName: "***",
          email: "***@***.***",
          phone: "***",
        }));
      }
    }

    // Format output
    if (format === "json") {
      setResponseHeader(event, "Content-Type", "application/json");
      setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename="export_${Date.now()}.json"`,
      );
      return result;
    }

    // CSV format
    if (format === "csv") {
      const csvLines: string[] = [];

      for (const [category, data] of Object.entries(result)) {
        if (!data.length) continue;

        // Add category header
        csvLines.push(`# ${category.toUpperCase()}`);

        // Get headers from first item (excluding nested objects)
        const firstItem = data[0];
        const headers = Object.keys(firstItem).filter(
          (key) =>
            typeof firstItem[key] !== "object" || firstItem[key] === null,
        );

        if (includeHeaders) {
          csvLines.push(headers.join(";"));
        }

        // Add data rows
        for (const item of data) {
          const values = headers.map((h) => {
            const val = item[h];
            if (val === null || val === undefined) return "";
            if (typeof val === "string" && val.includes(";")) return `"${val}"`;
            return String(val);
          });
          csvLines.push(values.join(";"));
        }

        csvLines.push(""); // Empty line between categories
      }

      setResponseHeader(event, "Content-Type", "text/csv; charset=utf-8");
      setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename="export_${Date.now()}.csv"`,
      );
      return csvLines.join("\n");
    }

    throw createError({
      statusCode: 400,
      statusMessage: "Format non supporté",
    });
  } catch (error: any) {
    console.error("Export error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Erreur lors de l'export",
    });
  }
});
