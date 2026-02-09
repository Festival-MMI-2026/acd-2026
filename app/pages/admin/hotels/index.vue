<script setup lang="ts">
import HotelFormDialog from "@/components/hotels/HotelFormDialog.vue";
import HotelDeleteDialog from "@/components/hotels/HotelDeleteDialog.vue";

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

// Dialogs state
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedHotel = ref<any>(null);

function openCreateDialog() {
  selectedHotel.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(hotel: any) {
  selectedHotel.value = hotel;
  showEditDialog.value = true;
}

function openDeleteDialog(hotel: any) {
  selectedHotel.value = hotel;
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
      <Button class="rounded-full" @click="openCreateDialog">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Ajouter un hôtel
      </Button>
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
    </div>

    <!-- Hotels Grid -->
    <div
      v-if="filteredHotels.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card
        v-for="hotel in filteredHotels"
        :key="hotel.id"
        class="rounded-2xl overflow-hidden py-0 pb-2 flex flex-col"
      >
        <div
          class="h-32 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0"
        >
          <Icon name="lucide:building-2" class="h-12 w-12 text-primary/50" />
        </div>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg line-clamp-1">{{ hotel.name }}</CardTitle>
          <CardDescription class="line-clamp-1">
            <Icon name="lucide:map-pin" class="h-3 w-3 inline mr-1" />
            {{ hotel.address }}, {{ hotel.postalCode }} {{ hotel.city }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 flex-1 flex flex-col justify-end">
          <div class="space-y-2 text-sm">
            <div
              v-if="hotel.phone"
              class="flex items-center gap-2 text-muted-foreground"
            >
              <Icon name="lucide:phone" class="h-4 w-4" />
              <span>{{ hotel.phone }}</span>
            </div>
            <div
              v-if="hotel.email"
              class="flex items-center gap-2 text-muted-foreground"
            >
              <Icon name="lucide:mail" class="h-4 w-4" />
              <span class="truncate">{{ hotel.email }}</span>
            </div>
          </div>

          <div class="flex gap-2 pt-2 mt-auto">
            <Button
              v-if="hotel.googleMapsUrl"
              variant="outline"
              size="icon"
              class="rounded-full"
              as="a"
              :href="hotel.googleMapsUrl"
              target="_blank"
              title="Voir sur Google Maps"
            >
              <Icon name="lucide:map" class="h-4 w-4" />
            </Button>
            <Button
              v-if="hotel.websiteUrl"
              variant="outline"
              size="icon"
              class="rounded-full"
              as="a"
              :href="hotel.websiteUrl"
              target="_blank"
              title="Visiter le site web"
            >
              <Icon name="lucide:globe" class="h-4 w-4" />
            </Button>
            <div class="flex-1"></div>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9"
              @click="openEditDialog(hotel)"
            >
              <Icon name="lucide:pencil" class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 text-destructive"
              @click="openDeleteDialog(hotel)"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
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
        Ajoutez des partenaires hôteliers pour les afficher ici.
      </p>
      <Button class="mt-4 rounded-full" @click="openCreateDialog">
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
          if (!val) selectedHotel = null;
        }
      "
      :hotel="selectedHotel"
      @success="handleSuccess"
    />

    <HotelDeleteDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
      :hotel-id="selectedHotel?.id"
      :hotel-name="selectedHotel?.name"
      @success="handleSuccess"
    />
  </div>
</template>
