export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event);
  const id = getRouterParam(event, "id");
  const { firstName, lastName, email, tel, iut } = await readValidated(
    event,
    userUpdateSchema,
  );

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID utilisateur manquant",
    });
  }

  const admin = isAdmin(sessionUser);
  if (!admin && sessionUser.id !== id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  try {
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: "Cet email est déjà utilisé",
        });
      }
    }

    let name: string | undefined;
    if (firstName || lastName) {
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
        email: admin ? email : undefined,
        tel,
        iut,
      },
    });

    logAudit("user.updated", "User", id, sessionUser.id, {
      name: user.name,
      email: user.email,
    });

    return user;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    console.error("Error updating user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
});
