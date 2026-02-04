<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

// Fetch events
const { data: events, refresh } = await useFetch("/api/events");

// Mock data for display if no real data
const programItems = computed(() => {
  if (events.value && events.value.length > 0) {
    return events.value;
  }
  return [
    {
      id: 1,
      title: "Accueil des participants",
      date: "2026-06-18",
      time: "09:00",
      location: "Hall principal",
      type: "general",
    },
    {
      id: 2,
      title: "Conférence d'ouverture",
      date: "2026-06-18",
      time: "10:00",
      location: "Amphi A",
      type: "conference",
    },
    {
      id: 3,
      title: "Atelier référentiel BUT",
      date: "2026-06-18",
      time: "14:00",
      location: "Salle 101",
      type: "workshop",
    },
    {
      id: 4,
      title: "Table ronde SAÉ",
      date: "2026-06-19",
      time: "09:30",
      location: "Amphi B",
      type: "roundtable",
    },
    {
      id: 5,
      title: "Cocktail de clôture",
      date: "2026-06-19",
      time: "18:00",
      location: "Terrasse",
      type: "social",
    },
  ];
});

const eventTypeColors: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-500",
  conference: "bg-purple-500/10 text-purple-500",
  workshop: "bg-orange-500/10 text-orange-500",
  roundtable: "bg-green-500/10 text-green-500",
  social: "bg-pink-500/10 text-pink-500",
};

const eventTypeLabels: Record<string, string> = {
  general: "Général",
  conference: "Conférence",
  workshop: "Atelier",
  roundtable: "Table ronde",
  social: "Social",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Programme</h1>
        <p class="text-muted-foreground">Gestion du programme de l'événement</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Ajouter un événement
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input placeholder="Rechercher..." class="pl-9 rounded-full" />
      </div>
      <Button variant="outline" class="rounded-full">
        <Icon name="lucide:filter" class="mr-2 h-4 w-4" />
        Filtrer
      </Button>
    </div>

    <!-- Program Table -->
    <Card class="rounded-2xl">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Événement</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Type</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in programItems"
              :key="item.id"
              class="cursor-pointer"
            >
              <TableCell class="font-medium">{{ item.title }}</TableCell>
              <TableCell class="text-muted-foreground">
                {{
                  new Date(item.date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                }}
              </TableCell>
              <TableCell class="text-muted-foreground">{{
                item.time
              }}</TableCell>
              <TableCell class="text-muted-foreground">{{
                item.location
              }}</TableCell>
              <TableCell>
                <Badge
                  :class="[
                    'rounded-full',
                    eventTypeColors[item.type] || 'bg-muted',
                  ]"
                >
                  {{ eventTypeLabels[item.type] || item.type }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-destructive"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
