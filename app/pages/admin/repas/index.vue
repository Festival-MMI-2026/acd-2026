<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

interface MealData {
  id: string;
  name: string;
  description?: string | null;
  date: Date | string;
  mealType: "LUNCH" | "DINNER";
  price: number | string;
  options?: any[];
}

// Fetch meals
const {
  data: meals,
  refresh,
  status,
} = await useFetch<MealData[]>("/api/meals");

// Search filter
const searchQuery = ref("");
const filteredMeals = computed(() => {
  if (!meals.value) return [];
  if (!searchQuery.value) return meals.value;

  const query = searchQuery.value.toLowerCase();
  return meals.value.filter(
    (meal) =>
      meal.name.toLowerCase().includes(query) ||
      meal.description?.toLowerCase().includes(query),
  );
});

// Dialog states
const isFormDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedMeal = ref<MealData | null>(null);

function openCreateDialog() {
  selectedMeal.value = null;
  isFormDialogOpen.value = true;
}

function openEditDialog(meal: MealData) {
  selectedMeal.value = meal;
  isFormDialogOpen.value = true;
}

function openDeleteDialog(meal: MealData) {
  selectedMeal.value = meal;
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
        <h1 class="text-2xl font-bold tracking-tight">Repas</h1>
        <p class="text-muted-foreground">Gestion des repas de l'événement</p>
      </div>
      <Button class="rounded-full" @click="openCreateDialog">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Ajouter un repas
      </Button>
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
        {{ filteredMeals.length }} repas
      </Badge>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Meals List -->
    <RepasList
      v-else
      :meals="filteredMeals"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
    />

    <!-- Form Dialog -->
    <RepasFormDialog
      v-model:open="isFormDialogOpen"
      :meal="selectedMeal"
      @success="handleSuccess"
    />

    <!-- Delete Dialog -->
    <RepasDeleteDialog
      v-model:open="isDeleteDialogOpen"
      :meal="selectedMeal"
      @success="handleSuccess"
    />
  </div>
</template>
