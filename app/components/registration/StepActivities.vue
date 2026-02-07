<script setup lang="ts">
interface Activity {
  id: string;
  name: string;
  date: string;
  description?: string;
  duration?: number;
  capacity?: number;
  location?: string;
}

const props = defineProps<{
  modelValue: string[]; // Array of activity IDs
  activitiesData?: Activity[] | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

// Use activities from props
const activities = computed(() => props.activitiesData || []);
const isLoading = computed(() => !props.activitiesData);

function isActivitySelected(activityId: string): boolean {
  return props.modelValue.includes(activityId);
}

function toggleActivity(activityId: string) {
  console.log(
    "Toggling activity:",
    activityId,
    "Current selection:",
    props.modelValue,
  );
  if (isActivitySelected(activityId)) {
    const newValue = props.modelValue.filter((id) => id !== activityId);
    console.log("Removing activity, new value:", newValue);
    emit("update:modelValue", newValue);
  } else {
    const newValue = [...props.modelValue, activityId];
    console.log("Adding activity, new value:", newValue);
    emit("update:modelValue", newValue);
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Choix des activités</h2>
      <p class="text-muted-foreground">
        Sélectionnez les activités auxquelles vous souhaitez participer
        (optionnel)
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty state -->
      <div v-if="!activities?.length" class="text-center py-12">
        <Icon
          name="lucide:activity"
          class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"
        />
        <p class="text-muted-foreground">
          Aucune activité disponible pour le moment
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Vous pouvez passer à l'étape suivante
        </p>
      </div>

      <!-- Activities list -->
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors"
          :class="{
            'border-primary bg-primary/5 dark:bg-primary/10':
              isActivitySelected(activity.id),
          }"
          @click="toggleActivity(activity.id)"
        >
          <Checkbox
            :id="`activity-${activity.id}`"
            :checked="isActivitySelected(activity.id)"
            class="mt-1 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
            @click.stop
            @update:checked="toggleActivity(activity.id)"
          />
          <div class="grid gap-2 font-normal flex-1">
            <p class="text-base leading-none font-medium">
              {{ activity.name }}
            </p>
            <p class="text-sm text-muted-foreground flex items-center gap-1">
              <Icon name="lucide:calendar" class="h-3 w-3" />
              {{ formatDate(activity.date) }}
            </p>
            <p
              v-if="activity.location"
              class="text-xs text-muted-foreground flex items-center gap-1"
            >
              <Icon name="lucide:map-pin" class="h-3 w-3" />
              {{ activity.location }}
            </p>
            <p
              v-if="activity.description"
              class="text-sm text-muted-foreground mt-1"
            >
              {{ activity.description }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
