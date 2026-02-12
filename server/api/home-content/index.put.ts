export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const content = await prisma.homeContent.upsert({
    where: { id: "home_content" },
    update: {
      heroBadge: body.heroBadge,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      heroImage: body.heroImage,
      tabs: body.tabs,
      gradientCards: body.gradientCards,
      logos: body.logos,
      contextTitle: body.contextTitle,
      contextText: body.contextText,
      ctaTitle: body.ctaTitle,
      ctaText: body.ctaText,
    },
    create: {
      id: "home_content",
      heroBadge: body.heroBadge,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      heroImage: body.heroImage,
      tabs: body.tabs,
      gradientCards: body.gradientCards,
      logos: body.logos,
      contextTitle: body.contextTitle,
      contextText: body.contextText,
      ctaTitle: body.ctaTitle,
      ctaText: body.ctaText,
    },
  });

  return content;
});
