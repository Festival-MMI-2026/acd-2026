<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

definePageMeta({
  layout: "default",
});

const { data: pageContent } = await useFetch("/api/hotels-content");
const { data: siteSettings } = await useFetch("/api/settings");
const { data: hotels } = await useFetch("/api/hotels");

const colorMode = useColorMode();

const tileUrl = computed(() =>
  colorMode.value === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Marker icons (same as acces.vue)
const iconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png";
const selectedIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
const shadowUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";
const iconSize: [number, number] = [25, 41];
const iconAnchor: [number, number] = [12, 41];
const popupAnchor: [number, number] = [1, -34];
const shadowSize: [number, number] = [41, 41];

// Map state
const selectedHotel = ref<any>(null);
const mapZoom = ref(13);
const mapCenter = ref<[number, number]>([48.3, 4.08]);

const hotelsWithCoords = computed(() =>
  (hotels.value ?? []).filter((h) => h.latitude && h.longitude),
);

function selectHotel(hotel: any) {
  selectedHotel.value = hotel;
  if (hotel.latitude && hotel.longitude) {
    mapCenter.value = [hotel.latitude, hotel.longitude];
    mapZoom.value = 16;
  }
}

function clearSelection() {
  selectedHotel.value = null;
  mapCenter.value = [48.3, 4.08];
  mapZoom.value = 13;
}
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Page masquée -->
    <Empty v-if="siteSettings && !siteSettings.showHotels" class="py-24">
      <EmptyMedia variant="icon">
        <Icon name="lucide:clock" class="size-5" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Bientôt disponible</EmptyTitle>
        <EmptyDescription>
          Les informations sur les hébergements seront bientôt disponibles.
          Revenez prochainement !
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" class="rounded-full" as-child>
          <NuxtLink to="/">Retour à l'accueil</NuxtLink>
        </Button>
      </EmptyContent>
    </Empty>

    <template v-else>
      <!-- Header -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
          {{ pageContent?.pageTitle }}
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {{ pageContent?.pageSubtitle }}
        </p>
      </div>

      <!-- Empty state -->
      <Empty v-if="!hotels || hotels.length === 0">
        <EmptyMedia variant="icon">
          <Icon name="lucide:building-2" class="size-5" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Aucun hôtel disponible</EmptyTitle>
          <EmptyDescription>
            Les informations sur les hébergements seront bientôt disponibles.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <!-- Split layout: list + map -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Hotels list -->
        <div class="space-y-4 lg:col-span-1 max-h-[600px] overflow-y-auto p-2">
          <Button
            v-if="selectedHotel"
            variant="ghost"
            size="sm"
            class="mb-2"
            @click="clearSelection"
          >
            <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
            Voir tous les hôtels
          </Button>

          <Card
            v-for="hotel in hotels"
            :key="hotel.id"
            :class="[
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              selectedHotel?.id === hotel.id
                ? 'ring-2 ring-primary shadow-md'
                : '',
            ]"
            @click="selectHotel(hotel)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg flex items-center gap-2">
                <Icon name="lucide:building-2" class="h-5 w-5 text-primary" />
                {{ hotel.name }}
              </CardTitle>
              <CardDescription class="flex items-start gap-2">
                <Icon name="lucide:map-pin" class="h-4 w-4 mt-0.5 shrink-0" />
                <span
                  >{{ hotel.address }}, {{ hotel.postalCode }}
                  {{ hotel.city }}</span
                >
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="space-y-2 text-sm">
                <div
                  v-if="hotel.phone"
                  class="flex items-center gap-2 text-muted-foreground"
                >
                  <Icon name="lucide:phone" class="h-4 w-4" />
                  <a
                    :href="`tel:${hotel.phone}`"
                    class="hover:text-foreground"
                    @click.stop
                  >
                    {{ hotel.phone }}
                  </a>
                </div>
                <div
                  v-if="hotel.email"
                  class="flex items-center gap-2 text-muted-foreground"
                >
                  <Icon name="lucide:mail" class="h-4 w-4" />
                  <a
                    :href="`mailto:${hotel.email}`"
                    class="hover:text-foreground truncate"
                    @click.stop
                  >
                    {{ hotel.email }}
                  </a>
                </div>
              </div>
              <div class="flex gap-2 pt-2">
                <Button
                  v-if="hotel.googleMapsUrl"
                  variant="outline"
                  size="sm"
                  class="rounded-full flex-1"
                  as="a"
                  :href="hotel.googleMapsUrl"
                  target="_blank"
                  @click.stop
                >
                  <Icon name="lucide:map" class="h-4 w-4 mr-2" />
                  Itinéraire
                </Button>
                <Button
                  v-if="hotel.websiteUrl"
                  variant="outline"
                  size="sm"
                  class="rounded-full flex-1"
                  as="a"
                  :href="hotel.websiteUrl"
                  target="_blank"
                  @click.stop
                >
                  <Icon name="lucide:globe" class="h-4 w-4 mr-2" />
                  Site web
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Map -->
        <div
          class="lg:col-span-2 h-[400px] lg:h-[600px] rounded-2xl overflow-hidden border shadow-sm relative z-0"
        >
          <ClientOnly>
            <LMap
              v-model:zoom="mapZoom"
              :center="mapCenter"
              :use-global-leaflet="false"
            >
              <LTileLayer
                :url="tileUrl"
                :attribution="attribution"
                layer-type="base"
                name="Basemap"
              />
              <LMarker
                v-for="hotel in hotelsWithCoords"
                :key="hotel.id"
                :lat-lng="[hotel.latitude as number, hotel.longitude as number]"
              >
                <LIcon
                  :icon-url="
                    selectedHotel?.id === hotel.id ? selectedIconUrl : iconUrl
                  "
                  :shadow-url="shadowUrl"
                  :icon-size="iconSize"
                  :icon-anchor="iconAnchor"
                  :popup-anchor="popupAnchor"
                  :shadow-size="shadowSize"
                />
                <LPopup>
                  <div class="min-w-[180px]">
                    <p class="font-semibold text-sm">{{ hotel.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ hotel.address }}, {{ hotel.postalCode }}
                      {{ hotel.city }}
                    </p>
                    <p v-if="hotel.phone" class="text-xs text-muted-foreground">
                      {{ hotel.phone }}
                    </p>
                    <div class="flex gap-2 pt-1">
                      <a
                        v-if="hotel.googleMapsUrl"
                        :href="hotel.googleMapsUrl"
                        target="_blank"
                        class="text-xs text-primary hover:underline font-medium"
                        >Itinéraire</a
                      >
                      <a
                        v-if="hotel.websiteUrl"
                        :href="hotel.websiteUrl"
                        target="_blank"
                        class="text-xs text-primary hover:underline font-medium"
                        >Site web</a
                      >
                    </div>
                  </div>
                </LPopup>
              </LMarker>
            </LMap>
            <template #fallback>
              <div class="h-full flex items-center justify-center bg-muted/40">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin" />
                  <span>Chargement de la carte...</span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </template>
  </div>
</template>

