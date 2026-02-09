<script setup lang="ts">
definePageMeta({
  layout: "default",
});

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location?: string | null;
}

const { data: events, status } = await useFetch<EventData[]>("/api/events");

// Parse date string without timezone shift (treat as local date)
function parseDate(dateStr: string) {
  // Extract YYYY-MM-DD to avoid UTC interpretation
  const iso = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = iso.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Group events by date, sorted by startTime within each day
const eventsByDate = computed(() => {
  if (!events.value) return new Map<string, EventData[]>();

  const grouped = new Map<string, EventData[]>();
  for (const event of events.value) {
    const dateKey = event.date.includes("T")
      ? event.date.split("T")[0]
      : event.date;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  }

  // Sort events within each day by startTime
  for (const [, dayEvents] of grouped) {
    dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return grouped;
});

function formatDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  const date = parseDate(dateStr);
  return {
    day: date.toLocaleDateString("fr-FR", { day: "numeric" }),
    month: date.toLocaleDateString("fr-FR", { month: "short" }),
    weekday: date.toLocaleDateString("fr-FR", { weekday: "short" }),
  };
}
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">Programme</h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Retrouvez le programme complet de l'Assemblée des Chefs de Départements
        MMI 2026 à Troyes.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <div class="flex items-center gap-3 text-muted-foreground">
        <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
        <span>Chargement du programme...</span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!events || events.length === 0"
      class="text-center py-16 space-y-4"
    >
      <div
        class="bg-muted/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto"
      >
        <Icon
          name="lucide:calendar-x"
          class="h-10 w-10 text-muted-foreground"
        />
      </div>
      <h3 class="text-lg font-medium">Programme à venir</h3>
      <p class="text-muted-foreground max-w-md mx-auto">
        Le programme détaillé de l'événement sera bientôt disponible. Revenez
        prochainement pour découvrir les activités prévues.
      </p>
    </div>

    <!-- Programme content -->
    <div v-else class="max-w-4xl mx-auto space-y-12">
      <!-- Day block -->
      <div v-for="[dateKey, dayEvents] in eventsByDate" :key="dateKey">
        <!-- Day header -->
        <div class="flex items-center gap-4 mb-6">
          <div
            class="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shrink-0"
          >
            <span class="text-2xl font-bold leading-none">{{
              formatDateShort(dateKey).day
            }}</span>
            <span class="text-xs uppercase">{{
              formatDateShort(dateKey).month
            }}</span>
          </div>
          <div>
            <h2 class="text-xl font-semibold capitalize">
              {{ formatDate(dateKey) }}
            </h2>
            <p class="text-sm text-muted-foreground">
              {{ dayEvents.length }} événement{{
                dayEvents.length > 1 ? "s" : ""
              }}
            </p>
          </div>
        </div>

        <!-- Timeline -->
        <div class="relative ml-8 border-l-2 border-border pl-8 space-y-6">
          <div v-for="event in dayEvents" :key="event.id" class="relative">
            <!-- Timeline dot -->
            <div
              class="absolute -left-[calc(2rem+5px)] top-3 w-3 h-3 rounded-full bg-primary ring-4 ring-background"
            ></div>

            <Card class="transition-all duration-200 hover:shadow-md gap-0">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <CardTitle class="text-lg">{{ event.title }}</CardTitle>
                    <div
                      class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
                    >
                      <span class="flex items-center gap-1.5">
                        <Icon name="lucide:clock" class="h-4 w-4" />
                        {{ event.startTime }} - {{ event.endTime }}
                      </span>
                      <span
                        v-if="event.location"
                        class="flex items-center gap-1.5"
                      >
                        <Icon name="lucide:map-pin" class="h-4 w-4" />
                        {{ event.location }}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" class="rounded-full shrink-0">
                    {{ event.startTime }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent v-if="event.description">
                <p class="text-sm text-muted-foreground leading-relaxed">
                  {{ event.description }}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Info card -->
    <Card class="max-w-4xl mx-auto bg-muted/30 border-dashed">
      <CardContent class="p-6 text-center">
        <div
          class="flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Icon name="lucide:info" class="h-5 w-5" />
          <p>
            Le programme est susceptible d'être modifié. Pour toute question,
            contactez-nous à
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
