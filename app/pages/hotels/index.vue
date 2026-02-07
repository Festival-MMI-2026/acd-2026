<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Fetch hotels from API
const { data: hotels, pending } = await useFetch("/api/hotels");

// Map state
const mapRef = ref<any>(null);
const selectedHotel = ref<any>(null);

// Center on Troyes
const mapCenter = ref<[number, number]>([48.3, 4.08]);
const mapZoom = ref(13);

// Computed hotels with valid coordinates
const hotelsWithCoords = computed(() => {
  if (!hotels.value) return [];
  return hotels.value.filter((hotel) => hotel.latitude && hotel.longitude);
});

// Select hotel from card or marker
function selectHotel(hotel: any) {
  selectedHotel.value = hotel;
  if (hotel.latitude && hotel.longitude) {
    mapCenter.value = [hotel.latitude, hotel.longitude];
    mapZoom.value = 16;
  }
}

// Clear selection
function clearSelection() {
  selectedHotel.value = null;
  mapCenter.value = [48.3, 4.08];
  mapZoom.value = 13;
}
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
        Hébergements à Troyes
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Découvrez nos hôtels partenaires pour votre séjour lors de l'Assemblée
        des Chefs de Départements MMI.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="flex items-center gap-3 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
        <span>Chargement des hébergements...</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Hotels List -->
      <div class="space-y-4 lg:col-span-1 max-h-[600px] overflow-y-auto pr-2">
        <!-- Back to all button when hotel selected -->
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

        <!-- Empty state -->
        <div
          v-if="!hotels || hotels.length === 0"
          class="text-center py-12 space-y-4"
        >
          <div
            class="bg-muted/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto"
          >
            <Icon
              name="lucide:building-2"
              class="h-10 w-10 text-muted-foreground"
            />
          </div>
          <h3 class="text-lg font-medium">Aucun hôtel disponible</h3>
          <p class="text-muted-foreground">
            Les informations sur les hébergements seront bientôt disponibles.
          </p>
        </div>

        <!-- Hotel cards -->
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
            <!-- Contact info -->
            <div class="space-y-2 text-sm">
              <div
                v-if="hotel.phone"
                class="flex items-center gap-2 text-muted-foreground"
              >
                <Icon name="lucide:phone" class="h-4 w-4" />
                <a :href="`tel:${hotel.phone}`" class="hover:text-foreground">
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
                >
                  {{ hotel.email }}
                </a>
              </div>
            </div>

            <!-- Action buttons -->
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
      <div class="lg:col-span-2 h-[400px] lg:h-[600px]">
        <Map
          ref="mapRef"
          :center="mapCenter"
          :zoom="mapZoom"
          height="100%"
          class="shadow-lg"
        >
          <MapMarker
            v-for="hotel in hotelsWithCoords"
            :key="hotel.id"
            :position="[hotel.latitude, hotel.longitude]"
            :title="hotel.name"
          >
            <div class="space-y-2 min-w-[200px]">
              <p class="text-sm text-muted-foreground">
                {{ hotel.address }}
              </p>
              <div class="flex gap-2">
                <Button
                  v-if="hotel.googleMapsUrl"
                  variant="outline"
                  size="sm"
                  class="rounded-full text-xs"
                  as="a"
                  :href="hotel.googleMapsUrl"
                  target="_blank"
                >
                  <Icon name="lucide:navigation" class="h-3 w-3 mr-1" />
                  Itinéraire
                </Button>
              </div>
            </div>
          </MapMarker>
        </Map>
      </div>
    </div>

    <!-- Additional info -->
    <Card class="bg-muted/30 border-dashed">
      <CardContent class="p-6 text-center">
        <div
          class="flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Icon name="lucide:info" class="h-5 w-5" />
          <p>
            Pour toute question concernant l'hébergement, contactez-nous à
            <a
              href="mailto:acd@iut-troyes.univ-reims.fr"
              class="text-primary hover:underline"
            >
              acd@iut-troyes.univ-reims.fr
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Custom scrollbar for hotel list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>
