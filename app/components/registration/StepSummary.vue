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

  // Meal prices
  for (const selectedMeal of props.selectedMeals) {
    const meal = props.meals.find((m) => m.id === selectedMeal.mealId);
    if (meal) {
      total += Number(meal.price) || 0;
    }
  }

  // Activity prices
  for (const activityId of props.selectedActivities) {
    const activity = props.activities.find((a) => a.id === activityId);
    if (activity) {
      total += Number(activity.price) || 0;
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <Icon name="lucide:clipboard-check" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Récapitulatif</h2>
          <p class="text-sm text-muted-foreground">
            Vérifiez vos informations avant de confirmer
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Personal Info Summary -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
          >
            <Icon name="lucide:user" class="h-3.5 w-3.5 text-primary" />
          </div>
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              Nom complet
            </p>
            <p class="font-medium">
              {{ personalInfo.firstName }} {{ personalInfo.lastName }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              Email
            </p>
            <p class="font-medium">{{ personalInfo.email }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              Téléphone
            </p>
            <p class="font-medium">{{ personalInfo.phone }}</p>
          </div>
          <div v-if="personalInfo.iutId" class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              IUT d'origine
            </p>
            <p class="font-medium">
              {{ getIutById(personalInfo.iutId)?.name || "Non spécifié" }}
            </p>
          </div>
          <div v-if="personalInfo.allergens" class="col-span-2 space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              Allergies alimentaires
            </p>
            <div
              class="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 w-fit"
            >
              <Icon
                name="lucide:alert-triangle"
                class="h-3.5 w-3.5 text-amber-500"
              />
              <span class="text-sm font-medium text-amber-700 dark:text-amber-400">
                {{ personalInfo.allergens }}
              </span>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-wider">
              Motorisé
            </p>
            <Badge :variant="personalInfo.isMotorized ? 'default' : 'outline'">
              <Icon
                :name="personalInfo.isMotorized ? 'lucide:car' : 'lucide:x'"
                class="h-3 w-3 mr-1"
              />
              {{ personalInfo.isMotorized ? "Oui" : "Non" }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Meals Summary -->
    <Card v-if="selectedMeals.length">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
          >
            <Icon name="lucide:utensils" class="h-3.5 w-3.5 text-primary" />
          </div>
          Repas sélectionnés
          <Badge variant="secondary" class="ml-auto tabular-nums">
            {{ selectedMeals.length }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-0 divide-y">
        <div
          v-for="selectedMeal in selectedMeals"
          :key="selectedMeal.mealId"
          class="flex items-start justify-between py-3 first:pt-0 last:pb-0"
        >
          <div class="space-y-1.5">
            <p class="font-medium text-sm">
              {{ getMealById(selectedMeal.mealId)?.name }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(getMealById(selectedMeal.mealId)?.date || "") }}
            </p>
            <div
              v-if="getMealById(selectedMeal.mealId)"
              class="flex flex-wrap gap-1.5 mt-1"
            >
              <Badge
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.starterOptionId,
                  )
                "
                variant="outline"
                class="text-xs font-normal"
              >
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.starterOptionId,
                  )
                }}
              </Badge>
              <Badge
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.mainOptionId,
                  )
                "
                variant="outline"
                class="text-xs font-normal"
              >
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.mainOptionId,
                  )
                }}
              </Badge>
              <Badge
                v-if="
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.dessertOptionId,
                  )
                "
                variant="outline"
                class="text-xs font-normal"
              >
                {{
                  getOptionName(
                    getMealById(selectedMeal.mealId)!,
                    selectedMeal.dessertOptionId,
                  )
                }}
              </Badge>
            </div>
          </div>
          <Badge variant="secondary" class="tabular-nums shrink-0">
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
        <CardTitle class="text-base flex items-center gap-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
          >
            <Icon name="lucide:activity" class="h-3.5 w-3.5 text-primary" />
          </div>
          Activités sélectionnées
          <Badge variant="secondary" class="ml-auto tabular-nums">
            {{ selectedActivities.length }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-0 divide-y">
          <div
            v-for="activityId in selectedActivities"
            :key="activityId"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-2">
              <Icon name="lucide:check" class="h-3 w-3 text-primary shrink-0" />
              <span class="text-sm font-medium">{{ getActivityById(activityId)?.name }}</span>
            </div>
            <Badge v-if="Number(getActivityById(activityId)?.price || 0) > 0" variant="secondary" class="tabular-nums shrink-0">
              {{ Number(getActivityById(activityId)?.price || 0).toFixed(2) }} €
            </Badge>
            <span v-else class="text-xs text-muted-foreground">Gratuit</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total -->
    <Card class="bg-primary/5 border-primary/20 overflow-hidden">
      <CardContent class="pt-6 relative">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-sm font-medium text-muted-foreground">
              Total à payer
            </span>
            <p
              v-if="totalPrice === 0"
              class="text-xs text-muted-foreground"
            >
              Aucun repas sélectionné
            </p>
          </div>
          <span class="text-3xl font-bold tabular-nums">
            {{ totalPrice.toFixed(2) }} €
          </span>
        </div>
      </CardContent>
    </Card>

    <!-- Submit Button -->
    <Button
      size="lg"
      class="w-full rounded-xl h-12 text-base font-semibold"
      :disabled="isSubmitting"
      @click="emit('submit')"
    >
      <Icon
        v-if="isSubmitting"
        name="lucide:loader-2"
        class="mr-2 h-5 w-5 animate-spin"
      />
      <Icon v-else name="lucide:check-circle" class="mr-2 h-5 w-5" />
      {{ isSubmitting ? "Inscription en cours..." : "Confirmer l'inscription" }}
    </Button>
  </div>
</template>
