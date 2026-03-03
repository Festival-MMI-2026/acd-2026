<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  location?: string | null;
}

// Fetch events
const {
  data: events,
  refresh,
  status,
} = await useFetch<EventData[]>("/api/events");

// Search filter
const searchQuery = ref("");
const filteredEvents = computed(() => {
  if (!events.value) return [];
  if (!searchQuery.value) return events.value;

  const query = searchQuery.value.toLowerCase();
  return events.value.filter(
    (event) =>
      event.title.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query),
  );
});

// Dialog states
const isFormDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isImportDialogOpen = ref(false);
const selectedEvent = ref<EventData | null>(null);

function openCreateDialog() {
  selectedEvent.value = null;
  isFormDialogOpen.value = true;
}

function openEditDialog(event: EventData) {
  selectedEvent.value = event;
  isFormDialogOpen.value = true;
}

function openDeleteDialog(event: EventData) {
  selectedEvent.value = event;
  isDeleteDialogOpen.value = true;
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
        <h1 class="text-2xl font-bold tracking-tight">Programme</h1>
        <p class="text-muted-foreground">Gestion du programme de l'événement</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="rounded-full" @click="isImportDialogOpen = true">
          <Icon name="lucide:upload" class="h-4 w-4" />
          Importer CSV
        </Button>
        <Button class="rounded-full" @click="openCreateDialog">
          <Icon name="lucide:plus" class="h-4 w-4" />
          Ajouter un événement
        </Button>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher..."
          class="pl-9 rounded-full bg-card"
        />
      </div>
      <Badge variant="secondary" class="rounded-full">
        {{ filteredEvents.length }} événement{{
          filteredEvents.length > 1 ? "s" : ""
        }}
      </Badge>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Events List -->
    <ProgrammeList
      v-else
      :events="filteredEvents"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
    />

    <!-- Form Dialog -->
    <ProgrammeFormDialog
      v-model:open="isFormDialogOpen"
      :event="selectedEvent"
      @success="handleSuccess"
    />

    <!-- Delete Dialog -->
    <ProgrammeDeleteDialog
      v-model:open="isDeleteDialogOpen"
      :event="selectedEvent"
      @success="handleSuccess"
    />

    <!-- Import Dialog -->
    <ProgrammeImportDialog
      v-model:open="isImportDialogOpen"
      @success="handleSuccess"
    />
  </div>
</template>
