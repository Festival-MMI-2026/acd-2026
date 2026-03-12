let cache: { value: boolean; expires: number } | null = null;
const CACHE_TTL = 10_000; // 10 secondes

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  // Laisser passer : admin, api, assets Nuxt, page maintenance, signin, callback
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api/") ||
    path.startsWith("/_nuxt") ||
    path.startsWith("/__nuxt") ||
    path.startsWith("/_ipx") ||
    path === "/maintenance" ||
    path === "/auth/signin" ||
    path === "/auth/callback" ||
    path === "/auth/reset-password" ||
    path.startsWith("/favicon")
  ) {
    return;
  }

  const now = Date.now();
  if (!cache || cache.expires < now) {
    try {
      const settings = await prisma.setting.findUnique({
        where: { id: "site_settings" },
        select: { maintenanceMode: true },
      });
      cache = {
        value: settings?.maintenanceMode ?? false,
        expires: now + CACHE_TTL,
      };
    } catch {
      return;
    }
  }

  if (cache.value) {
    await sendRedirect(event, "/maintenance", 302);
  }
});
