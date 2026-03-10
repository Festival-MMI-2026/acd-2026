export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tables: string[] = body.tables || [];

  const deleted: Record<string, number> = {};

  // Order matters due to foreign key constraints
  // Delete junction/child tables first, then parent tables

  if (tables.includes("registrations")) {
    // RegistrationMeal and RegistrationActivity cascade from Registration
    // Order cascade from Registration
    const orders = await prisma.order.deleteMany({});
    const regMeals = await prisma.registrationMeal.deleteMany({});
    const regActivities = await prisma.registrationActivity.deleteMany({});
    const registrations = await prisma.registration.deleteMany({});
    deleted.orders = orders.count;
    deleted.registrationMeals = regMeals.count;
    deleted.registrationActivities = regActivities.count;
    deleted.registrations = registrations.count;
  }

  if (tables.includes("orders") && !tables.includes("registrations")) {
    const orders = await prisma.order.deleteMany({});
    deleted.orders = orders.count;
  }

  if (tables.includes("meals")) {
    // MealOption cascades from Meal
    // RegistrationMeal references Meal, delete those first if not already done
    if (!tables.includes("registrations")) {
      const regMeals = await prisma.registrationMeal.deleteMany({});
      deleted.registrationMeals = regMeals.count;
    }
    const mealOptions = await prisma.mealOption.deleteMany({});
    const meals = await prisma.meal.deleteMany({});
    deleted.mealOptions = mealOptions.count;
    deleted.meals = meals.count;
  }

  if (tables.includes("activities")) {
    // RegistrationActivity references Activity, delete those first if not already done
    if (!tables.includes("registrations")) {
      const regActivities = await prisma.registrationActivity.deleteMany({});
      deleted.registrationActivities = regActivities.count;
    }
    const activities = await prisma.activity.deleteMany({});
    deleted.activities = activities.count;
  }

  if (tables.includes("hotels")) {
    const hotels = await prisma.hotel.deleteMany({});
    deleted.hotels = hotels.count;
  }

  if (tables.includes("programme")) {
    const events = await prisma.event.deleteMany({});
    deleted.events = events.count;
  }

  logAudit("data.cleared", "System", "clear-data", null, { tables, deleted });

  return { success: true, deleted };
});
