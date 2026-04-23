<script setup lang="ts">
import { ref, computed } from "vue";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { motion } from "motion-v";

definePageMeta({
  layout: "default",
});

// Fetch editable content from DB
const { data: homeContent } = await useFetch("/api/home-content");
const { data: settings } = await useFetch("/api/settings");

useSeoMeta({
  title: () => settings.value?.siteName || "ACD MMI 2026",
  description:
    "Assises Commerciales et Digitales des BUT MMI 2026 — participez à l'événement étudiant rassemblant les IUT de France.",
  ogTitle: () => settings.value?.siteName || "ACD MMI 2026",
  ogDescription:
    "Assises Commerciales et Digitales des BUT MMI 2026 — participez à l'événement étudiant rassemblant les IUT de France.",
  ogType: "website",
  twitterCard: "summary_large_image",
});

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

// Animation variants
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeDown = {
  initial: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft = {
  initial: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  initial: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const viewportOnce = { once: true, amount: 0.3 };
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-20 px-6 overflow-hidden">
      <!-- Rose Window (Rosace) Notre-Dame -->
      <div
        class="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <NuxtImg
          v-if="homeContent?.heroImage"
          :src="homeContent.heroImage"
          alt=""
          class="w-full h-full object-cover opacity-[0.1]"
          loading="eager"
          preload
        />
      </div>

      <div
        class="container max-w-5xl mx-auto flex flex-col items-center text-center space-y-10"
      >
        <!-- Badge -->
        <motion.div
          :initial="fadeDown.initial"
          :whileInView="fadeDown.visible"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, ease: 'easeOut' }"
        >
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
        </motion.div>

        <!-- Main Title -->
        <motion.h1
          :initial="fadeUp.initial"
          :whileInView="fadeUp.visible"
          :viewport="{ once: true }"
          :transition="{ duration: 0.6, delay: 0.15, ease: 'easeOut' }"
          class="text-6xl md:text-8xl font-bold tracking-tight text-foreground -mt-4"
        >
          {{ homeContent?.heroTitle }}
        </motion.h1>

        <!-- Subtitle -->
        <motion.p
          :initial="fadeUp.initial"
          :whileInView="fadeUp.visible"
          :viewport="{ once: true }"
          :transition="{ duration: 0.6, delay: 0.3, ease: 'easeOut' }"
          class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          {{ homeContent?.heroSubtitle }}
        </motion.p>

        <!-- CTA Buttons -->
        <motion.div
          :initial="fadeUp.initial"
          :whileInView="fadeUp.visible"
          :viewport="{ once: true }"
          :transition="{ duration: 0.6, delay: 0.45, ease: 'easeOut' }"
          class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <template v-if="settings?.showInscription">
            <Button size="lg" class="h-12 px-8 rounded-full text-base" as-child>
              <NuxtLink to="/inscription">
                S'inscrire maintenant
                <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
              </NuxtLink>
            </Button>
          </template>
          <template v-else>
            <Button
              size="lg"
              class="h-12 px-8 rounded-full text-base opacity-80 cursor-not-allowed hover:bg-primary"
              tabindex="-1"
            >
              S'inscrire maintenant
              <Badge variant="secondary">Bientôt</Badge>
            </Button>
          </template>
          <Button
            variant="outline"
            size="lg"
            class="h-12 px-8 rounded-full text-base bg-background/80 backdrop-blur-sm border-border/50"
            as-child
          >
            <NuxtLink to="/programme">Découvrir le programme</NuxtLink>
          </Button>
        </motion.div>

        <!-- Partner Logos (Bottom) -->
        <motion.div
          :initial="{ opacity: 0 }"
          :whileInView="{ opacity: 1 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.8, delay: 0.6, ease: 'easeOut' }"
          class="pt-16 flex flex-col items-center gap-6"
        >
          <span
            class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
            >Organisé par</span
          >
          <div class="flex items-center justify-center gap-4">
            <motion.div
              v-for="(logo, index) in logos"
              :key="index"
              :initial="{ opacity: 0, y: 10 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{
                duration: 0.4,
                delay: 0.7 + index * 0.1,
                ease: 'easeOut',
              }"
              class="w-36 flex items-center justify-center p-2 shadow-sm grayscale hover:grayscale-0 transition-all duration-300"
            >
              <NuxtImg
                :src="logo.src"
                :alt="logo.alt"
                class="w-full h-full object-contain invert dark:invert-0"
                loading="lazy"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>

    <!-- Dynamic Tabs Section (Interactive) -->
    <section class="py-24 px-6 bg-muted/20">
      <div class="container max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Left: Text + Tabs -->
          <motion.div
            :initial="fadeLeft.initial"
            :whileInView="fadeLeft.visible"
            :viewport="viewportOnce"
            :transition="{ duration: 0.7, ease: 'easeOut' }"
            class="space-y-8"
          >
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
          </motion.div>

          <!-- Right: Dynamic Image Card -->
          <motion.div
            :initial="fadeRight.initial"
            :whileInView="fadeRight.visible"
            :viewport="viewportOnce"
            :transition="{ duration: 0.7, delay: 0.2, ease: 'easeOut' }"
            class="relative group"
          >
            <Card
              class="relative overflow-hidden rounded-4xl border-0 shadow-2xl aspect-4/3 lg:aspect-square"
            >
              <NuxtImg
                v-if="tabs[activeTab]?.image"
                :src="tabs[activeTab]!.image"
                :alt="tabs[activeTab]?.title || ''"
                class="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform scale-100 group-hover:scale-105"
                loading="lazy"
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
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Gradient Cards Section (Reference Style) -->
    <section class="py-24 px-6">
      <div class="container max-w-6xl mx-auto">
        <motion.div
          :initial="fadeUp.initial"
          :whileInView="fadeUp.visible"
          :viewport="viewportOnce"
          :transition="{ duration: 0.6, ease: 'easeOut' }"
          class="text-center mb-16 space-y-4"
        >
          <h2 class="text-3xl font-bold tracking-tight">Les temps forts MMI</h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois axes majeurs pour cette édition 2026.
          </p>
        </motion.div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            v-for="(card, index) in gradientCards"
            :key="card.title"
            :initial="fadeUp.initial"
            :whileInView="fadeUp.visible"
            :viewport="viewportOnce"
            :transition="{
              duration: 0.5,
              delay: index * 0.15,
              ease: 'easeOut',
            }"
          >
            <Card
              class="h-full rounded-3xl shadow-sm hover:border-border transition-all duration-300"
            >
              <CardHeader>
                <div
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-background/80 border border-border shadow-sm',
                    card.iconColor,
                  ]"
                >
                  <Icon :name="card.icon || 'lucide:star'" class="w-6 h-6" />
                </div>
                <CardTitle class="text-xl font-bold">{{
                  card.title
                }}</CardTitle>
                <CardDescription class="text-base">{{
                  card.description
                }}</CardDescription>
              </CardHeader>

              <CardContent>
                <div class="space-y-3">
                  <div
                    v-for="feature in card.features"
                    :key="feature"
                    class="flex items-center gap-3 text-sm text-foreground/80"
                  >
                    <Icon name="lucide:check" class="w-4 h-4 text-primary" />
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Context Section -->
    <section class="py-16 px-6 bg-muted border-y border-border/50">
      <motion.div
        :initial="fadeUp.initial"
        :whileInView="fadeUp.visible"
        :viewport="viewportOnce"
        :transition="{ duration: 0.6, ease: 'easeOut' }"
        class="container max-w-4xl mx-auto text-center space-y-6"
      >
        <h2 class="text-2xl font-semibold">
          {{ homeContent?.contextTitle }}
        </h2>
        <p class="text-lg text-muted-foreground leading-relaxed">
          {{ homeContent?.contextText }}
        </p>
      </motion.div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6">
      <div class="container max-w-4xl mx-auto">
        <motion.div
          :initial="fadeScale.initial"
          :whileInView="fadeScale.visible"
          :viewport="viewportOnce"
          :transition="{ duration: 0.7, ease: 'easeOut' }"
        >
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
            <div class="absolute inset-0 bg-primary/75"></div>
            <CardContent
              class="p-12 md:p-16 text-center space-y-8 relative z-10"
            >
              <motion.h2
                :initial="fadeUp.initial"
                :whileInView="fadeUp.visible"
                :viewport="viewportOnce"
                :transition="{ duration: 0.6, delay: 0.2, ease: 'easeOut' }"
                class="text-3xl md:text-5xl font-bold tracking-tight"
              >
                {{ homeContent?.ctaTitle }}
              </motion.h2>
              <motion.p
                :initial="fadeUp.initial"
                :whileInView="fadeUp.visible"
                :viewport="viewportOnce"
                :transition="{ duration: 0.6, delay: 0.35, ease: 'easeOut' }"
                class="text-primary-foreground/80 text-lg max-w-xl mx-auto"
              >
                {{ homeContent?.ctaText }}
              </motion.p>
              <motion.div
                :initial="fadeUp.initial"
                :whileInView="fadeUp.visible"
                :viewport="viewportOnce"
                :transition="{ duration: 0.6, delay: 0.5, ease: 'easeOut' }"
                class="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <template v-if="settings?.showInscription">
                  <Button variant="secondary" size="lg" as-child>
                    <NuxtLink to="/inscription">
                      Confirmer ma présence
                      <Icon name="lucide:arrow-right" class="ml-2 h-5 w-5" />
                    </NuxtLink>
                  </Button>
                </template>
                <template v-else>
                  <Button
                    variant="secondary"
                    size="lg"
                    class="opacity-90 cursor-not-allowed hover:bg-secondary"
                  >
                    Confirmer ma présence
                    <Badge
                      variant="outline"
                      class="border-secondary-foreground text-secondary-foreground ml-3 rounded-full uppercase tracking-wider text-[10px] font-bold"
                      >Bientôt</Badge
                    >
                  </Button>
                </template>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
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
