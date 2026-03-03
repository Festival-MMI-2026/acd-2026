<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import HotelFormDialog from "@/components/hotels/HotelFormDialog.vue";
import HotelDeleteDialog from "@/components/hotels/HotelDeleteDialog.vue";
import HotelImportDialog from "@/components/hotels/HotelImportDialog.vue";

definePageMeta({
  layout: "admin",
});

// Fetch hotels
const { data: hotels, refresh } = await useFetch("/api/hotels");

// Search
const searchQuery = ref("");
const filteredHotels = computed(() => {
  if (!hotels.value) return [];
  if (!searchQuery.value) return hotels.value;
  const query = searchQuery.value.toLowerCase();
  return hotels.value.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(query) ||
      hotel.city.toLowerCase().includes(query),
  );
});

// Hotels with coordinates for the map
const hotelsWithCoords = computed(() =>
  (hotels.value ?? []).filter((h) => h.latitude != null && h.longitude != null),
);

// Map state
const colorMode = useColorMode();
const mapZoom = ref(13);
const selectedHotel = ref<any>(null);
const mapCenter = ref<[number, number]>([48.2973, 4.0744]);

const tileUrl = computed(() =>
  colorMode.value === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Marker icons (same as acces.vue)
const defaultIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png";
const selectedIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";
const shadowUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";
const iconSize: [number, number] = [25, 41];
const iconAnchor: [number, number] = [12, 41];
const popupAnchor: [number, number] = [1, -34];
const shadowSize: [number, number] = [41, 41];

function selectHotel(hotel: any) {
  selectedHotel.value = hotel;
  if (hotel.latitude != null && hotel.longitude != null) {
    mapCenter.value = [hotel.latitude, hotel.longitude];
    mapZoom.value = 16;
  }
}

function clearSelection() {
  selectedHotel.value = null;
  if (hotelsWithCoords.value.length > 0) {
    const avgLat =
      hotelsWithCoords.value.reduce((s, h) => s + h.latitude!, 0) /
      hotelsWithCoords.value.length;
    const avgLng =
      hotelsWithCoords.value.reduce((s, h) => s + h.longitude!, 0) /
      hotelsWithCoords.value.length;
    mapCenter.value = [avgLat, avgLng];
  } else {
    mapCenter.value = [48.2973, 4.0744];
  }
  mapZoom.value = 13;
}

// Dialogs state
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showImportDialog = ref(false);
const dialogHotel = ref<any>(null);

function openCreateDialog() {
  dialogHotel.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(hotel: any) {
  dialogHotel.value = hotel;
  showEditDialog.value = true;
}

function openDeleteDialog(hotel: any) {
  dialogHotel.value = hotel;
  showDeleteDialog.value = true;
}

function handleSuccess() {
  refresh();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Hôtels</h1>
        <p class="text-muted-foreground">
          Gestion des hôtels partenaires et hébergements
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          class="rounded-full"
          @click="showImportDialog = true"
        >
          <Icon name="lucide:upload" class="h-4 w-4" />
          Importer CSV
        </Button>
        <Button class="rounded-full" @click="openCreateDialog">
          <Icon name="lucide:plus" class="h-4 w-4" />
          Ajouter un hôtel
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher un hôtel..."
          class="pl-9 rounded-full bg-card"
        />
      </div>
      <span class="text-sm text-muted-foreground">
        {{ filteredHotels.length }} hôtel{{
          filteredHotels.length !== 1 ? "s" : ""
        }}
      </span>
    </div>

    <!-- Main layout: list + map -->
    <div
      v-if="filteredHotels.length > 0"
      class="grid grid-cols-1 lg:grid-cols-5 gap-6"
    >
      <!-- Hotel list -->
      <div class="lg:col-span-2 space-y-3 max-h-[620px] overflow-y-auto p-2">
        <Button
          v-if="selectedHotel"
          variant="ghost"
          size="sm"
          class="w-full justify-start text-muted-foreground"
          @click="clearSelection"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
          Voir tous les hôtels
        </Button>

        <Card
          v-for="hotel in filteredHotels"
          :key="hotel.id"
          :class="[
            'cursor-pointer transition-all duration-200 hover:shadow-md rounded-xl',
            selectedHotel?.id === hotel.id
              ? 'ring-2 ring-primary shadow-md'
              : '',
          ]"
          @click="selectHotel(hotel)"
        >
          <CardHeader class="pb-2 pt-4 px-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <CardTitle class="text-base line-clamp-1">{{
                  hotel.name
                }}</CardTitle>
                <CardDescription class="line-clamp-1 text-xs mt-0.5">
                  <Icon name="lucide:map-pin" class="h-3 w-3 inline mr-1" />
                  {{ hotel.address }}, {{ hotel.postalCode }} {{ hotel.city }}
                </CardDescription>
              </div>
              <div class="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7"
                  @click.stop="openEditDialog(hotel)"
                >
                  <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 text-destructive"
                  @click.stop="openDeleteDialog(hotel)"
                >
                  <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="px-4 pb-4 space-y-2">
            <div class="space-y-1 text-xs text-muted-foreground">
              <div v-if="hotel.phone" class="flex items-center gap-1.5">
                <Icon name="lucide:phone" class="h-3 w-3 shrink-0" />
                <span>{{ hotel.phone }}</span>
              </div>
              <div v-if="hotel.email" class="flex items-center gap-1.5">
                <Icon name="lucide:mail" class="h-3 w-3 shrink-0" />
                <span class="truncate">{{ hotel.email }}</span>
              </div>
              <div
                v-if="hotel.latitude && hotel.longitude"
                class="flex items-center gap-1.5 text-green-600 dark:text-green-400"
              >
                <Icon name="lucide:navigation" class="h-3 w-3 shrink-0" />
                <span>Coordonnées GPS disponibles</span>
              </div>
            </div>
            <div class="flex gap-1.5 pt-1">
              <Button
                v-if="hotel.googleMapsUrl"
                variant="outline"
                size="sm"
                class="h-7 text-xs rounded-full px-2.5 flex-1"
                as="a"
                :href="hotel.googleMapsUrl"
                target="_blank"
                @click.stop
              >
                <Icon name="lucide:map" class="h-3 w-3 mr-1" />
                Maps
              </Button>
              <Button
                v-if="hotel.websiteUrl"
                variant="outline"
                size="sm"
                class="h-7 text-xs rounded-full px-2.5 flex-1"
                as="a"
                :href="hotel.websiteUrl"
                target="_blank"
                @click.stop
              >
                <Icon name="lucide:globe" class="h-3 w-3 mr-1" />
                Site web
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Map -->
      <div
        class="lg:col-span-3 h-[620px] rounded-2xl overflow-hidden border shadow-sm relative z-0"
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
              :lat-lng="[hotel.latitude!, hotel.longitude!]"
            >
              <LIcon
                :icon-url="
                  selectedHotel?.id === hotel.id
                    ? selectedIconUrl
                    : defaultIconUrl
                "
                :shadow-url="shadowUrl"
                :icon-size="iconSize"
                :icon-anchor="iconAnchor"
                :popup-anchor="popupAnchor"
                :shadow-size="shadowSize"
              />
              <LPopup>
                <div class="space-y-1 min-w-[160px] py-1">
                  <p class="font-semibold text-sm">{{ hotel.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ hotel.address }}, {{ hotel.postalCode }} {{ hotel.city }}
                  </p>
                  <p v-if="hotel.phone" class="text-xs text-muted-foreground">
                    {{ hotel.phone }}
                  </p>
                  <div class="flex gap-1.5 pt-1">
                    <a
                      v-if="hotel.googleMapsUrl"
                      :href="hotel.googleMapsUrl"
                      target="_blank"
                      class="text-xs text-primary hover:underline"
                      >Google Maps</a
                    >
                    <a
                      v-if="hotel.websiteUrl"
                      :href="hotel.websiteUrl"
                      target="_blank"
                      class="text-xs text-primary hover:underline"
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

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <div
        class="bg-muted/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
      >
        <Icon name="lucide:hotel" class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium">Aucun hôtel trouvé</h3>
      <p class="text-muted-foreground mt-1">
        {{
          searchQuery
            ? "Aucun résultat pour votre recherche."
            : "Ajoutez des partenaires hôteliers pour les afficher ici."
        }}
      </p>
      <Button
        v-if="!searchQuery"
        class="mt-4 rounded-full"
        @click="openCreateDialog"
      >
        <Icon name="lucide:plus" class="h-4 w-4" />
        Ajouter un hôtel
      </Button>
    </div>

    <!-- Dialogs -->
    <HotelFormDialog
      :open="showCreateDialog || showEditDialog"
      @update:open="
        (val) => {
          showCreateDialog = val;
          showEditDialog = val;
          if (!val) dialogHotel = null;
        }
      "
      :hotel="dialogHotel"
      @success="handleSuccess"
    />

    <HotelDeleteDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
      :hotel-id="dialogHotel?.id"
      :hotel-name="dialogHotel?.name"
      @success="handleSuccess"
    />

    <HotelImportDialog
      :open="showImportDialog"
      @update:open="showImportDialog = $event"
      @success="handleSuccess"
    />
  </div>
</template>

