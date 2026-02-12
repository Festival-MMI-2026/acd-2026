import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../server/generated/prisma/client";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

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

const statuses = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(time);
}

function randomPrice(): number {
  // Prices between 5 and 50 euros
  return Math.round((5 + Math.random() * 45) * 100) / 100;
}

async function main() {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const registrations = [];

  // Generate ~80 registrations spread over the last 3 months
  for (let i = 0; i < 80; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const date = randomDate(threeMonthsAgo, now);
    const price = randomPrice();
    const status = Math.random() < 0.7 ? "CONFIRMED" : Math.random() < 0.5 ? "PENDING" : "CANCELLED";

    registrations.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      totalPrice: price,
      status: status as typeof statuses[number],
      createdAt: date,
      updatedAt: date,
    });
  }

  console.log(`Creating ${registrations.length} registrations...`);

  for (const reg of registrations) {
    await prisma.registration.create({ data: reg });
  }

  console.log("Done! Registrations created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
