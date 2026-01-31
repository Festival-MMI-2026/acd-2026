<template>
  <!-- Footer -->
  <footer class="border-t border-border/50 py-8">
    <div
      class="container max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6"
    >
      <!-- Left: Copyright -->
      <p class="text-sm text-muted-foreground">
        © 2026 ACD. Tous droits réservés.
      </p>

      <!-- Center: Links -->
      <nav class="flex items-center gap-6 text-sm text-muted-foreground">
        <NuxtLink
          to="/programme"
          class="hover:text-foreground transition-colors"
        >
          Programme
        </NuxtLink>
        <NuxtLink
          to="/inscription"
          class="hover:text-foreground transition-colors"
        >
          Inscription
        </NuxtLink>
      </nav>

      <!-- Right: Social/Info -->
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <a
          href="mailto:contact@acd-iut.fr"
          class="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="lucide:mail" class="h-4 w-4" />
          <span class="hidden sm:inline">Contact</span>
        </a>
      </div>
    </div>
  </footer>
</template>
