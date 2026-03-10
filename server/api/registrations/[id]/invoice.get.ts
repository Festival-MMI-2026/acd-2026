import { generateInvoicePdf } from "../../../utils/generateInvoicePdf";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID d'inscription requis",
    });
  }

  // Fetch registration with order, meals, and activities
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      order: true,
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
    },
  });

  if (!registration) {
    throw createError({
      statusCode: 404,
      statusMessage: "Inscription non trouvée",
    });
  }

  // Fetch settings for header/location context
  const [settings, iut] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "site_settings" } }),
    registration.iutId
      ? prisma.iut.findUnique({ where: { id: registration.iutId } })
      : null,
  ]);

  // Recalculate total price from actual meal + activity prices
  let computedTotal = 0;
  if (registration.meals) {
    for (const m of registration.meals as any[]) {
      computedTotal += Number(m.meal?.price) || 0;
    }
  }
  if (registration.activities) {
    for (const a of registration.activities as any[]) {
      computedTotal += Number(a.activity?.price) || 0;
    }
  }

  // Prepare data for template
  const data = {
    registration,
    settings,
    iutName: iut?.name ?? null,
    totalPrice: computedTotal,
    paymentStatus: registration.order?.paymentStatus || registration.status,
    paymentMethod: registration.order?.paymentMethod || null,
    paidAt: registration.order?.paidAt || null,
  };

  try {
    const pdfBuffer = await generateInvoicePdf(data);

    setHeader(event, "Content-Type", "application/pdf");
    setHeader(
      event,
      "Content-Disposition",
      `inline; filename="Facture_${registration.order?.orderNumber || registration.id}.pdf"`,
    );
    setResponseStatus(event, 200);
    return send(event, pdfBuffer, "application/pdf");
  } catch (error: any) {
    console.error("Gotenberg Error generating PDF:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de générer la facture PDF.",
    });
  }
});
