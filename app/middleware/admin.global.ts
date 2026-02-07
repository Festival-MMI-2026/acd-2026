export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) return;

  // Forward cookies during SSR so the session can be validated
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  const session = await $fetch<{ user: { role?: string } }>(
    "/api/auth/get-session",
    { headers },
  ).catch(() => null);

  // Not authenticated -> redirect to home
  if (!session?.user) {
    return navigateTo("/");
  }

  // Not admin role -> redirect to home
  if (session.user.role !== "admin") {
    return navigateTo("/");
  }
});
