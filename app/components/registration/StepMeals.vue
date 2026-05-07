<script setup lang="ts">
import type { Meal, MealOption, SelectedMeal } from "~/types/registration";

const props = defineProps<{
  modelValue: SelectedMeal[];
  mealsData?: Meal[] | null;
  showErrors?: boolean;
}>();

function isMealOptionMissing(mealId: string, optionType: "STARTER" | "MAIN" | "CHEESE" | "DESSERT"): boolean {
  if (!props.showErrors) return false;
  const meal = meals.value.find((m) => m.id === mealId);
  if (!meal) return false;
  const hasType = getOptionsByType(meal, optionType).length > 0;
  if (!hasType) return false;
  const sm = getSelectedMeal(mealId);
  const key =
    optionType === "STARTER"
      ? "starterOptionId"
      : optionType === "MAIN"
        ? "mainOptionId"
        : optionType === "CHEESE"
          ? "cheeseOptionId"
          : "dessertOptionId";
  return !sm?.[key];
}

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
  if (isMealSelected(mealId)) {
    emit(
      "update:modelValue",
      props.modelValue.filter((m) => m.mealId !== mealId),
    );
  } else {
    emit("update:modelValue", [...props.modelValue, { mealId }]);
  }
}

function updateMealOption(
  mealId: string,
  optionType: "starterOptionId" | "mainOptionId" | "cheeseOptionId" | "dessertOptionId",
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
  type: "STARTER" | "MAIN" | "CHEESE" | "DESSERT",
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

const totalSelected = computed(() => props.modelValue.length);
</script>

<template>
  <div class="space-y-5">
    <!-- Header compact -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sélectionnez vos repas *
      </p>
      <Badge v-if="totalSelected > 0" variant="secondary" class="tabular-nums text-xs">
        {{ totalSelected }} sélectionné{{ totalSelected > 1 ? "s" : "" }}
      </Badge>
    </div>

    <p v-if="showErrors && totalSelected === 0" class="text-sm text-destructive flex items-center gap-1.5">
      <Icon name="lucide:circle-alert" class="h-3.5 w-3.5 shrink-0" />
      Veuillez sélectionner au moins un repas
    </p>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
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

              <!-- Description -->
              <p
                v-if="meal.description"
                class="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
              >
                {{ meal.description }}
              </p>

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
                <p v-if="getOptionsByType(meal, 'CHEESE').length" class="flex items-center gap-1.5">
                  <span class="font-medium text-foreground/70">Fromages</span>
                  <span class="text-xs">
                    {{
                      getOptionsByType(meal, "CHEESE")
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
                class="flex flex-wrap gap-1"
              >
                <span
                  v-for="allergen in getAllAllergens(meal)"
                  :key="allergen"
                  class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium"
                  :class="getAllergenInfo(allergen).badgeClass"
                >
                  <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                  {{ getAllergenInfo(allergen).label }}
                </span>
              </div>
            </div>
          </Label>

          <!-- Options selection (show when selected and meal has options) -->
          <Card
            v-if="isMealSelected(meal.id) && meal.options?.length"
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
                        class="flex flex-wrap gap-1 mt-0.5"
                      >
                        <span
                          v-for="allergen in option.allergens"
                          :key="allergen"
                          class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium"
                          :class="getAllergenInfo(allergen).badgeClass"
                        >
                          <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                          {{ getAllergenInfo(allergen).label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <p v-if="isMealOptionMissing(meal.id, 'STARTER')" class="text-xs text-destructive flex items-center gap-1">
                  <Icon name="lucide:circle-alert" class="h-3 w-3 shrink-0" />
                  Veuillez choisir une entrée
                </p>
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
                        class="flex flex-wrap gap-1 mt-0.5"
                      >
                        <span
                          v-for="allergen in option.allergens"
                          :key="allergen"
                          class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium"
                          :class="getAllergenInfo(allergen).badgeClass"
                        >
                          <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                          {{ getAllergenInfo(allergen).label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <p v-if="isMealOptionMissing(meal.id, 'MAIN')" class="text-xs text-destructive flex items-center gap-1">
                  <Icon name="lucide:circle-alert" class="h-3 w-3 shrink-0" />
                  Veuillez choisir un plat principal
                </p>
              </div>

              <!-- Cheeses -->
              <div
                v-if="getOptionsByType(meal, 'CHEESE').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium flex items-center gap-1.5">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >3</span
                  >
                  Fromage
                </Label>
                <RadioGroup
                  :model-value="getSelectedMeal(meal.id)?.cheeseOptionId"
                  @update:model-value="
                    updateMealOption(meal.id, 'cheeseOptionId', String($event))
                  "
                  class="space-y-2"
                >
                  <div
                    v-for="option in getOptionsByType(meal, 'CHEESE')"
                    :key="option.id"
                    class="flex items-start gap-3 rounded-xl border p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                    :class="{
                      'border-primary bg-primary/5 shadow-sm':
                        getSelectedMeal(meal.id)?.cheeseOptionId === option.id,
                    }"
                  >
                    <RadioGroupItem
                      :value="option.id"
                      :id="`cheese-${option.id}`"
                      class="mt-0.5"
                    />
                    <div class="grid gap-1 font-normal flex-1">
                      <Label
                        :for="`cheese-${option.id}`"
                        class="text-sm leading-none font-medium cursor-pointer"
                      >
                        {{ option.name }}
                      </Label>
                      <div
                        v-if="option.hasAllergens && option.allergens?.length"
                        class="flex flex-wrap gap-1 mt-0.5"
                      >
                        <span
                          v-for="allergen in option.allergens"
                          :key="allergen"
                          class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium"
                          :class="getAllergenInfo(allergen).badgeClass"
                        >
                          <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                          {{ getAllergenInfo(allergen).label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <p v-if="isMealOptionMissing(meal.id, 'CHEESE')" class="text-xs text-destructive flex items-center gap-1">
                  <Icon name="lucide:circle-alert" class="h-3 w-3 shrink-0" />
                  Veuillez choisir un fromage
                </p>
              </div>

              <!-- Desserts -->
              <div
                v-if="getOptionsByType(meal, 'DESSERT').length"
                class="space-y-3"
              >
                <Label class="text-sm font-medium flex items-center gap-1.5">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-semibold"
                    >4</span
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
                        class="flex flex-wrap gap-1 mt-0.5"
                      >
                        <span
                          v-for="allergen in option.allergens"
                          :key="allergen"
                          class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium"
                          :class="getAllergenInfo(allergen).badgeClass"
                        >
                          <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                          {{ getAllergenInfo(allergen).label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <p v-if="isMealOptionMissing(meal.id, 'DESSERT')" class="text-xs text-destructive flex items-center gap-1">
                  <Icon name="lucide:circle-alert" class="h-3 w-3 shrink-0" />
                  Veuillez choisir un dessert
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
