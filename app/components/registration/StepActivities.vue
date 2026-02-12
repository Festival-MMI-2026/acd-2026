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
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <Icon name="lucide:activity" class="h-5 w-5 text-primary" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold tracking-tight">
              Choix des activités
            </h2>
            <Badge
              v-if="modelValue.length > 0"
              variant="secondary"
              class="tabular-nums"
            >
              {{ modelValue.length }} sélectionnée{{
                modelValue.length > 1 ? "s" : ""
              }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            Sélectionnez les activités auxquelles vous souhaitez participer
            (optionnel)
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Loading -->
    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-32 w-full rounded-xl" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty state -->
      <Card v-if="!activities?.length" class="border-dashed">
        <CardContent class="flex flex-col items-center justify-center py-12">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
          >
            <Icon
              name="lucide:activity"
              class="h-7 w-7 text-muted-foreground"
            />
          </div>
          <p class="font-medium text-muted-foreground">
            Aucune activité disponible pour le moment
          </p>
          <p class="mt-1 text-sm text-muted-foreground/70">
            Vous pouvez passer à l'étape suivante
          </p>
        </CardContent>
      </Card>

      <!-- Activities list -->
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <Label
          v-for="activity in activities"
          :key="activity.id"
          class="group hover:bg-accent/50 flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 has-aria-checked:border-primary has-aria-checked:bg-primary/5 has-aria-checked:shadow-sm dark:has-aria-checked:bg-primary/10"
        >
          <Checkbox
            :id="`activity-${activity.id}`"
            :model-value="isActivitySelected(activity.id)"
            class="mt-1 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
            @update:model-value="toggleActivity(activity.id)"
          />
          <div class="grid gap-2 font-normal flex-1">
            <p class="text-sm leading-none font-medium">
              {{ activity.name }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline" class="text-xs font-normal gap-1">
                <Icon name="lucide:calendar" class="h-3 w-3" />
                {{ formatDate(activity.date) }}
              </Badge>
              <Badge
                v-if="activity.location"
                variant="outline"
                class="text-xs font-normal gap-1"
              >
                <Icon name="lucide:map-pin" class="h-3 w-3" />
                {{ activity.location }}
              </Badge>
            </div>
            <p
              v-if="activity.description"
              class="text-muted-foreground text-xs leading-relaxed mt-1"
            >
              {{ activity.description }}
            </p>
          </div>
        </Label>
      </div>
    </template>
  </div>
</template>
