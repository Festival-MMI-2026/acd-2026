// Export "traiteur" : pour un repas précis (un jour + midi/soir), la liste
// complète des inscrits avec le détail de leur menu (entrée, plat, fromage,
// dessert), leurs contraintes alimentaires, plus un récapitulatif des
// quantités par plat directement exploitable pour passer commande.

const OPTION_LABEL: Record<string, string> = {
  STARTER: "Entrée",
  MAIN: "Plat",
  CHEESE: "Fromage",
  DESSERT: "Dessert",
};

// Statuts d'inscription retenus selon le périmètre demandé.
// Par défaut : tout le monde sauf les annulés (le traiteur a besoin du
// nombre réel de couverts).
function statusFilter(scope: string): { in: ("PENDING" | "CONFIRMED" | "CANCELLED")[] } | undefined {
  if (scope === "confirmed") return { in: ["CONFIRMED"] };
  if (scope === "all") return undefined;
  return { in: ["PENDING", "CONFIRMED"] }; // "active" (défaut)
}

function frDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

function isoDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

// "jeudi 18 juin 2026" -> "jeudi-18-juin-2026" pour le nom de fichier
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const mealId = getRouterParam(event, "id");
  if (!mealId) {
    throw createError({ statusCode: 400, statusMessage: "Repas non spécifié" });
  }

  const query = getQuery(event);
  const scope = String(query.scope ?? "active");
  const includeSummary = query.summary !== "0" && query.summary !== "false";

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { options: true },
  });
  if (!meal) {
    throw createError({ statusCode: 404, statusMessage: "Repas introuvable" });
  }

  const regMeals = await prisma.registrationMeal.findMany({
    where: {
      mealId,
      registration: { status: statusFilter(scope) },
    },
    include: {
      registration: true,
      starterOption: true,
      mainOption: true,
      cheeseOption: true,
      dessertOption: true,
    },
  });

  // Tri par nom de famille puis prénom (lisible pour le traiteur)
  regMeals.sort((a, b) => {
    const an = `${a.registration.lastName} ${a.registration.firstName}`.toLowerCase();
    const bn = `${b.registration.lastName} ${b.registration.firstName}`.toLowerCase();
    return an.localeCompare(bn, "fr");
  });

  // Résolution des noms d'IUT (iutId stocke l'id de l'Iut)
  const iutIds = [
    ...new Set(regMeals.map((rm) => rm.registration.iutId).filter(Boolean) as string[]),
  ];
  const iuts = iutIds.length
    ? await prisma.iut.findMany({ where: { id: { in: iutIds } } })
    : [];
  const iutName = (id: string | null | undefined) =>
    (id && iuts.find((i) => i.id === id)?.name) || (id ?? "");

  const serviceLabel = meal.mealType === "DINNER" ? "Soir" : "Midi";

  // ---- Récapitulatif des quantités par plat ----
  // On compte en couverts (quantity), pas en lignes.
  const courseTallies: Record<string, Map<string, number>> = {
    STARTER: new Map(),
    MAIN: new Map(),
    CHEESE: new Map(),
    DESSERT: new Map(),
  };
  const optionField = {
    STARTER: "starterOption",
    MAIN: "mainOption",
    CHEESE: "cheeseOption",
    DESSERT: "dessertOption",
  } as const;

  let totalCovers = 0;
  const diet = { veg: 0, vegan: 0, noPork: 0, noAlcohol: 0, allergens: 0 };

  for (const rm of regMeals) {
    const qty = rm.quantity ?? 1;
    totalCovers += qty;
    const r = rm.registration;
    if (r.isVegetarian) diet.veg += qty;
    if (r.isVegan) diet.vegan += qty;
    if (r.noPork) diet.noPork += qty;
    if (r.noAlcohol) diet.noAlcohol += qty;
    if (r.allergens && r.allergens.trim()) diet.allergens += qty;

    for (const type of ["STARTER", "MAIN", "CHEESE", "DESSERT"] as const) {
      const opt = (rm as any)[optionField[type]] as { name: string } | null;
      const key = opt?.name ?? "(non renseigné)";
      const tally = courseTallies[type]!;
      tally.set(key, (tally.get(key) ?? 0) + qty);
    }
  }

  const out: unknown[][] = [];

  if (includeSummary) {
    out.push([`# RÉCAPITULATIF TRAITEUR`]);
    out.push(["Repas", meal.name]);
    out.push(["Date", frDate(meal.date)]);
    out.push(["Service", serviceLabel]);
    out.push(["Périmètre", scope === "confirmed" ? "Confirmées uniquement" : scope === "all" ? "Toutes (annulées incluses)" : "Confirmées + en attente"]);
    out.push(["Inscrits", String(regMeals.length)]);
    out.push(["Couverts (quantités)", String(totalCovers)]);
    out.push([]);

    out.push(["# QUANTITÉS PAR PLAT"]);
    out.push(["Catégorie", "Choix", "Quantité"]);
    for (const type of ["STARTER", "MAIN", "CHEESE", "DESSERT"] as const) {
      const tally = courseTallies[type]!;
      // Choix triés par quantité décroissante, "(non renseigné)" en dernier
      const entries = [...tally.entries()].sort((a, b) => {
        if (a[0] === "(non renseigné)") return 1;
        if (b[0] === "(non renseigné)") return -1;
        return b[1] - a[1];
      });
      if (entries.length === 0) {
        out.push([OPTION_LABEL[type], "—", "0"]);
        continue;
      }
      for (const [name, count] of entries) {
        out.push([OPTION_LABEL[type], name, String(count)]);
      }
    }
    out.push([]);

    out.push(["# RÉGIMES & CONTRAINTES (en couverts)"]);
    out.push(["Végétariens", String(diet.veg)]);
    out.push(["Vegans", String(diet.vegan)]);
    out.push(["Sans porc", String(diet.noPork)]);
    out.push(["Sans alcool", String(diet.noAlcohol)]);
    out.push(["Avec allergènes", String(diet.allergens)]);
    out.push([]);
  }

  // ---- Liste détaillée nominative ----
  out.push(["# LISTE DÉTAILLÉE"]);
  out.push([
    "prenom",
    "nom",
    "email",
    "telephone",
    "iut",
    "statut",
    "entree",
    "plat",
    "fromage",
    "dessert",
    "vegetarien",
    "vegan",
    "sans_porc",
    "sans_alcool",
    "allergenes",
    "quantite",
  ]);
  for (const rm of regMeals) {
    const r = rm.registration;
    out.push([
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      iutName(r.iutId),
      r.status,
      rm.starterOption?.name ?? "",
      rm.mainOption?.name ?? "",
      rm.cheeseOption?.name ?? "",
      rm.dessertOption?.name ?? "",
      r.isVegetarian ? "oui" : "non",
      r.isVegan ? "oui" : "non",
      r.noPork ? "oui" : "non",
      r.noAlcohol ? "oui" : "non",
      r.allergens ?? "",
      String(rm.quantity ?? 1),
    ]);
  }

  // BOM UTF-8 pour qu'Excel ouvre correctement les accents
  const csv = "﻿" + rowsToCsv(out);
  const filename = `traiteur_${slugify(meal.name)}_${serviceLabel.toLowerCase()}_${isoDate(meal.date)}.csv`;

  setResponseHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setResponseHeader(
    event,
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );
  return csv;
});
