<script setup lang="ts">
interface Meal {
  id: string;
  name: string;
  date: string;
  mealType: "LUNCH" | "DINNER";
  price: number;
  options: MealOption[];
}

interface MealOption {
  id: string;
  name: string;
  optionType: "STARTER" | "MAIN" | "DESSERT";
  hasAllergens: boolean;
  allergens: string[];
}

interface SelectedMeal {
  mealId: string;
  starterOptionId?: string;
  mainOptionId?: string;
  dessertOptionId?: string;
}

const props = defineProps<{
  modelValue: SelectedMeal[];
  mealsData?: Meal[] | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SelectedMeal[]];
}>();

// Use meals from props
const meals = computed(() => props.mealsData || []);
const isLoading = computed(() => !props.mealsData);

function isMealSelected(mealId: string): boolean {
  return props.modelValue.some((m) => m.mealId === mealId);
}

function getSelectedMeal(mealId: string): SelectedMeal | undefined {
  return props.modelValue.find((m) => m.mealId === mealId);
}

function toggleMeal(mealId: string) {
  console.log("Toggling meal:", mealId, "Current selection:", props.modelValue);
  if (isMealSelected(mealId)) {
    const newValue = props.modelValue.filter((m) => m.mealId !== mealId);
    console.log("Removing meal, new value:", newValue);
    emit("update:modelValue", newValue);
  } else {
    const newValue = [...props.modelValue, { mealId }];
    console.log("Adding meal, new value:", newValue);
    emit("update:modelValue", newValue);
  }
}

function updateMealOption(
  mealId: string,
  optionType: "starterOptionId" | "mainOptionId" | "dessertOptionId",
  optionId: string,
) {
  const updated = props.modelValue.map((m) => {
    if (m.mealId === mealId) {
      return { ...m, [optionType]: optionId };
    }
    return m;
  });
  emit("update:modelValue", updated);
}

function getOptionsByType(
  meal: Meal,
  type: "STARTER" | "MAIN" | "DESSERT",
): MealOption[] {
  return meal.options?.filter((o) => o.optionType === type) || [];
}

function getAllAllergens(meal: Meal): string[] {
  const allergens = new Set<string>();
  meal.options?.forEach((o) => {
    if (o.hasAllergens && o.allergens?.length) {
      o.allergens.forEach((a) => allergens.add(a));
    }
  });
  return Array.from(allergens);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getMealTypeLabel(type: string) {
  return type === "LUNCH" ? "Déjeuner" : "Dîner";
}

function formatAllergens(allergens: string[]): string {
  return allergens.join(", ");
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Choix des repas</h2>
      <p class="text-muted-foreground">
        Sélectionnez les repas et choisissez vos options (entrée, plat, dessert)
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
      <div v-if="!meals?.length" class="text-center py-12">
        <Icon
          name="lucide:utensils"
          class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"
        />
        <p class="text-muted-foreground">
          Aucun repas disponible pour le moment
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Vous pouvez passer à l'étape suivante
        </p>
      </div>

      <!-- Meals list -->
      <div v-else class="space-y-6">
        <div v-for="meal in meals" :key="meal.id" class="space-y-3">
          <!-- Meal checkbox card with details -->
          <Label
            class="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors has-aria-checked:border-primary has-aria-checked:bg-primary/5 dark:has-aria-checked:bg-primary/10"
          >
            <Checkbox
              :id="`meal-${meal.id}`"
              :model-value="isMealSelected(meal.id)"
              class="mt-1 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              @update:model-value="toggleMeal(meal.id)"
            />
            <div class="grid gap-3 font-normal flex-1">
              <!-- Header -->
              <div class="flex items-center justify-between">
                <p class="text-base leading-none font-medium">
                  {{ meal.name }}
                </p>
                <Badge variant="secondary">
                  {{ Number(meal.price).toFixed(2) }} €
                </Badge>
              </div>

              <!-- Date and type -->
              <div
                class="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="h-3 w-3" />
                  {{ formatDate(meal.date) }}
                </span>
                <Badge variant="outline" class="text-xs">
                  {{ getMealTypeLabel(meal.mealType) }}
                </Badge>
              </div>

              <!-- Menu details -->
              <div
                v-if="meal.options?.length"
                class="grid gap-2 pt-2 border-t text-sm"
              >
                <!-- Starters -->
                <div v-if="getOptionsByType(meal, 'STARTER').length">
                  <span class="font-medium text-muted-foreground"
                    >Entrées :</span
                  >
                  <span class="ml-1">
                    {{
                      getOptionsByType(meal, "STARTER")
                        .map((o) => o.name)
                        .join(" • ")
                    }}
                  </span>
                </div>

                <!-- Main courses -->
                <div v-if="getOptionsByType(meal, 'MAIN').length">
                  <span class="font-medium text-muted-foreground">Plats :</span>
                  <span class="ml-1">
                    {{
                      getOptionsByType(meal, "MAIN")
                        .map((o) => o.name)
                        .join(" • ")
                    }}
                  </span>
                </div>

                <!-- Desserts -->
                <div v-if="getOptionsByType(meal, 'DESSERT').length">
                  <span class="font-medium text-muted-foreground"
                    >Desserts :</span
                  >
                  <span class="ml-1">
                    {{
                      getOptionsByType(meal, "DESSERT")
                        .map((o) => o.name)
                        .join(" • ")
                    }}
                  </span>
                </div>
              </div>

              <!-- Allergens summary -->
              <div
                v-if="getAllAllergens(meal).length"
                class="flex items-center gap-1"
              >
                <Icon
                  name="lucide:alert-triangle"
                  class="h-3 w-3 text-amber-500"
                />
                <span class="text-xs text-amber-600 dark:text-amber-400">
                  Allergènes : {{ formatAllergens(getAllAllergens(meal)) }}
                </span>
              </div>
            </div>
          </Label>

          <!-- Options selection (show when selected) -->
          <Card v-if="isMealSelected(meal.id)" class="ml-8 border-primary/30">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Faites vos choix</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Starters -->
              <div
                v-if="getOptionsByType(meal, 'STARTER').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium">Entrée</Label>
                <RadioGroup
                  :model-value="getSelectedMeal(meal.id)?.starterOptionId"
                  @update:model-value="
                    updateMealOption(meal.id, 'starterOptionId', String($event))
                  "
                  class="space-y-2"
                >
                  <div
                    v-for="option in getOptionsByType(meal, 'STARTER')"
                    :key="option.id"
                    class="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer"
                    :class="{
                      'border-primary bg-primary/5':
                        getSelectedMeal(meal.id)?.starterOptionId === option.id,
                    }"
                  >
                    <RadioGroupItem
                      :value="option.id"
                      :id="`starter-${option.id}`"
                      class="mt-0.5"
                    />
                    <div class="grid gap-1 font-normal flex-1">
                      <Label
                        :for="`starter-${option.id}`"
                        class="text-sm leading-none font-medium cursor-pointer"
                      >
                        {{ option.name }}
                      </Label>
                      <div
                        v-if="option.hasAllergens && option.allergens?.length"
                        class="flex items-center gap-1"
                      >
                        <Icon
                          name="lucide:alert-triangle"
                          class="h-3 w-3 text-amber-500"
                        />
                        <span
                          class="text-xs text-amber-600 dark:text-amber-400"
                        >
                          {{ formatAllergens(option.allergens) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <!-- Main courses -->
              <div
                v-if="getOptionsByType(meal, 'MAIN').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium">Plat principal</Label>
                <RadioGroup
                  :model-value="getSelectedMeal(meal.id)?.mainOptionId"
                  @update:model-value="
                    updateMealOption(meal.id, 'mainOptionId', String($event))
                  "
                  class="space-y-2"
                >
                  <div
                    v-for="option in getOptionsByType(meal, 'MAIN')"
                    :key="option.id"
                    class="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer"
                    :class="{
                      'border-primary bg-primary/5':
                        getSelectedMeal(meal.id)?.mainOptionId === option.id,
                    }"
                  >
                    <RadioGroupItem
                      :value="option.id"
                      :id="`main-${option.id}`"
                      class="mt-0.5"
                    />
                    <div class="grid gap-1 font-normal flex-1">
                      <Label
                        :for="`main-${option.id}`"
                        class="text-sm leading-none font-medium cursor-pointer"
                      >
                        {{ option.name }}
                      </Label>
                      <div
                        v-if="option.hasAllergens && option.allergens?.length"
                        class="flex items-center gap-1"
                      >
                        <Icon
                          name="lucide:alert-triangle"
                          class="h-3 w-3 text-amber-500"
                        />
                        <span
                          class="text-xs text-amber-600 dark:text-amber-400"
                        >
                          {{ formatAllergens(option.allergens) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <!-- Desserts -->
              <div
                v-if="getOptionsByType(meal, 'DESSERT').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium">Dessert</Label>
                <RadioGroup
                  :model-value="getSelectedMeal(meal.id)?.dessertOptionId"
                  @update:model-value="
                    updateMealOption(meal.id, 'dessertOptionId', String($event))
                  "
                  class="space-y-2"
                >
                  <div
                    v-for="option in getOptionsByType(meal, 'DESSERT')"
                    :key="option.id"
                    class="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer"
                    :class="{
                      'border-primary bg-primary/5':
                        getSelectedMeal(meal.id)?.dessertOptionId === option.id,
                    }"
                  >
                    <RadioGroupItem
                      :value="option.id"
                      :id="`dessert-${option.id}`"
                      class="mt-0.5"
                    />
                    <div class="grid gap-1 font-normal flex-1">
                      <Label
                        :for="`dessert-${option.id}`"
                        class="text-sm leading-none font-medium cursor-pointer"
                      >
                        {{ option.name }}
                      </Label>
                      <div
                        v-if="option.hasAllergens && option.allergens?.length"
                        class="flex items-center gap-1"
                      >
                        <Icon
                          name="lucide:alert-triangle"
                          class="h-3 w-3 text-amber-500"
                        />
                        <span
                          class="text-xs text-amber-600 dark:text-amber-400"
                        >
                          {{ formatAllergens(option.allergens) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <!-- No options message -->
              <p
                v-if="!meal.options?.length"
                class="text-sm text-muted-foreground"
              >
                Pas d'options disponibles pour ce repas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
