<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

definePageMeta({
  layout: "default",
});

const colorMode = useColorMode();
const zoom = ref(15);
const center = ref([48.269096, 4.066911]); // Coordinates for IUT de Troyes (approx)
const iutPosition = ref([48.269096, 4.066911]);

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
// Using a slightly larger and cleaner marker if possible, or sticking to default but ensuring it loads cleanly.
// We can use a custom DivIcon or just the standard one. The user asked to "modify the point".
// Let's use a custom icon URL to a simple pin that looks cleaner.
// For now, let's stick to valid clear defaults or a known good SVG URL.
// Actually, let's use a local SVG or a CDN for a "Map Pin" style icon.
const customIconUrl = ref(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
);
const customShadowUrl = ref(
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
);
const iconSize = [25, 41];
const iconAnchor = [12, 41];
const popupAnchor = [1, -34];
const shadowSize = [41, 41];
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
        Accès & Transports
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Toutes les informations pour vous rendre à l'Assemblée des Chefs de
        Départements à Troyes.
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
              Le lieu
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p class="font-medium text-foreground text-base">IUT de Troyes</p>
            <p>9 Rue de Québec</p>
            <p>10000 Troyes</p>
            <div class="pt-4">
              <Button variant="outline" class="w-full" as-child>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=IUT+de+Troyes"
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
              Venir en train
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 text-sm text-muted-foreground">
            <div>
              <p class="font-medium text-foreground">Gare de Troyes</p>
              <p>À 1h30 de Paris-Est (TER Grand Est)</p>
            </div>
            <Separator />
            <div>
              <p class="font-medium text-foreground">Accès depuis la gare</p>
              <p>Bus Ligne 6 (Direction Chartreux), Arrêt "IUT".</p>
              <p class="mt-1">Environ 15 minutes de trajet.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:car" class="h-5 w-5 text-primary" />
              Venir en voiture
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p>
              Parking gratuit disponible pour les visiteurs à l'entrée de l'IUT.
            </p>
            <p>Accès facile depuis l'A5 et l'A26.</p>
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
                  <span class="font-bold">IUT de Troyes</span>
                </div>
              </LTooltip>
              <LPopup>
                <div class="text-center">
                  <strong class="text-sm font-bold">IUT de Troyes</strong><br />
                  <span class="text-xs">Lieu de l'ACD MMI 2026</span>
                </div>
              </LPopup>
            </LMarker>
          </LMap>
        </ClientOnly>
      </div>
    </div>
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
