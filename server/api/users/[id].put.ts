export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const { firstName, lastName, email, tel, iut } = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID utilisateur manquant",
    });
  }

  try {
    // Check if unique email (if changed)
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: "Cet email est déjà utilisé",
        });
      }
    }

    // Construct name from first/last if available
    // If only one is provided, we might need to fetch the user first to construct the full name properly,
    // but to keep it simple/efficient we'll assume both are usually provided or we just concat what we have
    // However, for a partial update, this is risky.
    // Best practice: Fetch current user if either name part is missing to ensure consistency.

    let name = undefined;
    if (firstName || lastName) {
      // If we don't have both in the payload, we need to fetch the existing user
      if (!firstName || !lastName) {
        const currentUser = await prisma.user.findUnique({
          where: { id },
          select: { firstName: true, lastName: true },
        });
        const fName = firstName || currentUser?.firstName || "";
        const lName = lastName || currentUser?.lastName || "";
        name = `${fName} ${lName}`.trim();
      } else {
        name = `${firstName} ${lastName}`.trim();
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        name,
        email,
        tel,
        iut,
      },
    });

    logAudit("user.updated", "User", id, null, { name: user.name, email: user.email });

    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
});
