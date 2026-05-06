<script setup lang="ts">
import type { Activity } from "~/types/registration";

const props = defineProps<{
  modelValue: string[];
  activitiesData?: Activity[] | null;
  showErrors?: boolean;
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
  if (isActivitySelected(activityId)) {
    emit(
      "update:modelValue",
      props.modelValue.filter((id) => id !== activityId),
    );
  } else {
    emit("update:modelValue", [...props.modelValue, activityId]);
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTimeRange(startTime?: string, endTime?: string) {
  if (!startTime && !endTime) return null;
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime || null;
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header compact -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Activités *
      </p>
      <Badge v-if="modelValue.length > 0" variant="secondary" class="tabular-nums text-xs">
        {{ modelValue.length }} sélectionnée{{ modelValue.length > 1 ? "s" : "" }}
      </Badge>
    </div>

    <!-- Error -->
    <p v-if="showErrors && modelValue.length === 0" class="text-sm text-destructive">
      Veuillez sélectionner au moins une activité
    </p>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
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
      <div v-else class="space-y-3">
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
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm leading-none font-medium">
                {{ activity.name }}
              </p>
              <Badge v-if="Number(activity.price || 0) > 0" class="tabular-nums shrink-0">
                {{ Number(activity.price).toFixed(2) }} €
              </Badge>
              <Badge v-else variant="outline" class="shrink-0 text-xs font-normal">
                Gratuit
              </Badge>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline" class="text-xs font-normal gap-1">
                <Icon name="lucide:calendar" class="h-3 w-3" />
                {{ formatDate(activity.date) }}
              </Badge>
              <Badge
                v-if="!activity.allDay && formatTimeRange(activity.startTime, activity.endTime)"
                variant="outline"
                class="text-xs font-normal gap-1 tabular-nums"
              >
                <Icon name="lucide:clock" class="h-3 w-3" />
                {{ formatTimeRange(activity.startTime, activity.endTime) }}
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
