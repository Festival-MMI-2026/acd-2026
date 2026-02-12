<template>
  <footer class="border-t border-border py-16 bg-muted/50">
    <div class="container max-w-screen-xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
        <!-- Logo + CTA -->
        <div class="md:col-span-2 space-y-6">
          <div class="flex items-center gap-2">
            <img
              src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
              alt="ACD Logo"
              class="h-12 dark:hidden"
            />
            <img
              src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
              alt="ACD Logo"
              class="h-12 hidden dark:block dark:grayscale dark:contrast-1"
            />
            <span class="text-xl font-bold">ACD</span>
          </div>

          <Button variant="secondary" as-child>
            <NuxtLink to="/inscription">
              S'inscrire maintenant
              <Icon name="lucide:arrow-up-right" class="ml-1 h-4 w-4" />
            </NuxtLink>
          </Button>

          <p class="text-sm text-muted-foreground">
            © {{ new Date().getFullYear() }} ACD. Tous droits réservés.
          </p>

          <!-- Theme Toggle -->
          <ToggleTheme />
        </div>

        <!-- Navigation -->
        <div class="space-y-4">
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Navigation
          </h3>
          <nav
            aria-label="Navigation secondaire"
            class="flex flex-col space-y-3"
          >
            <NuxtLink
              to="/programme"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Programme
            </NuxtLink>
            <NuxtLink
              to="/inscription"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Inscription
            </NuxtLink>
            <NuxtLink
              to="/acces"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Accès
            </NuxtLink>
          </nav>
        </div>

        <!-- Informations -->
        <div class="space-y-4">
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Informations
          </h3>
          <nav aria-label="Informations utiles" class="flex flex-col space-y-3">
            <NuxtLink
              to="/hotels"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hébergement
            </NuxtLink>
            <NuxtLink
              to="/acces"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Accès
            </NuxtLink>
          </nav>
        </div>

        <!-- Contact -->
        <div class="space-y-4">
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Contact
          </h3>
          <div class="flex flex-col space-y-3">
            <a
              href="mailto:contact@acd-iut.fr"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              contact@acd-iut.fr
            </a>
            <span class="text-sm text-muted-foreground"> IUT de Troyes </span>
            <span class="text-sm text-muted-foreground">
              9 Rue de Québec, 10000 Troyes
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
