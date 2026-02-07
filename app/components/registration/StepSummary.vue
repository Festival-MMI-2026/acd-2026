<script setup lang="ts">
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iutId: string;
  allergens: string;
  isMotorized: boolean;
}

interface SelectedMeal {
  mealId: string;
  starterOptionId?: string;
  mainOptionId?: string;
  dessertOptionId?: string;
}

interface Meal {
  id: string;
  name: string;
  date: string;
  price: number;
  options: {
    id: string;
    name: string;
    optionType: string;
    additionalPrice?: number;
  }[];
}

interface Activity {
  id: string;
  name: string;
  date: string;
  price?: number;
}

interface Iut {
  id: string;
  name: string;
  city?: string;
}

const props = defineProps<{
  personalInfo: PersonalInfo;
  selectedMeals: SelectedMeal[];
  selectedActivities: string[];
  meals: Meal[];
  activities: Activity[];
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  submit: [];
}>();

// Fetch IUTs for display
const { data: iuts } = useLazyFetch<Iut[]>("/api/iuts");

// Calculate total price
const totalPrice = computed(() => {
  let total = 0;

  for (const selectedMeal of props.selectedMeals) {
    const meal = props.meals.find((m) => m.id === selectedMeal.mealId);
    if (meal) {
      total += Number(meal.price) || 0;

      // Add option prices
      for (const optionId of [
        selectedMeal.starterOptionId,
        selectedMeal.mainOptionId,
        selectedMeal.dessertOptionId,
      ]) {
        if (optionId) {
          const option = meal.options?.find((o) => o.id === optionId);
          if (option?.additionalPrice) {
            total += Number(option.additionalPrice);
          }
        }
      }
    }
  }

  return total;
});

function getMealById(id: string) {
  return props.meals.find((m) => m.id === id);
}

function getActivityById(id: string) {
  return props.activities.find((a) => a.id === id);
}

function getIutById(id: string) {
  return iuts.value?.find((i) => i.id === id);
}

function getOptionName(meal: Meal, optionId?: string) {
  if (!optionId) return null;
  return meal.options?.find((o) => o.id === optionId)?.name;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Récapitulatif</h2>
      <p class="text-muted-foreground">
        Vérifiez vos informations avant de confirmer
      </p>
    </div>

    <!-- Personal Info Summary -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center gap-2">
          <Icon name="lucide:user" class="h-4 w-4" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-muted-foreground">Nom complet</p>
          <p class="font-medium">
            {{ personalInfo.firstName }} {{ personalInfo.lastName }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground">Email</p>
          <p class="font-medium">{{ personalInfo.email }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Téléphone</p>
          <p class="font-medium">{{ personalInfo.phone }}</p>
        </div>
        <div v-if="personalInfo.iutId">
          <p class="text-muted-foreground">IUT d'origine</p>
          <p class="font-medium">
            {{ getIutById(personalInfo.iutId)?.name || "Non spécifié" }}
          </p>
        </div>
        <div v-if="personalInfo.allergens" class="col-span-2">
          <p class="text-muted-foreground">Allergies alimentaires</p>
          <p class="font-medium text-amber-600 dark:text-amber-400">
            <Icon name="lucide:alert-triangle" class="inline h-3 w-3 mr-1" />
            {{ personalInfo.allergens }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground">Motorisé</p>
          <p class="font-medium">
            {{ personalInfo.isMotorized ? "Oui" : "Non" }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Meals Summary -->
    <Card v-if="selectedMeals.length">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center gap-2">
          <Icon name="lucide:utensils" class="h-4 w-4" />
          Repas sélectionnés ({{ selectedMeals.length }})
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="selectedMeal in selectedMeals"
          :key="selectedMeal.mealId"
          class="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0"
        >
          <div>
            <p class="font-medium">
              {{ getMealById(selectedMeal.mealId)?.name }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(getMealById(selectedMeal.mealId)?.date || "") }}
            </p>
            <div
              v-if="getMealById(selectedMeal.mealId)"
              class="text-sm text-muted-foreground mt-1 space-y-0.5"
            >
              <p
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.starterOptionId,
                  )
                "
              >
                Entrée:
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.starterOptionId,
                  )
                }}
              </p>
              <p
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.mainOptionId,
                  )
                "
              >
                Plat:
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.mainOptionId,
                  )
                }}
              </p>
              <p
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.dessertOptionId,
                  )
                "
              >
                Dessert:
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.dessertOptionId,
                  )
                }}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {{
              Number(getMealById(selectedMeal.mealId)?.price || 0).toFixed(2)
            }}
            €
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Activities Summary -->
    <Card v-if="selectedActivities.length">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center gap-2">
          <Icon name="lucide:activity" class="h-4 w-4" />
          Activités sélectionnées ({{ selectedActivities.length }})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="activityId in selectedActivities"
            :key="activityId"
            variant="outline"
          >
            {{ getActivityById(activityId)?.name }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Total -->
    <Card class="bg-primary/5 border-primary/20">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">Total à payer</span>
          <span class="text-3xl font-bold">{{ totalPrice.toFixed(2) }} €</span>
        </div>
        <p v-if="totalPrice === 0" class="text-sm text-muted-foreground mt-2">
          Aucun repas sélectionné
        </p>
      </CardContent>
    </Card>

    <!-- Submit Button -->
    <Button
      size="lg"
      class="w-full"
      :disabled="isSubmitting"
      @click="emit('submit')"
    >
      <Icon
        v-if="isSubmitting"
        name="lucide:loader-2"
        class="mr-2 h-4 w-4 animate-spin"
      />
      {{ isSubmitting ? "Inscription en cours..." : "Confirmer l'inscription" }}
    </Button>
  </div>
</template>
