<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  layout: "default",
});

// Gradient Cards Data
const gradientCards = [
  {
    icon: "lucide:book-open",
    title: "Nouveaux Programmes",
    description: "Adaptation au BUT",
    color: "from-purple-500/20 to-blue-500/20",
    iconColor: "text-purple-500",
    features: ["Référentiel 2027", "Compétences clés", "Adaptation parcours"],
  },
  {
    icon: "lucide:users",
    title: "Travail Collaboratif",
    description: "Co-construction",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    features: ["Ateliers par thèmes", "Partage de ressources", "Harmonisation"],
  },
  {
    icon: "lucide:shield-check",
    title: "Enjeux & Avenir",
    description: "Stratégie MMI",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500",
    features: ["Évolution métiers", "Partenariats pros", "Conférences"],
  },
];

// Dynamic Tabs Data
type TabKey = "partage" | "travail" | "decouverte";
const activeTab = ref<TabKey>("partage");

const tabs = {
  partage: {
    label: "Partage",
    title: "Échanger pour mieux construire.",
    description:
      "L'ACD est avant tout un moment de rencontre. Profitez de ces instants pour échanger sur vos pratiques pédagogiques et vos retours d'expérience.",
    image: "/gala-dinner.png",
    stat: "50+ Chefs de départements",
  },
  travail: {
    label: "Travail",
    title: "Collaborer sur le futur.",
    description:
      "Des ateliers dédiés à la rédaction des nouveaux référentiels. Une occasion unique d'impacter directement la formation de demain.",
    image: "/conference-hall.png",
    stat: "34 Départements MMI",
  },
  decouverte: {
    label: "Découverte",
    title: "Vivre l'expérience Troyes.",
    description:
      "Au-delà du travail, découvrez la richesse culturelle de Troyes et sa gastronomie locale lors de nos événements conviviaux.",
    image:
      "https://static-otelico.com/cache/troyes_troyes/hotel-de-troyes-a-troyes.jpg",
    stat: "Patrimoine & Gastronomie",
  },
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-32 md:py-48 px-6 overflow-hidden">
      <!-- Grid Background -->
      <div
        class="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_70%,transparent_100%)]"
      ></div>

      <div
        class="container max-w-5xl mx-auto flex flex-col items-center text-center space-y-10"
      >
        <!-- Badge -->
        <Badge
          variant="outline"
          class="rounded-full py-1.5 px-4 bg-background/50 backdrop-blur-sm border-border/50"
        >
          <span class="relative flex h-2 w-2 mr-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-primary"
            ></span>
          </span>
          15–17 Juin 2026 · IUT de Troyes
        </Badge>

        <!-- Main Title -->
        <h1
          class="text-6xl md:text-8xl font-bold tracking-tight text-foreground -mt-4"
        >
          Assemblée des Chefs de Départements MMI
        </h1>

        <!-- Subtitle -->
        <p
          class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          L'IUT de Troyes accueille l'ACD MMI 2026. Un événement réunissant plus
          de 50 chefs de départements.
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button size="lg" class="h-12 px-8 rounded-full text-base" as-child>
            <NuxtLink to="/inscription">
              S'inscrire maintenant
              <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
            </NuxtLink>
          </Button>
          <Button
            variant="outline"
            size="lg"
            class="h-12 px-8 rounded-full text-base bg-background/80 backdrop-blur-sm border-border/50"
            as-child
          >
            <NuxtLink to="/programme">Découvrir le programme</NuxtLink>
          </Button>
        </div>

        <!-- Partner Logos (Bottom) -->
        <div class="pt-16 flex flex-col items-center gap-6">
          <span
            class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >Organisé par</span
          >
          <div class="flex items-center justify-center gap-4">
            <div
              class="w-36 flex items-center justify-center p-2 shadow-sm grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img
                src="https://www.univ-reims.fr/iut-troyes/media-images/49449/logo-iutt.png"
                alt="IUT de Troyes"
                class="w-full h-full object-contain invert dark:invert-0"
              />
            </div>
            <div
              class="w-36 flex items-center justify-center p-2 shadow-sm grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img
                src="https://www.univ-reims.fr/ufrsesg/media-images/61471/logo_urca_blanc-removebg-preview.png"
                alt="URCA"
                class="w-full object-contain invert dark:invert-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Dynamic Tabs Section (Interactive) -->
    <section class="py-24 px-6 bg-muted/20">
      <div class="container max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div class="space-y-2">
              <h2
                class="text-3xl md:text-5xl font-bold tracking-tight text-foreground transition-all duration-300"
              >
                {{ tabs[activeTab].title }}
              </h2>
              <p
                class="text-lg text-muted-foreground leading-relaxed transition-all duration-300"
              >
                {{ tabs[activeTab].description }}
              </p>
            </div>

            <!-- Tabs Navigation -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(tab, key) in tabs"
                :key="key"
                @click="activeTab = key"
                :class="[
                  'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  activeTab === key
                    ? 'bg-foreground text-background shadow-lg scale-105'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Dynamic Image Card -->
          <div class="relative group">
            <Card
              class="relative overflow-hidden rounded-4xl border-0 shadow-2xl aspect-4/3 lg:aspect-square"
            >
              <img
                :src="tabs[activeTab].image"
                class="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform scale-100 group-hover:scale-105"
                alt="Tab Image"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"
              ></div>

              <!-- Overlay Content -->
              <div class="absolute bottom-8 left-8 right-8 text-white">
                <div class="text-4xl font-bold mb-2">
                  {{ tabs[activeTab].stat.split(" ")[0] }}
                </div>
                <div class="text-base font-medium opacity-90">
                  {{ tabs[activeTab].stat.split(" ").slice(1).join(" ") }}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Gradient Cards Section (Reference Style) -->
    <section class="py-24 px-6">
      <div class="container max-w-6xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl font-bold tracking-tight">Les temps forts MMI</h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois axes majeurs pour cette édition 2026.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="card in gradientCards"
            :key="card.title"
            class="relative group rounded-3xl overflow-hidden bg-background border border-border/50 hover:border-border transition-all duration-300 p-1"
          >
            <div
              class="relative h-full bg-card/50 backdrop-blur-sm rounded-[1.3rem] p-8 flex flex-col"
            >
              <div
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-background/80 shadow-sm',
                  card.iconColor,
                ]"
              >
                <Icon :name="card.icon" class="w-6 h-6" />
              </div>

              <h3 class="text-xl font-bold mb-2">{{ card.title }}</h3>
              <p class="text-muted-foreground mb-8">{{ card.description }}</p>

              <div class="mt-auto space-y-3">
                <div
                  v-for="feature in card.features"
                  :key="feature"
                  class="flex items-center gap-3 text-sm text-foreground/80"
                >
                  <Icon name="lucide:check" class="w-4 h-4 text-primary" />
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Context Section -->
    <section class="py-16 px-6 bg-muted/30 border-y border-border/50">
      <div class="container max-w-4xl mx-auto text-center space-y-6">
        <h2 class="text-2xl font-semibold">
          Une édition tournée vers l'avenir
        </h2>
        <p class="text-lg text-muted-foreground leading-relaxed">
          Les échanges porteront sur les
          <span class="text-foreground font-medium"
            >nouveaux programmes nationaux du BUT MMI</span
          >, qui entreront en vigueur en 2027. L’objectif est de poursuivre la
          rédaction du référentiel de formation afin d’adapter les programmes
          aux besoins et aux évolutions des métiers du numérique.
        </p>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6">
      <div class="container max-w-4xl mx-auto">
        <Card
          class="bg-primary text-primary-foreground overflow-hidden relative border-0 shadow-2xl"
        >
          <div
            class="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"
          ></div>
          <div
            class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          ></div>

          <CardContent class="p-12 md:p-16 text-center space-y-8 relative z-10">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
              Rejoignez l'Assemblée
            </h2>
            <p class="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Participez à la construction de l'avenir du BUT MMI. Inscription
              obligatoire pour tous les chefs de départements.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" as-child>
                <NuxtLink to="/inscription">
                  Confirmer ma présence
                  <Icon name="lucide:arrow-right" class="ml-2 h-5 w-5" />
                </NuxtLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
