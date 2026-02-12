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

function getMealTypeIcon(type: string) {
  return type === "LUNCH" ? "lucide:sun" : "lucide:moon";
}

function formatAllergens(allergens: string[]): string {
  return allergens.join(", ");
}

const totalSelected = computed(() => props.modelValue.length);
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <Icon name="lucide:utensils" class="h-5 w-5 text-primary" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold tracking-tight">Choix des repas</h2>
            <Badge
              v-if="totalSelected > 0"
              variant="secondary"
              class="tabular-nums"
            >
              {{ totalSelected }} sélectionné{{ totalSelected > 1 ? "s" : "" }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            Sélectionnez les repas et choisissez vos options
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-xl" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty state -->
      <Card v-if="!meals?.length" class="border-dashed">
        <CardContent class="flex flex-col items-center justify-center py-12">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
          >
            <Icon
              name="lucide:utensils"
              class="h-7 w-7 text-muted-foreground"
            />
          </div>
          <p class="font-medium text-muted-foreground">
            Aucun repas disponible pour le moment
          </p>
          <p class="mt-1 text-sm text-muted-foreground/70">
            Vous pouvez passer à l'étape suivante
          </p>
        </CardContent>
      </Card>

      <!-- Meals list -->
      <div v-else class="space-y-6">
        <div v-for="meal in meals" :key="meal.id" class="space-y-3">
          <!-- Meal checkbox card -->
          <Label
            class="group hover:bg-accent/50 flex items-start gap-3 rounded-xl border p-5 cursor-pointer transition-all duration-200 has-aria-checked:border-primary has-aria-checked:bg-primary/5 has-aria-checked:shadow-sm dark:has-aria-checked:bg-primary/10"
          >
            <Checkbox
              :id="`meal-${meal.id}`"
              :model-value="isMealSelected(meal.id)"
              class="mt-1 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              @update:model-value="toggleMeal(meal.id)"
            />
            <div class="grid gap-3 font-normal flex-1">
              <!-- Header -->
              <div class="flex items-center justify-between gap-2">
                <p class="text-base leading-none font-semibold">
                  {{ meal.name }}
                </p>
                <Badge class="tabular-nums shrink-0">
                  {{ Number(meal.price).toFixed(2) }} €
                </Badge>
              </div>

              <!-- Date and type -->
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant="outline" class="text-xs font-normal gap-1">
                  <Icon name="lucide:calendar" class="h-3 w-3" />
                  {{ formatDate(meal.date) }}
                </Badge>
                <Badge variant="outline" class="text-xs font-normal gap-1">
                  <Icon :name="getMealTypeIcon(meal.mealType)" class="h-3 w-3" />
                  {{ getMealTypeLabel(meal.mealType) }}
                </Badge>
              </div>

              <!-- Menu preview -->
              <div
                v-if="meal.options?.length"
                class="grid gap-1.5 pt-2 border-t text-sm text-muted-foreground"
              >
                <p v-if="getOptionsByType(meal, 'STARTER').length" class="flex items-center gap-1.5">
                  <span class="font-medium text-foreground/70">Entrées</span>
                  <span class="text-xs">
                    {{
                      getOptionsByType(meal, "STARTER")
                        .map((o) => o.name)
                        .join(" · ")
                    }}
                  </span>
                </p>
                <p v-if="getOptionsByType(meal, 'MAIN').length" class="flex items-center gap-1.5">
                  <span class="font-medium text-foreground/70">Plats</span>
                  <span class="text-xs">
                    {{
                      getOptionsByType(meal, "MAIN")
                        .map((o) => o.name)
                        .join(" · ")
                    }}
                  </span>
                </p>
                <p v-if="getOptionsByType(meal, 'DESSERT').length" class="flex items-center gap-1.5">
                  <span class="font-medium text-foreground/70">Desserts</span>
                  <span class="text-xs">
                    {{
                      getOptionsByType(meal, "DESSERT")
                        .map((o) => o.name)
                        .join(" · ")
                    }}
                  </span>
                </p>
              </div>

              <!-- Allergens -->
              <div
                v-if="getAllAllergens(meal).length"
                class="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 w-fit"
              >
                <Icon
                  name="lucide:alert-triangle"
                  class="h-3.5 w-3.5 text-amber-500"
                />
                <span class="text-xs text-amber-700 dark:text-amber-400">
                  {{ formatAllergens(getAllAllergens(meal)) }}
                </span>
              </div>
            </div>
          </Label>

          <!-- Options selection (show when selected) -->
          <Card
            v-if="isMealSelected(meal.id)"
            class="ml-8 border-primary/20 bg-primary/2"
          >
            <CardHeader class="pb-3">
              <CardTitle class="text-base flex items-center gap-2">
                <Icon name="lucide:chef-hat" class="h-4 w-4 text-primary" />
                Faites vos choix
              </CardTitle>
              <CardDescription>
                Sélectionnez vos options pour chaque service
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-5">
              <!-- Starters -->
              <div
                v-if="getOptionsByType(meal, 'STARTER').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium flex items-center gap-1.5">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >1</span
                  >
                  Entrée
                </Label>
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
                    class="flex items-start gap-3 rounded-xl border p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                    :class="{
                      'border-primary bg-primary/5 shadow-sm':
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
                <Label class="text-sm font-medium flex items-center gap-1.5">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >2</span
                  >
                  Plat principal
                </Label>
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
                    class="flex items-start gap-3 rounded-xl border p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                    :class="{
                      'border-primary bg-primary/5 shadow-sm':
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
                <Label class="text-sm font-medium flex items-center gap-1.5">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >3</span
                  >
                  Dessert
                </Label>
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
                    class="flex items-start gap-3 rounded-xl border p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                    :class="{
                      'border-primary bg-primary/5 shadow-sm':
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
                class="text-sm text-muted-foreground text-center py-4"
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
