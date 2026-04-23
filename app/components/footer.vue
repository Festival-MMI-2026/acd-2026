<script setup lang="ts">
const { data: settings } = await useFetch("/api/settings");
</script>

<template>
  <footer class="relative border-t bg-muted backdrop-blur-xl">
    <div class="container max-w-screen-xl mx-auto px-6 pt-16 pb-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
        <div class="lg:col-span-4 space-y-4">
          <NuxtLink
            to="/"
            class="inline-block transition-opacity hover:opacity-80"
          >
            <NuxtImg
              src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
              alt="ACD Logo"
              class="h-20 dark:hidden"
              loading="lazy"
              height="80"
            />
            <NuxtImg
              src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
              alt="ACD Logo"
              class="h-20 hidden dark:block dark:grayscale dark:invert dark:contrast-200"
              loading="lazy"
              height="80"
            />
          </NuxtLink>

          <p class="text-base text-muted-foreground leading-relaxed max-w-sm">
            L'Assemblée des Chefs de Département MMI. Un événement annuel pour
            façonner l'avenir de la formation et échanger sur nos pratiques.
          </p>

          <div class="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              class="rounded-full h-10 w-10 transition-transform hover:-translate-y-1"
              as-child
            >
              <a
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
              >
                <Icon name="lucide:linkedin" class="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="rounded-full h-10 w-10 transition-transform hover:-translate-y-1"
              as-child
            >
              <a
                href="https://twitter.com"
                target="_blank"
                aria-label="Twitter"
              >
                <Icon name="lucide:twitter" class="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="rounded-full h-10 w-10 transition-transform hover:-translate-y-1"
              as-child
            >
              <a href="mailto:contact@acd-iut.fr" aria-label="Email">
                <Icon name="lucide:mail" class="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <!-- Links Grid -->
        <div
          class="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12"
        >
          <div class="space-y-6">
            <h3 class="text-sm font-semibold text-foreground tracking-tight">
              Navigation
            </h3>
            <nav class="flex flex-col space-y-4">
              <NuxtLink
                to="/programme"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
              >
                Programme
                <Icon
                  name="lucide:chevron-right"
                  class="ml-1 h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </NuxtLink>
              <NuxtLink
                to="/inscription"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
              >
                Inscription
                <Icon
                  name="lucide:chevron-right"
                  class="ml-1 h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </NuxtLink>
              <NuxtLink
                to="/acces"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
              >
                Accès
                <Icon
                  name="lucide:chevron-right"
                  class="ml-1 h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </NuxtLink>
            </nav>
          </div>

          <div class="space-y-6">
            <h3 class="text-sm font-semibold text-foreground tracking-tight">
              Utile
            </h3>
            <nav class="flex flex-col space-y-4">
              <NuxtLink
                to="/hotels"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
              >
                Hébergement
                <Icon
                  name="lucide:chevron-right"
                  class="ml-1 h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </NuxtLink>
              <NuxtLink
                to="/profil"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
              >
                Mon Profil
                <Icon
                  name="lucide:chevron-right"
                  class="ml-1 h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </NuxtLink>
            </nav>
          </div>

          <div class="col-span-2 md:col-span-1 space-y-6">
            <h3 class="text-sm font-semibold text-foreground tracking-tight">
              Localisation
            </h3>
            <div class="space-y-4">
              <div
                class="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
              >
                <Icon
                  name="lucide:map-pin"
                  class="h-4 w-4 mt-0.5 shrink-0 text-primary"
                />
                <span
                  >{{ settings?.location || "IUT de Troyes" }}<br />{{
                    settings?.locationAddress || "9 Rue de Québec, 10000 Troyes"
                  }}</span
                >
              </div>
              <div class="pt-2">
                <ToggleTheme />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-xs text-muted-foreground">
          © {{ new Date().getFullYear() }}
          {{ settings?.siteName || "ACD MMI" }}. Conçu avec soin pour la
          communauté.
        </p>

        <div class="flex items-center gap-2">
          <Button variant="link" size="sm" as-child>
            <NuxtLink
              to="/mentions-legales"
              class="text-xs text-muted-foreground hover:text-primary"
            >
              Mentions Légales
            </NuxtLink>
          </Button>
          <Button variant="link" size="sm" as-child>
            <NuxtLink
              to="/confidentialite"
              class="text-xs text-muted-foreground hover:text-primary"
            >
              Confidentialité
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </footer>
</template>
