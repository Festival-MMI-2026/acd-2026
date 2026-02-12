<script setup lang="ts">
import { ref, computed } from "vue";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";

definePageMeta({
  layout: "default",
});

// Fetch editable content from DB
const { data: homeContent } = await useFetch("/api/home-content");

type TabKey = string;
const activeTab = ref<TabKey>("partage");

interface TabItem {
  key: string;
  label: string;
  title: string;
  description: string;
  stat: string;
  image: string;
}

const tabs = computed<Record<string, TabItem>>(() => {
  const rawTabs = (homeContent.value?.tabs as unknown as TabItem[]) || [];

  const result: Record<string, TabItem> = {};
  for (const tab of rawTabs) {
    result[tab.key] = tab;
  }
  return result;
});

// Gradient cards visual config
const cardVisualConfig = [
  {
    icon: "lucide:book-open",
    color: "from-purple-500/20 to-blue-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: "lucide:users",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: "lucide:shield-check",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500",
  },
];

const gradientCards = computed(() => {
  const rawCards =
    (homeContent.value?.gradientCards as unknown as Array<{
      title: string;
      description: string;
      features: string[];
    }>) || [];

  return rawCards.map((card, i) => ({
    ...cardVisualConfig[i],
    title: card.title,
    description: card.description,
    features: card.features,
  }));
});

const logos = computed(() => {
  return (
    (homeContent.value?.logos as unknown as Array<{
      src: string;
      alt: string;
    }>) || []
  );
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-32 md:py-48 px-6 overflow-hidden">
      <!-- Rose Window (Rosace) Notre-Dame -->
      <div
        class="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <img
          :src="homeContent?.heroImage"
          alt="Image de fond"
          class="w-full h-full object-cover opacity-[0.1]"
        />
      </div>

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
          {{ homeContent?.heroBadge }}
        </Badge>

        <!-- Main Title -->
        <h1
          class="text-6xl md:text-8xl font-bold tracking-tight text-foreground -mt-4"
        >
          {{ homeContent?.heroTitle }}
        </h1>

        <!-- Subtitle -->
        <p
          class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          {{ homeContent?.heroSubtitle }}
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
              v-for="(logo, index) in logos"
              :key="index"
              class="w-36 flex items-center justify-center p-2 shadow-sm grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img
                :src="logo.src"
                :alt="logo.alt"
                class="w-full h-full object-contain invert dark:invert-0"
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
                {{ tabs[activeTab]?.title }}
              </h2>
              <p
                class="text-lg text-muted-foreground leading-relaxed transition-all duration-300"
              >
                {{ tabs[activeTab]?.description }}
              </p>
            </div>

            <!-- Tabs Navigation -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(tab, key) in tabs"
                :key="key"
                @click="activeTab = key as string"
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
                :src="tabs[activeTab]?.image"
                class="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform scale-100 group-hover:scale-105"
                alt="Tab Image"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"
              ></div>

              <!-- Overlay Content -->
              <div class="absolute bottom-8 left-8 right-8 text-white">
                <div class="text-4xl font-bold mb-2">
                  {{ tabs[activeTab]?.stat?.split(" ")[0] }}
                </div>
                <div class="text-base font-medium opacity-90">
                  {{ tabs[activeTab]?.stat?.split(" ").slice(1).join(" ") }}
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
                <Icon :name="card.icon || 'lucide:star'" class="w-6 h-6" />
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
          {{ homeContent?.contextTitle }}
        </h2>
        <p class="text-lg text-muted-foreground leading-relaxed">
          {{ homeContent?.contextText }}
        </p>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6">
      <div class="container max-w-4xl mx-auto">
        <Card
          class="text-primary-foreground overflow-hidden relative border-0 shadow-2xl"
        >
          <!-- Dark Map Background (Leaflet) -->
          <div
            class="absolute inset-0 opacity-[1] grayscale pointer-events-none"
          >
            <LMap
              style="height: 100%; width: 100%"
              :zoom="16"
              :center="[48.2973, 4.0744]"
              :use-global-leaflet="false"
            >
              <LTileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                layer-type="base"
                name="CartoDB Dark"
              />
            </LMap>
          </div>
          <div class="absolute inset-0 bg-primary/85"></div>
          <CardContent class="p-12 md:p-16 text-center space-y-8 relative z-10">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
              {{ homeContent?.ctaTitle }}
            </h2>
            <p class="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              {{ homeContent?.ctaText }}
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

<style scoped>
:deep(.leaflet-control-container) {
  display: none !important;
}
:deep(.leaflet-control-zoom) {
  display: none !important;
}
:deep(.leaflet-control-attribution) {
  display: none !important;
}
</style>
