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

  // Detect and skip header line
  const firstCells = (rows[0] ?? []).map((c) => c.toLowerCase());
  const hasHeader =
    firstCells.includes("nom") ||
    firstCells.includes("name") ||
    firstCells.includes("date");
  const startIndex = hasHeader ? 1 : 0;

  // Group rows by (name + date + type) to build meals with their options
  const mealMap = new Map<
    string,
    {
      name: string;
      date: string;
      mealType: "LUNCH" | "DINNER";
      price: number;
      description: string | null;
      options: { name: string; optionType: "STARTER" | "MAIN" | "CHEESE" | "DESSERT"; allergens: string[] }[];
    }
  >();

  const rowErrors: string[] = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const parts = row.map((p) => p.trim());
    const [rawName, rawDate, rawType, rawPrice, rawOptionType, rawOptionName, rawAllergens, rawDescription] = parts;

    if (!rawName || !rawDate || !rawType) {
      rowErrors.push(`Ligne ${i + 1}: colonnes nom, date et type obligatoires`);
      continue;
    }

    // Validate mealType
    const mealType = rawType.toUpperCase();
    if (mealType !== "LUNCH" && mealType !== "DINNER") {
      rowErrors.push(`Ligne ${i + 1}: type invalide "${rawType}" (attendu: LUNCH ou DINNER)`);
      continue;
    }

    // Validate date
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      rowErrors.push(`Ligne ${i + 1}: date invalide "${rawDate}" (format attendu: YYYY-MM-DD)`);
      continue;
    }

    const price = parseFloat(rawPrice ?? "0") || 0;
    const key = `${rawName}__${rawDate}__${mealType}`;

    if (!mealMap.has(key)) {
      mealMap.set(key, {
        name: rawName,
        date: rawDate,
        mealType: mealType as "LUNCH" | "DINNER",
        price,
        description: rawDescription || null,
        options: [],
      });
    } else if (rawDescription && !mealMap.get(key)!.description) {
      // Description trouvée plus loin dans les lignes du même repas
      mealMap.get(key)!.description = rawDescription;
    }

    // Parse option if present
    if (rawOptionType && rawOptionName) {
      const optionType = rawOptionType.toUpperCase();
      if (
        optionType !== "STARTER" &&
        optionType !== "MAIN" &&
        optionType !== "CHEESE" &&
        optionType !== "DESSERT"
      ) {
        rowErrors.push(`Ligne ${i + 1}: type d'option invalide "${rawOptionType}" (attendu: STARTER, MAIN, CHEESE ou DESSERT)`);
        continue;
      }

      const allergens = rawAllergens
        ? rawAllergens.split("|").map((a) => a.trim().toUpperCase()).filter(Boolean)
        : [];

      mealMap.get(key)!.options.push({
        name: rawOptionName,
        optionType: optionType as "STARTER" | "MAIN" | "CHEESE" | "DESSERT",
        allergens,
      });
    }
  }

  if (mealMap.size === 0) {
    throw createError({ statusCode: 400, statusMessage: "Aucune ligne valide trouvée dans le fichier" });
  }

  // Create meals in DB
  let createdMeals = 0;
  let createdOptions = 0;
  const createErrors: string[] = [];

  for (const meal of mealMap.values()) {
    try {
      await prisma.meal.create({
        data: {
          name: meal.name,
          date: new Date(meal.date),
          mealType: meal.mealType,
          price: meal.price,
          description: meal.description,
          options: meal.options.length > 0
            ? {
                create: meal.options.map((opt) => ({
                  name: opt.name,
                  optionType: opt.optionType,
                  hasAllergens: opt.allergens.length > 0,
                  allergens: opt.allergens,
                })),
              }
            : undefined,
        },
      });
      createdMeals++;
      createdOptions += meal.options.length;
    } catch (err: any) {
      createErrors.push(`Repas "${meal.name}": ${err.message}`);
    }
  }

  return {
    success: true,
    createdMeals,
    createdOptions,
    errors: [...rowErrors, ...createErrors],
  };
});
