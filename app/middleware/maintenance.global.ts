export default defineNuxtRouteMiddleware(async (to) => {
  // Laisser passer admin, maintenance, signin, callback
  if (
    to.path.startsWith("/admin") ||
    to.path === "/maintenance" ||
    to.path === "/auth/signin" ||
    to.path === "/auth/callback" ||
    to.path === "/auth/reset-password"
  ) return;

  // Uniquement côté client (le serveur gère déjà le cas SSR)
  if (import.meta.server) return;

  const settings = await $fetch("/api/settings").catch(() => null);
  if (settings?.maintenanceMode) {
    return navigateTo("/maintenance");
  }
});
