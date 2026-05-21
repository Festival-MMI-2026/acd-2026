import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../server/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

// ============================================
// IUTs
// ============================================
const iuts = [
  { name: "IUT de Bobigny (Sorbonne Paris Nord)", city: "Bobigny", code: "93000" },
  { name: "IUT de Marne-la-Vallée (UGE)", city: "Champs-sur-Marne", code: "77420" },
  { name: "IUT de Meaux (UGE)", city: "Meaux", code: "77100" },
  { name: "IUT de Cergy-Pontoise", city: "Sarcelles", code: "95200" },
  { name: "IUT de Vélizy", city: "Vélizy-Villacoublay", code: "78140" },
  { name: "IUT de Sénart-Fontainebleau", city: "Lieusaint", code: "77127" },
  { name: "IUT de Laval", city: "Laval", code: "53000" },
  { name: "IUT de Blois", city: "Blois", code: "41000" },
  { name: "IUT de Lannion", city: "Lannion", code: "22300" },
  { name: "IUT de Lens", city: "Lens", code: "62300" },
  { name: "IUT d'Elbeuf", city: "Elbeuf", code: "76500" },
  { name: "IUT de Caen", city: "Saint-Lô", code: "50000" },
  { name: "IUT de Haguenau", city: "Haguenau", code: "67500" },
  { name: "IUT de Mulhouse", city: "Mulhouse", code: "68100" },
  { name: "IUT de Troyes", city: "Troyes", code: "10000" },
  { name: "IUT Nancy-Charlemagne", city: "Nancy", code: "54000" },
  { name: "IUT de Saint-Dié-des-Vosges", city: "Saint-Dié-des-Vosges", code: "88100" },
  { name: "IUT de Montbéliard", city: "Montbéliard", code: "25000" },
  { name: "IUT de Dijon", city: "Dijon", code: "21000" },
  { name: "IUT d'Aix-Marseille", city: "Arles", code: "13200" },
  { name: "IUT de Toulon", city: "Toulon", code: "83000" },
  { name: "IUT de Béziers", city: "Béziers", code: "34500" },
  { name: "IUT 1 de Grenoble", city: "Saint-Martin-d'Hères", code: "38400" },
  { name: "IUT de Chambéry", city: "Le Bourget-du-Lac", code: "73370" },
  { name: "IUT de Vichy", city: "Vichy", code: "03200" },
  { name: "IUT du Puy-en-Velay", city: "Le Puy-en-Velay", code: "43000" },
  { name: "IUT de Corse", city: "Corte", code: "20250" },
  { name: "IUT Bordeaux Montaigne", city: "Bordeaux", code: "33000" },
  { name: "IUT d'Angoulême", city: "Angoulême", code: "16000" },
  { name: "IUT du Limousin", city: "Limoges", code: "87000" },
  { name: "IUT de Castres", city: "Castres", code: "81100" },
  { name: "IUT de Tarbes", city: "Tarbes", code: "65000" },
  { name: "IUT de Guadeloupe", city: "Saint-Claude", code: "97120" },
  { name: "IUT de Nouvelle-Calédonie", city: "Nouméa", code: "98800" },
];

// ============================================
// Hotels
// ============================================
const hotels = [
  {
    name: "Hôtel de la Poste",
    address: "10 place de la Libération",
    postalCode: "10000",
    city: "Troyes",
    phone: "03 25 73 05 05",
    email: "contact@hoteldelaposte.fr",
    websiteUrl: "https://www.hoteldelaposte.fr",
    latitude: 48.2973,
    longitude: 4.0744,
  },
  {
    name: "Ibis Troyes Centre",
    address: "22 rue Général de Gaulle",
    postalCode: "10000",
    city: "Troyes",
    phone: "03 25 71 11 11",
    email: "contact@ibistroyes.com",
    websiteUrl: "https://www.ibis.com",
    latitude: 48.2985,
    longitude: 4.0710,
  },
  {
    name: "Best Western La Chaumière",
    address: "Route de Sens",
    postalCode: "10600",
    city: "La Rivière-de-Corps",
    phone: "03 25 75 02 31",
    email: "lachaumiere@bestwestern.fr",
    websiteUrl: "https://www.bestwestern.fr",
    latitude: 48.2941,
    longitude: 4.0352,
  },
  {
    name: "Mercure Troyes Centre",
    address: "11 rue des Bas Trevois",
    postalCode: "10000",
    city: "Troyes",
    phone: "03 25 46 28 28",
    email: "H2083@accor.com",
    websiteUrl: "https://all.accor.com/mercure",
    latitude: 48.2951,
    longitude: 4.0768,
  },
  {
    name: "Kyriad Troyes Centre",
    address: "44 avenue Chomedey de Maisonneuve",
    postalCode: "10000",
    city: "Troyes",
    phone: "03 25 73 11 88",
    email: "troyes.centre@kyriad.fr",
    websiteUrl: "https://troyes-centre.kyriad.com",
    latitude: 48.2965,
    longitude: 4.0712,
  },
  {
    name: "B&B HOTEL Troyes Centre",
    address: "11 Boulevard du 14 Juillet",
    postalCode: "10000",
    city: "Troyes",
    phone: "08 92 78 81 05",
    email: "bb_4618@hotelbb.com",
    websiteUrl: "https://www.hotel-bb.com",
    latitude: 48.2938,
    longitude: 4.0701,
  },
];

// ============================================
// Programme (Events)
// ============================================
const events = [
  { title: "Accueil des participants", date: "2026-06-15", startTime: "09:00", endTime: "10:00", location: "Hall d'entrée", description: "Accueil café et remise des badges" },
  { title: "Séance plénière d'ouverture", date: "2026-06-15", startTime: "10:00", endTime: "12:00", location: "Amphithéâtre", description: "Discours d'ouverture et présentation du programme" },
  { title: "Déjeuner", date: "2026-06-15", startTime: "12:00", endTime: "14:00", location: "Restaurant universitaire", description: "Repas buffet" },
  { title: "Ateliers thématiques", date: "2026-06-15", startTime: "14:00", endTime: "17:00", location: "Salles de TD", description: "Sessions de travail en petits groupes" },
  { title: "Dîner de gala", date: "2026-06-15", startTime: "19:30", endTime: "23:00", location: "Salle des fêtes", description: "Soirée de gala avec animation musicale" },
  { title: "Petit-déjeuner réseau", date: "2026-06-16", startTime: "08:30", endTime: "09:30", location: "Hall d'entrée", description: "Café et viennoiseries pour échanger" },
  { title: "Conférence inspirante", date: "2026-06-16", startTime: "09:30", endTime: "12:00", location: "Amphithéâtre", description: "Intervention d'un expert sur l'innovation" },
  { title: "Déjeuner", date: "2026-06-16", startTime: "12:00", endTime: "14:00", location: "Restaurant universitaire", description: "Repas assis" },
  { title: "Quartier libre et activités", date: "2026-06-16", startTime: "14:00", endTime: "18:00", location: "En extérieur", description: "Temps libre pour participer aux activités sur inscription" },
  { title: "Dîner libre", date: "2026-06-16", startTime: "19:00", endTime: "22:00", location: "Centre-ville", description: "Dîner libre dans les restaurants de la ville" },
  { title: "Ateliers de restitution", date: "2026-06-17", startTime: "09:00", endTime: "11:00", location: "Amphithéâtre", description: "Présentation des travaux de groupe de la veille" },
  { title: "Séance plénière de clôture", date: "2026-06-17", startTime: "11:00", endTime: "12:00", location: "Amphithéâtre", description: "Bilan de l'événement et discours de fin" },
  { title: "Déjeuner d'au revoir", date: "2026-06-17", startTime: "12:00", endTime: "14:00", location: "Restaurant universitaire", description: "Buffet de départ" },
];

// ============================================
// Activities
// ============================================
const activities = [
  { name: "Visite de la cathédrale", date: "2026-06-16", startTime: "14:30", endTime: "16:30", price: 0, maxParticipants: 30, description: "Visite guidée de la cathédrale historique de la ville" },
  { name: "Atelier cuisine locale", date: "2026-06-16", startTime: "14:00", endTime: "17:00", price: 15.50, maxParticipants: 20, description: "Apprenez à cuisiner les spécialités régionales avec un chef" },
  { name: "Dégustation de vins", date: "2026-06-16", startTime: "15:00", endTime: "17:00", price: 25, maxParticipants: 40, description: "Découverte des cépages de la région et initiation à l'œnologie" },
  { name: "Escape Game", date: "2026-06-16", startTime: "14:30", endTime: "16:00", price: 20, maxParticipants: 15, description: "Résolvez les énigmes en équipe pour sortir de la salle" },
  { name: "Randonnée nature", date: "2026-06-17", startTime: "08:00", endTime: "10:30", price: 0, maxParticipants: 50, description: "Balade matinale guidée dans la forêt domaniale" },
  { name: "Tournoi de pétanque", date: "2026-06-17", startTime: "14:30", endTime: "17:00", price: 5, maxParticipants: 30, description: "Tournoi amical en plein air avec prêt du matériel" },
];

// ============================================
// Meals (groupés par repas avec leurs options)
// ============================================
type MealSeed = {
  name: string;
  date: string;
  mealType: "LUNCH" | "DINNER";
  price: number;
  options: { name: string; optionType: "STARTER" | "MAIN" | "DESSERT"; allergens: string[] }[];
};

const meals: MealSeed[] = [
  {
    name: "Déjeuner Jour 1", date: "2026-06-15", mealType: "LUNCH", price: 12.50,
    options: [
      { name: "Salade tomate-mozzarella", optionType: "STARTER", allergens: ["LAIT"] },
      { name: "Œufs mayonnaise", optionType: "STARTER", allergens: ["OEUFS", "MOUTARDE"] },
      { name: "Soupe de carottes", optionType: "STARTER", allergens: ["CELERI"] },
      { name: "Poulet rôti et purée", optionType: "MAIN", allergens: ["LAIT"] },
      { name: "Pavé de saumon et riz", optionType: "MAIN", allergens: ["POISSON", "LAIT"] },
      { name: "Lasagnes végétariennes", optionType: "MAIN", allergens: ["GLUTEN", "LAIT"] },
      { name: "Yaourt aux fruits", optionType: "DESSERT", allergens: ["LAIT"] },
      { name: "Tarte au citron", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
      { name: "Compote de pommes", optionType: "DESSERT", allergens: [] },
    ],
  },
  {
    name: "Dîner Jour 1", date: "2026-06-15", mealType: "DINNER", price: 12.50,
    options: [
      { name: "Quiche lorraine", optionType: "STARTER", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
      { name: "Velouté de courge", optionType: "STARTER", allergens: ["LAIT", "CELERI"] },
      { name: "Salade verte et noix", optionType: "STARTER", allergens: ["MOUTARDE", "FRUITS A COQUE"] },
      { name: "Risotto aux champignons", optionType: "MAIN", allergens: ["LAIT", "SULFITES"] },
      { name: "Steak et frites maison", optionType: "MAIN", allergens: [] },
      { name: "Cabillaud vapeur et haricots verts", optionType: "MAIN", allergens: ["POISSON"] },
      { name: "Mousse au chocolat", optionType: "DESSERT", allergens: ["OEUFS", "LAIT", "SOJA"] },
      { name: "Salade de fruits frais", optionType: "DESSERT", allergens: [] },
      { name: "Crème caramel", optionType: "DESSERT", allergens: ["LAIT", "OEUFS"] },
    ],
  },
  {
    name: "Déjeuner Jour 2", date: "2026-06-16", mealType: "LUNCH", price: 12.50,
    options: [
      { name: "Taboulé à la menthe", optionType: "STARTER", allergens: ["GLUTEN"] },
      { name: "Avocat et crevettes", optionType: "STARTER", allergens: ["CRUSTACES", "OEUFS", "MOUTARDE"] },
      { name: "Pâté en croûte", optionType: "STARTER", allergens: ["GLUTEN", "LAIT", "OEUFS", "SULFITES"] },
      { name: "Hachis Parmentier", optionType: "MAIN", allergens: ["LAIT", "SULFITES"] },
      { name: "Curry de pois chiches", optionType: "MAIN", allergens: ["FRUITS A COQUE"] },
      { name: "Nouilles sautées au bœuf", optionType: "MAIN", allergens: ["GLUTEN", "SOJA", "SESAME"] },
      { name: "Île flottante", optionType: "DESSERT", allergens: ["OEUFS", "LAIT", "FRUITS A COQUE"] },
      { name: "Brownie au chocolat", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS", "FRUITS A COQUE"] },
      { name: "Sorbet au citron", optionType: "DESSERT", allergens: [] },
    ],
  },
  {
    name: "Dîner Jour 2", date: "2026-06-16", mealType: "DINNER", price: 12.50,
    options: [
      { name: "Salade de chèvre chaud", optionType: "STARTER", allergens: ["GLUTEN", "LAIT", "MOUTARDE"] },
      { name: "Gaspacho andalou", optionType: "STARTER", allergens: ["GLUTEN", "CELERI"] },
      { name: "Carpaccio de bœuf", optionType: "STARTER", allergens: ["LAIT"] },
      { name: "Pizza Margherita", optionType: "MAIN", allergens: ["GLUTEN", "LAIT"] },
      { name: "Filet mignon à la moutarde", optionType: "MAIN", allergens: ["MOUTARDE", "LAIT", "SULFITES"] },
      { name: "Wok de crevettes", optionType: "MAIN", allergens: ["CRUSTACES", "SOJA", "SESAME"] },
      { name: "Panna cotta coulis rouge", optionType: "DESSERT", allergens: ["LAIT"] },
      { name: "Tarte aux pommes", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
      { name: "Fondant au chocolat", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
    ],
  },
  {
    name: "Déjeuner Jour 3", date: "2026-06-17", mealType: "LUNCH", price: 12.50,
    options: [
      { name: "Melon et jambon cru", optionType: "STARTER", allergens: [] },
      { name: "Salade César", optionType: "STARTER", allergens: ["GLUTEN", "LAIT", "OEUFS", "POISSON", "MOUTARDE"] },
      { name: "Bruschetta à la tomate", optionType: "STARTER", allergens: ["GLUTEN"] },
      { name: "Couscous au poulet", optionType: "MAIN", allergens: ["GLUTEN", "CELERI"] },
      { name: "Tartiflette", optionType: "MAIN", allergens: ["LAIT"] },
      { name: "Dos de lieu noir et fondue de poireaux", optionType: "MAIN", allergens: ["POISSON", "LAIT"] },
      { name: "Tiramisu", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
      { name: "Clafoutis aux cerises", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS"] },
      { name: "Riz au lait", optionType: "DESSERT", allergens: ["LAIT"] },
    ],
  },
  {
    name: "Dîner Jour 3", date: "2026-06-17", mealType: "DINNER", price: 12.50,
    options: [
      { name: "Champignons farcis", optionType: "STARTER", allergens: ["LAIT"] },
      { name: "Salade d'endives, roquefort et noix", optionType: "STARTER", allergens: ["LAIT", "FRUITS A COQUE", "MOUTARDE"] },
      { name: "Samoussas aux légumes", optionType: "STARTER", allergens: ["GLUTEN"] },
      { name: "Blanquette de veau", optionType: "MAIN", allergens: ["LAIT", "CELERI", "SULFITES"] },
      { name: "Chili con carne", optionType: "MAIN", allergens: [] },
      { name: "Gratin dauphinois et salade", optionType: "MAIN", allergens: ["LAIT", "MOUTARDE"] },
      { name: "Crumble aux fruits rouges", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT"] },
      { name: "Paris-Brest", optionType: "DESSERT", allergens: ["GLUTEN", "LAIT", "OEUFS", "FRUITS A COQUE"] },
      { name: "Poire Belle Hélène", optionType: "DESSERT", allergens: ["LAIT", "SOJA"] },
    ],
  },
];

// ============================================
// Random helpers
// ============================================
const firstNames = [
  "Lucas", "Emma", "Hugo", "Jade", "Louis", "Léa", "Gabriel", "Chloé",
  "Raphaël", "Alice", "Arthur", "Manon", "Jules", "Camille", "Adam",
  "Inès", "Maël", "Lina", "Léo", "Sarah", "Nathan", "Louise", "Tom",
  "Mila", "Théo", "Anna", "Noah", "Eva", "Ethan", "Clara", "Paul",
  "Zoé", "Gabin", "Juliette", "Nolan", "Rose", "Sacha", "Ambre",
  "Axel", "Margaux", "Victor", "Agathe", "Mohamed", "Lola", "Valentin",
  "Lucie", "Clément", "Romane", "Maxime", "Charlotte",
];

const lastNames = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
  "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
  "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel",
  "Girard", "André", "Lefèvre", "Mercier", "Dupont", "Lambert", "Bonnet",
  "François", "Martinez",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone(): string {
  return `06${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`;
}

function chance(p: number): boolean {
  return Math.random() < p;
}

// ============================================
// Main
// ============================================
async function main() {
  console.log("🧹 Nettoyage des données existantes...");
  await prisma.auditLog.deleteMany();
  await prisma.registrationActivity.deleteMany();
  await prisma.registrationMeal.deleteMany();
  await prisma.order.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.mealOption.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.event.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.iut.deleteMany();

  // ============================================
  // IUTs
  // ============================================
  console.log(`📍 Création de ${iuts.length} IUTs...`);
  const createdIuts = await Promise.all(
    iuts.map((iut) => prisma.iut.create({ data: iut })),
  );

  // ============================================
  // Hotels
  // ============================================
  console.log(`🏨 Création de ${hotels.length} hôtels...`);
  await Promise.all(hotels.map((h) => prisma.hotel.create({ data: h })));

  // ============================================
  // Events (Programme)
  // ============================================
  console.log(`📅 Création de ${events.length} événements du programme...`);
  await Promise.all(
    events.map((e) =>
      prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          date: new Date(e.date),
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
        },
      }),
    ),
  );

  // ============================================
  // Activities
  // ============================================
  console.log(`🎨 Création de ${activities.length} activités...`);
  const createdActivities = await Promise.all(
    activities.map((a) =>
      prisma.activity.create({
        data: {
          name: a.name,
          description: a.description,
          date: new Date(a.date),
          startTime: a.startTime,
          endTime: a.endTime,
          price: a.price,
          maxParticipants: a.maxParticipants,
        },
      }),
    ),
  );

  // ============================================
  // Meals + Options
  // ============================================
  console.log(`🍽️ Création de ${meals.length} repas avec leurs options...`);
  const createdMeals: { id: string; date: Date; options: { id: string; optionType: string }[] }[] = [];

  for (const meal of meals) {
    const created = await prisma.meal.create({
      data: {
        name: meal.name,
        date: new Date(meal.date),
        mealType: meal.mealType,
        price: meal.price,
        options: {
          create: meal.options.map((o) => ({
            name: o.name,
            optionType: o.optionType,
            allergens: o.allergens,
            hasAllergens: o.allergens.length > 0,
          })),
        },
      },
      include: { options: true },
    });

    createdMeals.push({
      id: created.id,
      date: created.date,
      options: created.options.map((o) => ({ id: o.id, optionType: o.optionType })),
    });
  }

  // ============================================
  // Settings & Content (singletons)
  // ============================================
  console.log("⚙️  Mise à jour des paramètres et contenus...");
  await prisma.setting.upsert({
    where: { id: "site_settings" },
    create: {
      showProgramme: true,
      showInscription: true,
      showActivities: true,
      showMeals: true,
      showAcces: true,
      showHotels: true,
      headerBadgeText: "Édition 2026",
      siteName: "ACD MMI 2026",
      eventDate: new Date("2026-06-15T00:00:00.000Z"),
      eventEndDate: new Date("2026-06-17T00:00:00.000Z"),
      location: "IUT de Troyes",
      locationAddress: "9 Rue de Québec, 10000 Troyes",
      sendInvoicePdf: true,
      maintenanceMode: false,
    },
    update: {
      eventDate: new Date("2026-06-15T00:00:00.000Z"),
      eventEndDate: new Date("2026-06-17T00:00:00.000Z"),
      maintenanceMode: false,
    },
  });

  await prisma.homeContent.upsert({
    where: { id: "home_content" },
    create: {},
    update: {},
  });
  await prisma.accessContent.upsert({
    where: { id: "access_content" },
    create: {},
    update: {},
  });
  await prisma.programmeContent.upsert({
    where: { id: "programme_content" },
    create: {},
    update: {},
  });
  await prisma.inscriptionContent.upsert({
    where: { id: "inscription_content" },
    create: {},
    update: {},
  });
  await prisma.hotelsContent.upsert({
    where: { id: "hotels_content" },
    create: {},
    update: {},
  });

  // ============================================
  // Registrations + Meals + Activities + Orders
  // ============================================
  const TOTAL_REGISTRATIONS = 45;
  console.log(`👥 Création de ${TOTAL_REGISTRATIONS} inscriptions avec repas, activités et commandes...`);

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  for (let i = 0; i < TOTAL_REGISTRATIONS; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const iut = randomItem(createdIuts);
    const createdAt = randomDate(threeMonthsAgo, now);

    const isVegetarian = chance(0.18);
    const isVegan = !isVegetarian && chance(0.06);
    const noPork = chance(0.12);
    const noAlcohol = chance(0.18);
    const isMotorized = chance(0.45);
    const allergens = chance(0.15)
      ? randomItem(["Arachide", "Lactose", "Gluten", "Fruits à coque"])
      : null;

    // Status distribution: 65% confirmed, 25% pending, 10% cancelled
    const r = Math.random();
    const status: "PENDING" | "CONFIRMED" | "CANCELLED" =
      r < 0.65 ? "CONFIRMED" : r < 0.9 ? "PENDING" : "CANCELLED";

    // Choose 2-5 meals randomly
    const mealCount = 2 + Math.floor(Math.random() * 4);
    const selectedMeals = [...createdMeals]
      .sort(() => Math.random() - 0.5)
      .slice(0, mealCount);

    // Choose 0-2 activities
    const activityCount = Math.floor(Math.random() * 3);
    const selectedActivities = [...createdActivities]
      .sort(() => Math.random() - 0.5)
      .slice(0, activityCount);

    // Compute total price
    let totalPrice = 0;
    totalPrice += selectedMeals.length * 12.50;
    for (const a of selectedActivities) {
      totalPrice += Number(a.price);
    }

    const registration = await prisma.registration.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: randomPhone(),
        iutId: iut.id,
        allergens,
        isMotorized,
        isVegetarian,
        isVegan,
        noPork,
        noAlcohol,
        totalPrice,
        status,
        checkedIn: status === "CONFIRMED" && chance(0.3),
        checkedInAt: status === "CONFIRMED" && chance(0.3) ? new Date() : null,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Meal selections
    for (const m of selectedMeals) {
      const starter = m.options.find((o) => o.optionType === "STARTER");
      const main = m.options.find((o) => o.optionType === "MAIN");
      const dessert = m.options.find((o) => o.optionType === "DESSERT");

      await prisma.registrationMeal.create({
        data: {
          registrationId: registration.id,
          mealId: m.id,
          starterOptionId: starter?.id ?? null,
          mainOptionId: main?.id ?? null,
          dessertOptionId: dessert?.id ?? null,
        },
      });
    }

    // Activity selections
    for (const a of selectedActivities) {
      await prisma.registrationActivity.create({
        data: {
          registrationId: registration.id,
          activityId: a.id,
        },
      });
    }

    // Order
    let paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" = "PENDING";
    if (status === "CONFIRMED") paymentStatus = chance(0.9) ? "PAID" : "PENDING";
    else if (status === "CANCELLED") paymentStatus = chance(0.5) ? "REFUNDED" : "FAILED";

    const paymentMethod = paymentStatus === "PAID"
      ? randomItem(["CARD", "TRANSFER", "CASH"] as const)
      : null;

    await prisma.order.create({
      data: {
        orderNumber: `ACD-2026-${String(i + 1).padStart(4, "0")}`,
        registrationId: registration.id,
        amount: totalPrice,
        paymentStatus,
        paymentMethod,
        paidAt: paymentStatus === "PAID" ? randomDate(createdAt, now) : null,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Audit log entry
    await prisma.auditLog.create({
      data: {
        action: "registration.created",
        entityType: "Registration",
        entityId: registration.id,
        metadata: { firstName, lastName, status },
        createdAt,
      },
    });

    if (status === "CONFIRMED") {
      await prisma.auditLog.create({
        data: {
          action: "registration.confirmed",
          entityType: "Registration",
          entityId: registration.id,
          metadata: { firstName, lastName },
          createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60),
        },
      });
    }

    if (paymentStatus === "PAID") {
      await prisma.auditLog.create({
        data: {
          action: "order.paid",
          entityType: "Order",
          entityId: registration.id,
          metadata: { amount: totalPrice, method: paymentMethod },
          createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 2),
        },
      });
    }
  }

  console.log("✅ Seed terminé avec succès !");
  console.log(`   - ${iuts.length} IUTs`);
  console.log(`   - ${hotels.length} hôtels`);
  console.log(`   - ${events.length} événements du programme`);
  console.log(`   - ${activities.length} activités`);
  console.log(`   - ${meals.length} repas (avec options)`);
  console.log(`   - ${TOTAL_REGISTRATIONS} inscriptions complètes`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
