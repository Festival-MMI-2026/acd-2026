<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

definePageMeta({
  layout: "default",
});

// Fetch editable content from DB
const { data: accessContent } = await useFetch("/api/access-content");
const { data: siteSettings } = await useFetch("/api/settings");

const colorMode = useColorMode();
const zoom = ref(15);
const center = computed<[number, number]>(() => [
  accessContent.value?.mapLatitude ?? 48.2682678,
  accessContent.value?.mapLongitude ?? 4.079772,
]);
const iutPosition = computed<[number, number]>(() => [
  accessContent.value?.mapLatitude ?? 48.2682678,
  accessContent.value?.mapLongitude ?? 4.079772,
]);

// Computed tile URL based on color mode
const tileUrl = computed(() => {
  return colorMode.value === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
});

const attribution = computed(() => {
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
});

// Custom Icon
const customIconUrl = ref(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
);
const customShadowUrl = ref(
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
);
const iconSize: [number, number] = [25, 41];
const iconAnchor: [number, number] = [12, 41];
const popupAnchor: [number, number] = [1, -34];
const shadowSize: [number, number] = [41, 41];
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Hidden page state -->
    <div
      v-if="siteSettings && !siteSettings.showAcces"
      class="text-center py-24 space-y-6"
    >
      <div
        class="bg-muted/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto"
      >
        <Icon
          name="lucide:clock"
          class="h-10 w-10 text-muted-foreground"
        />
      </div>
      <h2 class="text-2xl font-bold tracking-tight">Bientôt disponible</h2>
      <p class="text-muted-foreground max-w-md mx-auto">
        Les informations d'accès seront bientôt disponibles. Revenez prochainement !
      </p>
      <Button variant="outline" class="rounded-full" as-child>
        <NuxtLink to="/">Retour à l'accueil</NuxtLink>
      </Button>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
        {{ accessContent?.pageTitle }}
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        {{ accessContent?.pageSubtitle }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Info Cards -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Location Card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:map-pin" class="h-5 w-5 text-primary" />
              {{ accessContent?.locationTitle }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p class="font-medium text-foreground text-base">
              {{ accessContent?.locationName }}
            </p>
            <p>{{ accessContent?.locationAddress1 }}</p>
            <p>{{ accessContent?.locationAddress2 }}</p>
            <div class="pt-4">
              <Button variant="outline" class="w-full" as-child>
                <a
                  :href="accessContent?.locationMapUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Itinéraire Google Maps
                  <Icon name="lucide:external-link" class="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Transport Cards -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:train" class="h-5 w-5 text-primary" />
              {{ accessContent?.trainTitle }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 text-sm text-muted-foreground">
            <div>
              <p class="font-medium text-foreground">
                {{ accessContent?.trainStation }}
              </p>
              <p>{{ accessContent?.trainDuration }}</p>
            </div>
            <Separator />
            <div>
              <p class="font-medium text-foreground">
                {{ accessContent?.trainAccessTitle }}
              </p>
              <p>{{ accessContent?.trainAccessLine }}</p>
              <p class="mt-1">{{ accessContent?.trainAccessTime }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:car" class="h-5 w-5 text-primary" />
              {{ accessContent?.carTitle }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p>{{ accessContent?.carParking }}</p>
            <p>{{ accessContent?.carAccess }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Map -->
      <div
        class="lg:col-span-2 h-[500px] lg:h-auto min-h-[500px] rounded-2xl overflow-hidden border shadow-sm relative z-0"
      >
        <ClientOnly>
          <LMap
            ref="map"
            v-model:zoom="zoom"
            :center="center"
            :use-global-leaflet="false"
          >
            <LTileLayer
              :url="tileUrl"
              :attribution="attribution"
              layer-type="base"
              name="Basemap"
            />

            <LMarker :lat-lng="iutPosition">
              <LIcon
                :icon-url="customIconUrl"
                :shadow-url="customShadowUrl"
                :icon-size="iconSize"
                :icon-anchor="iconAnchor"
                :popup-anchor="popupAnchor"
                :shadow-size="shadowSize"
              />
              <LTooltip
                :options="{
                  permanent: true,
                  direction: 'top',
                  offset: [0, -40],
                }"
              >
                <div class="text-center">
                  <strong class="text-sm font-bold">{{
                    accessContent?.mapTooltipTitle
                  }}</strong
                  ><br />
                  <span class="text-xs">{{
                    accessContent?.mapTooltipSubtitle
                  }}</span>
                </div>
              </LTooltip>
            </LMarker>
          </LMap>
        </ClientOnly>
      </div>
    </div>
    </template>
  </div>
</template>

<style>
/* Ensure map container has height */
.leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 0;
  font-family: inherit;
}

/* Dark mode overrides for Leaflet controls */
.dark .leaflet-control-zoom a,
.dark .leaflet-control-attribution {
  background-color: hsl(var(--card)) !important;
  color: hsl(var(--foreground)) !important;
  border-color: hsl(var(--border)) !important;
}
.dark .leaflet-control-zoom a:hover {
  background-color: hsl(var(--muted)) !important;
}
.dark .leaflet-bar a {
  border-bottom: 1px solid hsl(var(--border)) !important;
}
</style>
