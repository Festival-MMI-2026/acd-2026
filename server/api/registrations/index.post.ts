import { render } from "@vue-email/render";
import RegistrationConfirmationEmail from "../../emails/RegistrationConfirmationEmail.vue";
import NewRegistrationNotifEmail from "../../emails/NewRegistrationNotifEmail.vue";
import { sendMail } from "../../utils/mail";
import { generateInvoicePdf } from "../../utils/generateInvoicePdf";
import { buildLogoAttachment, buildQrAttachment } from "../../utils/emailAssets";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event);
  const {
    firstName,
    lastName,
    phone,
    iutId,
    allergens,
    isMotorized,
    isVegetarian,
    isVegan,
    noPork,
    noAlcohol,
    meals,
    activities,
  } = await readValidated(event, registrationCreateSchema);

  const email = sessionUser.email;

  const existingRegistration = await prisma.registration.findFirst({
    where: { email },
    select: { id: true },
  });
  if (existingRegistration) {
    throw createError({
      statusCode: 409,
      statusMessage: "Vous avez déjà une inscription",
    });
  }

  try {
    // Generate order number: PACD-XXXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const random = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    const orderNumber = `PACD-${random}`;

    // Generate registration number: IACD-XXXXX
    const regRandom = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    const registrationId = `IACD-${regRandom}`;

    // Server-side price recalculation from actual DB prices
    const mealIds = meals.map((m: any) => m.mealId).filter(Boolean);
    const activityIds = activities.filter(Boolean);

    const [dbMeals, dbActivities] = await Promise.all([
      mealIds.length > 0
        ? prisma.meal.findMany({ where: { id: { in: mealIds } }, select: { id: true, price: true } })
        : Promise.resolve([]),
      activityIds.length > 0
        ? prisma.activity.findMany({ where: { id: { in: activityIds } }, select: { id: true, price: true } })
        : Promise.resolve([]),
    ]);

    let computedTotal = 0;
    for (const meal of dbMeals) {
      computedTotal += Number(meal.price) || 0;
    }
    for (const activity of dbActivities) {
      computedTotal += Number(activity.price) || 0;
    }

    // Create registration with related meals, activities, and order
    const registration = await prisma.registration.create({
      data: {
        id: registrationId,
        firstName,
        lastName,
        email,
        phone,
        iutId: iutId || null,
        allergens: allergens || null,
        isMotorized: isMotorized || false,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        noPork: noPork || false,
        noAlcohol: noAlcohol || false,
        totalPrice: computedTotal,
        status: "PENDING",
        meals: {
          create: meals.map((meal: any) => ({
            mealId: meal.mealId,
            starterOptionId: meal.starterOptionId || null,
            mainOptionId: meal.mainOptionId || null,
            cheeseOptionId: meal.cheeseOptionId || null,
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
            amount: computedTotal,
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
            cheeseOption: true,
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

    // Log audit event
    logAudit("registration.created", "Registration", registrationId, null, {
      name: `${firstName} ${lastName}`,
      email,
      totalPrice: computedTotal,
    });

    // Send confirmation email with invoice PDF attachment (fire-and-forget)
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const sortedMeals = [...registration.meals].sort((a: any, b: any) => {
      const da = new Date(a.meal?.date ?? 0).getTime();
      const db = new Date(b.meal?.date ?? 0).getTime();
      if (da !== db) return da - db;
      const order = { LUNCH: 0, DINNER: 1 } as Record<string, number>;
      return (order[a.meal?.mealType] ?? 9) - (order[b.meal?.mealType] ?? 9);
    });
    const emailMeals = sortedMeals.map((m: any) => ({
      mealName: m.meal?.name || "",
      starter: m.starterOption?.name || null,
      main: m.mainOption?.name || null,
      cheese: m.cheeseOption?.name || null,
      dessert: m.dessertOption?.name || null,
      price: Number(m.meal?.price ?? 0),
    }));
    const emailActivities = registration.activities.map((a: any) => ({
      name: a.activity?.name || "",
      price: Number(a.activity?.price ?? 0),
    }));

    const [settings, iut] = await Promise.all([
      prisma.setting.findUnique({ where: { id: "site_settings" } }),
      registration.iutId
        ? prisma.iut.findUnique({ where: { id: registration.iutId } })
        : null,
    ]);

    const invoiceData = {
      registration,
      settings,
      iutName: iut?.name ?? null,
      totalPrice: computedTotal,
      paymentStatus: registration.order?.paymentStatus || registration.status,
      paymentMethod: registration.order?.paymentMethod || null,
      paidAt: registration.order?.paidAt || null,
    };

    const finalOrderNumber = registration.order?.orderNumber || orderNumber;
    const shouldSendPdf = settings?.sendInvoicePdf ?? true;

    // Send confirmation email to the registrant
    const emailRender = render(RegistrationConfirmationEmail, {
      firstName: registration.firstName,
      lastName: registration.lastName,
      orderNumber: finalOrderNumber,
      registrationId: registration.id,
      totalPrice: Number(registration.totalPrice),
      meals: emailMeals,
      activities: emailActivities,
      appUrl,
    });

    const inlineAssets = Promise.all([
      buildLogoAttachment(),
      buildQrAttachment(registration.id),
    ]).then((items) => items.filter((a): a is NonNullable<typeof a> => !!a));

    if (shouldSendPdf) {
      Promise.all([emailRender, generateInvoicePdf(invoiceData), inlineAssets])
        .then(([html, pdfBuffer, inline]) =>
          sendMail(
            registration.email,
            `Confirmation d'inscription ACD - ${finalOrderNumber}`,
            html,
            [
              ...inline,
              {
                filename: `Facture_${finalOrderNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          ),
        )
        .catch(console.error);
    } else {
      Promise.all([emailRender, inlineAssets])
        .then(([html, inline]) =>
          sendMail(
            registration.email,
            `Confirmation d'inscription ACD - ${finalOrderNumber}`,
            html,
            inline,
          ),
        )
        .catch(console.error);
    }

    // Send notification email to configured admin recipients
    const notificationEmails = settings?.notificationEmails ?? [];
    if (notificationEmails.length > 0) {
      Promise.all([
        render(NewRegistrationNotifEmail, {
          firstName: registration.firstName,
          lastName: registration.lastName,
          email: registration.email,
          registrationId: registration.id,
          orderNumber: finalOrderNumber,
          totalPrice: Number(registration.totalPrice),
          appUrl,
        }),
        buildLogoAttachment(),
      ])
        .then(([html, logo]) =>
          sendMail(
            notificationEmails.join(", "),
            `Nouvelle inscription ACD - ${registration.firstName} ${registration.lastName}`,
            html,
            logo ? [logo] : undefined,
          ),
        )
        .catch(console.error);
    }

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
