// Format ISO date YYYY-MM-DD pour matcher les templates d'import
function isoDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

// Échappe une valeur CSV : entoure de quotes si elle contient ; , " ou \n et échappe les " internes
function csvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (/[;,"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers: string[], rows: unknown[][]): string {
  const lines: string[] = [];
  lines.push(headers.join(";"));
  for (const r of rows) {
    lines.push(r.map(csvCell).join(";"));
  }
  return lines.join("\n");
}

interface CategoryFormatter {
  filename: string;
  headers: string[];
  toRows: (data: any[]) => unknown[][];
}

// Mappers alignés sur les templates d'import (template_*.csv)
const FORMATTERS: Record<string, CategoryFormatter> = {
  events: {
    filename: "programme",
    headers: ["titre", "date", "heure_debut", "heure_fin", "lieu", "description"],
    toRows: (data) =>
      data.map((e) => [
        e.title,
        isoDate(e.date),
        e.startTime,
        e.endTime,
        e.location ?? "",
        e.description ?? "",
      ]),
  },
  activities: {
    filename: "activites",
    headers: ["nom", "date", "heure_debut", "heure_fin", "prix", "max_participants", "description"],
    toRows: (data) =>
      data.map((a) => [
        a.name,
        isoDate(a.date),
        a.allDay ? "" : a.startTime,
        a.allDay ? "" : a.endTime,
        Number(a.price ?? 0),
        a.maxParticipants ?? "",
        a.description ?? "",
      ]),
  },
  meals: {
    filename: "repas",
    headers: ["nom", "date", "type", "prix", "type_option", "nom_option", "allergenes", "description"],
    toRows: (data) => {
      const out: unknown[][] = [];
      for (const m of data) {
        const date = isoDate(m.date);
        const price = Number(m.price ?? 0);
        const opts = (m.options ?? []) as any[];
        // La description du repas est répétée sur chaque ligne d'option
        // (l'import lit la description seulement sur la 1ʳᵉ ligne d'un repas)
        const desc = m.description ?? "";
        if (opts.length === 0) {
          out.push([m.name, date, m.mealType, price, "", "", "", desc]);
        } else {
          for (const o of opts) {
            out.push([
              m.name,
              date,
              m.mealType,
              price,
              o.optionType,
              o.name,
              (o.allergens ?? []).join("|"),
              desc,
            ]);
          }
        }
      }
      return out;
    },
  },
  hotels: {
    filename: "hotels",
    headers: [
      "nom",
      "adresse",
      "code_postal",
      "ville",
      "telephone",
      "email",
      "site_web",
      "google_maps",
      "latitude",
      "longitude",
    ],
    toRows: (data) =>
      data.map((h) => [
        h.name,
        h.address ?? "",
        h.postalCode ?? "",
        h.city ?? "",
        h.phone ?? "",
        h.email ?? "",
        h.websiteUrl ?? "",
        h.googleMapsUrl ?? "",
        h.latitude ?? "",
        h.longitude ?? "",
      ]),
  },
  iuts: {
    filename: "iuts",
    headers: ["Nom", "Ville", "Code"],
    toRows: (data) => data.map((i) => [i.name, i.city ?? "", i.code ?? ""]),
  },
  // Pas de template d'import pour les inscriptions — format dédié, lisible et complet
  registrations: {
    filename: "inscriptions",
    headers: [
      "id",
      "prenom",
      "nom",
      "email",
      "telephone",
      "iut_id",
      "allergenes",
      "motorise",
      "vegetarien",
      "vegan",
      "sans_porc",
      "sans_alcool",
      "statut",
      "checkin",
      "total",
      "repas",
      "activites",
      "cree_le",
    ],
    toRows: (data) =>
      data.map((r) => {
        const meals = (r.meals ?? [])
          .map((rm: any) => rm.meal?.name ?? "")
          .filter(Boolean)
          .join(" | ");
        const activities = (r.activities ?? [])
          .map((ra: any) => ra.activity?.name ?? "")
          .filter(Boolean)
          .join(" | ");
        return [
          r.id,
          r.firstName,
          r.lastName,
          r.email,
          r.phone,
          r.iutId ?? "",
          r.allergens ?? "",
          r.isMotorized ? "oui" : "non",
          r.isVegetarian ? "oui" : "non",
          r.isVegan ? "oui" : "non",
          r.noPork ? "oui" : "non",
          r.noAlcohol ? "oui" : "non",
          r.status,
          r.checkedIn ? "oui" : "non",
          Number(r.totalPrice ?? 0),
          meals,
          activities,
          isoDate(r.createdAt),
        ];
      }),
  },
};

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const {
    categories = [] as string[],
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

  const dateFilter =
    startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {};

  const result: Record<string, any[]> = {};

  try {
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
        case "hotels":
          result.hotels = await prisma.hotel.findMany({
            where: dateFilter,
            orderBy: { name: "asc" },
          });
          break;
        case "iuts":
          result.iuts = await prisma.iut.findMany({
            where: dateFilter,
            orderBy: { name: "asc" },
          });
          break;
      }
    }

    if (anonymize && result.registrations) {
      result.registrations = result.registrations.map((r: any) => ({
        ...r,
        firstName: "***",
        lastName: "***",
        email: "***@***.***",
        phone: "***",
      }));
    }

    // JSON: structure brute (non re-importable, juste pour analyse)
    if (format === "json") {
      setResponseHeader(event, "Content-Type", "application/json");
      setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename="export_${Date.now()}.json"`,
      );
      return result;
    }

    if (format === "csv") {
      const presentCategories = Object.keys(result).filter(
        (k) => (result[k]?.length ?? 0) >= 0 && FORMATTERS[k],
      );

      // Cas mono-catégorie : sortie directement re-importable (en-têtes au format template)
      if (presentCategories.length === 1) {
        const cat = presentCategories[0]!;
        const fmt = FORMATTERS[cat]!;
        const data = result[cat] ?? [];
        const headers = fmt.headers;
        const rows = fmt.toRows(data);
        const csv = includeHeaders
          ? rowsToCsv(headers, rows)
          : rows.map((r) => r.map(csvCell).join(";")).join("\n");

        setResponseHeader(event, "Content-Type", "text/csv; charset=utf-8");
        setResponseHeader(
          event,
          "Content-Disposition",
          `attachment; filename="export_${fmt.filename}_${isoDate(new Date())}.csv"`,
        );
        return csv;
      }

      // Cas multi-catégories : sections séparées par # CATEGORIE
      const csvLines: string[] = [];
      for (const cat of presentCategories) {
        const fmt = FORMATTERS[cat]!;
        const data = result[cat] ?? [];
        if (data.length === 0) continue;
        csvLines.push(`# ${cat.toUpperCase()}`);
        if (includeHeaders) csvLines.push(fmt.headers.join(";"));
        for (const row of fmt.toRows(data)) {
          csvLines.push(row.map(csvCell).join(";"));
        }
        csvLines.push("");
      }

      setResponseHeader(event, "Content-Type", "text/csv; charset=utf-8");
      setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename="export_${isoDate(new Date())}.csv"`,
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
