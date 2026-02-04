<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

// Fetch meals
const { data: meals } = await useFetch("/api/meals");

// Mock data
const mealItems = computed(() => {
  if (meals.value && meals.value.length > 0) {
    return meals.value;
  }
  return [
    {
      id: 1,
      name: "Déjeuner Jour 1",
      date: "2026-06-18",
      time: "12:30",
      price: 25,
      capacity: 150,
      registered: 87,
      menuType: "standard",
    },
    {
      id: 2,
      name: "Dîner de Gala",
      date: "2026-06-18",
      time: "20:00",
      price: 65,
      capacity: 120,
      registered: 98,
      menuType: "gala",
    },
    {
      id: 3,
      name: "Déjeuner Jour 2",
      date: "2026-06-19",
      time: "12:30",
      price: 25,
      capacity: 150,
      registered: 72,
      menuType: "standard",
    },
    {
      id: 4,
      name: "Cocktail de clôture",
      date: "2026-06-19",
      time: "18:00",
      price: 15,
      capacity: 200,
      registered: 145,
      menuType: "cocktail",
    },
  ];
});

const menuTypeLabels: Record<string, string> = {
  standard: "Standard",
  gala: "Gala",
  cocktail: "Cocktail",
  vegetarian: "Végétarien",
};

const menuTypeColors: Record<string, string> = {
  standard: "bg-blue-500/10 text-blue-500",
  gala: "bg-purple-500/10 text-purple-500",
  cocktail: "bg-pink-500/10 text-pink-500",
  vegetarian: "bg-green-500/10 text-green-500",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Repas</h1>
        <p class="text-muted-foreground">Gestion des repas et menus</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Ajouter un repas
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:utensils" class="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ mealItems.length }}</p>
              <p class="text-sm text-muted-foreground">Repas programmés</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:users" class="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">
                {{ mealItems.reduce((acc, m) => acc + m.registered, 0) }}
              </p>
              <p class="text-sm text-muted-foreground">Réservations totales</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:euro" class="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">
                {{
                  mealItems.reduce((acc, m) => acc + m.price * m.registered, 0)
                }}
                €
              </p>
              <p class="text-sm text-muted-foreground">Revenus repas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Meals Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card v-for="meal in mealItems" :key="meal.id" class="rounded-2xl">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div>
              <CardTitle>{{ meal.name }}</CardTitle>
              <CardDescription class="mt-1">
                {{
                  new Date(meal.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                }}
                à {{ meal.time }}
              </CardDescription>
            </div>
            <Badge
              :class="[
                'rounded-full',
                menuTypeColors[meal.menuType] || 'bg-muted',
              ]"
            >
              {{ menuTypeLabels[meal.menuType] || meal.menuType }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Prix</span>
            <span class="font-semibold">{{ meal.price }} €</span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Inscriptions</span>
              <span class="font-semibold"
                >{{ meal.registered }} / {{ meal.capacity }}</span
              >
            </div>
            <Progress
              :model-value="(meal.registered / meal.capacity) * 100"
              class="h-2"
            />
          </div>
          <div class="flex gap-2 pt-2">
            <Button variant="outline" size="sm" class="flex-1 rounded-full">
              <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" class="rounded-full">
              <Icon name="lucide:users" class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
