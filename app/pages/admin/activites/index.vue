<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

// Fetch activities
const { data: activities } = await useFetch("/api/activities");

// Mock data
const activityItems = computed(() => {
  if (activities.value && activities.value.length > 0) {
    return activities.value;
  }
  return [
    {
      id: 1,
      name: "Visite de la Cathédrale",
      date: "2026-06-18",
      time: "15:00",
      duration: "2h",
      price: 0,
      capacity: 30,
      registered: 28,
      category: "culture",
    },
    {
      id: 2,
      name: "Dégustation Champagne",
      date: "2026-06-18",
      time: "17:00",
      duration: "1h30",
      price: 35,
      capacity: 25,
      registered: 25,
      category: "gastronomy",
    },
    {
      id: 3,
      name: "Balade en ville",
      date: "2026-06-19",
      time: "14:00",
      duration: "2h",
      price: 0,
      capacity: 40,
      registered: 18,
      category: "tourism",
    },
    {
      id: 4,
      name: "Atelier Vitraux",
      date: "2026-06-19",
      time: "10:00",
      duration: "3h",
      price: 20,
      capacity: 15,
      registered: 12,
      category: "workshop",
    },
  ];
});

const categoryLabels: Record<string, string> = {
  culture: "Culture",
  gastronomy: "Gastronomie",
  tourism: "Tourisme",
  workshop: "Atelier",
  sport: "Sport",
};

const categoryColors: Record<string, string> = {
  culture: "bg-purple-500/10 text-purple-500",
  gastronomy: "bg-orange-500/10 text-orange-500",
  tourism: "bg-blue-500/10 text-blue-500",
  workshop: "bg-green-500/10 text-green-500",
  sport: "bg-red-500/10 text-red-500",
};

const categoryIcons: Record<string, string> = {
  culture: "lucide:landmark",
  gastronomy: "lucide:wine",
  tourism: "lucide:map-pin",
  workshop: "lucide:hammer",
  sport: "lucide:dumbbell",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Activités</h1>
        <p class="text-muted-foreground">Gestion des activités et excursions</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Ajouter une activité
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Rechercher une activité..."
          class="pl-9 rounded-full"
        />
      </div>
      <Button
        variant="outline"
        class="rounded-full"
        v-for="(label, key) in categoryLabels"
        :key="key"
      >
        {{ label }}
      </Button>
    </div>

    <!-- Activities Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="activity in activityItems"
        :key="activity.id"
        class="rounded-2xl overflow-hidden py-0 pb-2"
      >
        <div
          class="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
        >
          <Icon
            :name="categoryIcons[activity.category] || 'lucide:activity'"
            class="h-12 w-12 text-primary/50"
          />
        </div>
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-lg">{{ activity.name }}</CardTitle>
            <Badge
              :class="[
                'rounded-full shrink-0',
                categoryColors[activity.category] || 'bg-muted',
              ]"
            >
              {{ categoryLabels[activity.category] || activity.category }}
            </Badge>
          </div>
          <CardDescription>
            {{
              new Date(activity.date).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
            }}
            • {{ activity.time }} • {{ activity.duration }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="lucide:users" class="h-4 w-4" />
              <span>{{ activity.registered }} / {{ activity.capacity }}</span>
            </div>
            <span class="font-semibold">{{
              activity.price === 0 ? "Gratuit" : `${activity.price} €`
            }}</span>
          </div>
          <Progress
            :model-value="(activity.registered / activity.capacity) * 100"
            class="h-2"
          />
          <div class="flex gap-2">
            <Button variant="outline" size="sm" class="flex-1 rounded-full">
              <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 text-destructive"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
