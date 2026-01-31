<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const features = [
  {
    icon: "lucide:calendar-days",
    title: "Programme",
    description: "Découvrez les conférences et ateliers prévus",
  },
  {
    icon: "lucide:utensils",
    title: "Restauration",
    description: "Réservez vos repas pour chaque journée",
  },
  {
    icon: "lucide:users",
    title: "Activités",
    description: "Participez aux événements sociaux et networking",
  },
  {
    icon: "lucide:map-pin",
    title: "Accès",
    description: "Informations pratiques et plans d'accès",
  },
];
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <!-- Hero Section -->
    <section class="py-24 md:py-32 px-4">
      <div class="container max-w-4xl mx-auto text-center space-y-8">
        <!-- Badge -->
        <div
          class="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Icon name="lucide:sparkles" class="h-4 w-4 mr-2" />
          <span>Édition 2026</span>
        </div>

        <!-- Main Title -->
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight">
          Assemblée des Chefs
          <br />
          <span class="text-muted-foreground">de Département</span>
        </h1>

        <!-- Subtitle -->
        <p
          class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Retrouvez-nous pour les journées nationales des IUT de France.
          Conférences, ateliers et moments de partage.
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button size="lg" class="rounded-full px-8 text-base" as-child>
            <NuxtLink to="/inscription">
              S'inscrire
              <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
            </NuxtLink>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            class="rounded-full px-8 text-base"
            as-child
          >
            <NuxtLink to="/programme"> Voir le programme </NuxtLink>
          </Button>
        </div>

        <!-- Event Info -->
        <div
          class="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:calendar" class="h-4 w-4" />
            <span>15-17 Juin 2026</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:map-pin" class="h-4 w-4" />
            <span>IUT de Troyes</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:users" class="h-4 w-4" />
            <span>50+ participants</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4 border-t">
      <div class="container max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            Tout ce qu'il faut savoir
          </h2>
          <p class="text-lg text-muted-foreground">
            Gérez votre participation en quelques clics
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            v-for="feature in features"
            :key="feature.title"
            class="rounded-2xl border-border/50 hover:border-border transition-colors"
          >
            <CardHeader>
              <div
                class="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4"
              >
                <Icon :name="feature.icon" class="h-6 w-6" />
              </div>
              <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
              <CardDescription class="text-base">{{
                feature.description
              }}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4">
      <div class="container max-w-3xl mx-auto">
        <Card
          class="rounded-3xl border-0 bg-foreground text-background overflow-hidden"
        >
          <CardContent class="p-12 text-center space-y-6">
            <h2 class="text-3xl md:text-4xl font-bold">Prêt à participer ?</h2>
            <p class="text-lg opacity-80 max-w-lg mx-auto">
              Inscrivez-vous dès maintenant pour réserver votre place, vos repas
              et vos activités.
            </p>
            <Button
              variant="secondary"
              size="lg"
              class="rounded-full px-8 text-base"
              as-child
            >
              <NuxtLink to="/inscription">
                Commencer l'inscription
                <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
              </NuxtLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
