<script setup lang="ts">
import ActivityFormDialog from "@/components/activities/ActivityFormDialog.vue";
import ActivityDeleteDialog from "@/components/activities/ActivityDeleteDialog.vue";

definePageMeta({
  layout: "admin",
});

// Fetch activities
const { data: activities, refresh } = await useFetch("/api/activities");

// Search
const searchQuery = ref("");
const filteredActivities = computed(() => {
  if (!activities.value) return [];
  if (!searchQuery.value) return activities.value;

  const query = searchQuery.value.toLowerCase();
  return activities.value.filter(
    (activity) =>
      activity.name.toLowerCase().includes(query) ||
      activity.description?.toLowerCase().includes(query),
  );
});

// Dialogs state
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedActivity = ref<any>(null);

function openCreateDialog() {
  selectedActivity.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(activity: any) {
  selectedActivity.value = activity;
  showEditDialog.value = true;
}

function openDeleteDialog(activity: any) {
  selectedActivity.value = activity;
  showDeleteDialog.value = true;
}

function handleSuccess() {
  refresh();
}

function getDuration(start: string, end: string) {
  if (!start || !end) return "";
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  if (
    startH === undefined ||
    startM === undefined ||
    endH === undefined ||
    endM === undefined
  )
    return "";

  const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h${minutes > 0 ? minutes : ""}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Activités</h1>
        <p class="text-muted-foreground">Gestion des activités et excursions</p>
      </div>
      <Button class="rounded-full" @click="openCreateDialog">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Ajouter une activité
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
          placeholder="Rechercher une activité..."
          class="pl-9 rounded-full"
        />
      </div>
    </div>

    <!-- Activities Grid -->
    <div
      v-if="filteredActivities.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="rounded-2xl overflow-hidden"
      >
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-lg line-clamp-1">{{
              activity.name
            }}</CardTitle>
            <Badge variant="secondary" class="rounded-full shrink-0">
              {{ activity.startTime }} - {{ activity.endTime }}
            </Badge>
          </div>
          <CardDescription>
            {{
              new Date(activity.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            }}
            • {{ getDuration(activity.startTime, activity.endTime) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 flex-1 flex flex-col justify-end">
          <div
            v-if="activity.description"
            class="text-sm text-muted-foreground line-clamp-2"
          >
            {{ activity.description }}
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="lucide:users" class="h-4 w-4" />
              <span
                >{{ activity.registered }} /
                {{ activity.maxParticipants || "∞" }}</span
              >
            </div>
            <span class="font-semibold">{{
              activity.price === 0
                ? "Gratuit"
                : `${Number(activity.price).toFixed(2)} €`
            }}</span>
          </div>
          <Progress
            v-if="activity.maxParticipants"
            :model-value="
              (activity.registered / activity.maxParticipants) * 100
            "
            class="h-2"
          />
          <div class="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              class="flex-1 rounded-full"
              @click="openEditDialog(activity)"
            >
              <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 text-destructive"
              @click="openDeleteDialog(activity)"
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
        <Icon
          name="lucide:calendar-off"
          class="h-10 w-10 text-muted-foreground"
        />
      </div>
      <h3 class="text-lg font-medium">Aucune activité trouvée</h3>
      <p class="text-muted-foreground mt-1">
        Commencez par ajouter une nouvelle activité au programme.
      </p>
      <Button class="mt-4 rounded-full" @click="openCreateDialog">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Ajouter une activité
      </Button>
    </div>

    <!-- Dialogs -->
    <ActivityFormDialog
      :open="showCreateDialog || showEditDialog"
      @update:open="
        (val) => {
          showCreateDialog = val;
          showEditDialog = val;
          if (!val) selectedActivity = null;
        }
      "
      :activity="selectedActivity"
      @success="handleSuccess"
    />

    <ActivityDeleteDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
      :activity-id="selectedActivity?.id"
      :activity-name="selectedActivity?.name"
      @success="handleSuccess"
    />
  </div>
</template>
