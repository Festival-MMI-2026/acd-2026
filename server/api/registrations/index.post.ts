import { render } from "@vue-email/render";
import RegistrationConfirmationEmail from "../../emails/RegistrationConfirmationEmail.vue";
import { sendMail } from "../../utils/mail";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    firstName,
    lastName,
    email,
    phone,
    iutId,
    allergens,
    isMotorized,
    totalPrice,
    meals = [],
    activities = [],
  } = body;

  // Validation
  if (!firstName || !lastName || !email || !phone) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tous les champs personnels sont requis",
    });
  }

  try {
    // Generate order number: ACD-26-TROYES-XXXXX
    const year = new Date().getFullYear().toString().slice(-2);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const random = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    const orderNumber = `ACD${year}TRYES-${random}`;

    // Create registration with related meals, activities, and order
    const registration = await prisma.registration.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        iutId: iutId || null,
        allergens: allergens || null,
        isMotorized: isMotorized || false,
        totalPrice: totalPrice || 0,
        status: "PENDING",
        meals: {
          create: meals.map((meal: any) => ({
            mealId: meal.mealId,
            starterOptionId: meal.starterOptionId || null,
            mainOptionId: meal.mainOptionId || null,
            dessertOptionId: meal.dessertOptionId || null,
          })),
        },
        activities: {
          create: activities.map((activityId: string) => ({
            activityId,
          })),
        },
        // Create order at the same time
        order: {
          create: {
            orderNumber,
            amount: totalPrice || 0,
            paymentStatus: "PENDING",
            notes: allergens ? `Allergies: ${allergens}` : null,
          },
        },
      },
      include: {
        meals: {
          include: {
            meal: true,
            starterOption: true,
            mainOption: true,
            dessertOption: true,
          },
        },
        activities: {
          include: {
            activity: true,
          },
        },
        order: true,
      },
    });

    // Send confirmation email (fire-and-forget)
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const emailMeals = registration.meals.map((m: any) => ({
      mealName: m.meal?.name || "",
      starter: m.starterOption?.name || null,
      main: m.mainOption?.name || null,
      dessert: m.dessertOption?.name || null,
    }));
    const emailActivities = registration.activities.map(
      (a: any) => a.activity?.name || "",
    );

    render(RegistrationConfirmationEmail, {
      firstName: registration.firstName,
      lastName: registration.lastName,
      orderNumber: registration.order?.orderNumber || orderNumber,
      totalPrice: registration.totalPrice,
      meals: emailMeals,
      activities: emailActivities,
      appUrl,
    })
      .then((html) =>
        sendMail(
          registration.email,
          `Confirmation d'inscription ACD - ${registration.order?.orderNumber || orderNumber}`,
          html,
        ),
      )
      .catch(console.error);

    return registration;
  } catch (error: any) {
    console.error("Registration creation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error.message || "Erreur lors de la création de l'inscription",
    });
  }
});
