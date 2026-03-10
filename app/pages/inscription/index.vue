<script setup lang="ts">
import { toast } from "vue-sonner";
import { useSession } from "~/lib/auth-client";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from "@/components/ui/stepper";

definePageMeta({
  layout: "default",
});

// Fetch editable content from DB
const { data: pageContent } = await useFetch("/api/inscription-content");
const { data: siteSettings } = await useFetch("/api/settings");

const session = useSession();
const router = useRouter();

// Check if user is authenticated
const isAuthenticated = computed(() => !!session.value?.data?.user);

// Stepper state
const currentStep = ref(1);
const totalSteps = 3;

// Form data
const personalInfo = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  iutId: "",
  allergens: "",
  isMotorized: false,
});

interface SelectedMeal {
  mealId: string;
  starterOptionId?: string;
  mainOptionId?: string;
  dessertOptionId?: string;
}

const selectedMeals = ref<SelectedMeal[]>([]);
const selectedActivities = ref<string[]>([]);

// Fetch data - use regular useFetch to ensure data is available
const { data: meals } = await useFetch<any[]>("/api/meals");
const { data: activities } = await useFetch<any[]>("/api/activities");
const { data: iuts } =
  useLazyFetch<{ id: string; name: string; city?: string }[]>("/api/iuts");

// Submission state
const isSubmitting = ref(false);

// Validation
const showValidationErrors = ref(false);

watch(currentStep, () => {
  showValidationErrors.value = false;
});

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return !!(
      personalInfo.value.firstName &&
      personalInfo.value.lastName &&
      personalInfo.value.email &&
      personalInfo.value.phone &&
      personalInfo.value.iutId
    );
  }
  if (currentStep.value === 2) {
    if (selectedMeals.value.length === 0) return false;
    for (const sm of selectedMeals.value) {
      const meal = meals.value?.find((m) => m.id === sm.mealId);
      if (!meal) continue;
      const hasStarters = meal.options?.some((o: any) => o.optionType === "STARTER");
      const hasMains = meal.options?.some((o: any) => o.optionType === "MAIN");
      const hasDesserts = meal.options?.some((o: any) => o.optionType === "DESSERT");
      if (hasStarters && !sm.starterOptionId) return false;
      if (hasMains && !sm.mainOptionId) return false;
      if (hasDesserts && !sm.dessertOptionId) return false;
    }
    return true;
  }
  if (currentStep.value === 3) {
    return selectedActivities.value.length > 0;
  }
  return true;
});

// Steps definition
const steps = [
  { step: 1, title: "Informations", icon: "lucide:user" },
  { step: 2, title: "Repas", icon: "lucide:utensils" },
  { step: 3, title: "Activités", icon: "lucide:activity" },
];

function nextStep() {
  if (!isCurrentStepValid.value) {
    showValidationErrors.value = true;
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Helper functions for summary panel
function getMealById(id: string) {
  return meals.value?.find((m) => m.id === id);
}

function getActivityById(id: string) {
  return activities.value?.find((a) => a.id === id);
}

function getIutName(id: string) {
  return iuts.value?.find((i) => i.id === id)?.name;
}

function getOptionName(meal: any, optionId?: string) {
  if (!optionId) return null;
  return meal.options?.find((o: any) => o.id === optionId)?.name;
}

// Calculate total price (computed for reactivity)
const totalPrice = computed(() => {
  let total = 0;
  // Meal prices
  for (const selectedMeal of selectedMeals.value) {
    const meal = meals.value?.find((m) => m.id === selectedMeal.mealId);
    if (meal) {
      total += Number(meal.price) || 0;
    }
  }
  // Activity prices
  for (const activityId of selectedActivities.value) {
    const activity = activities.value?.find((a) => a.id === activityId);
    if (activity) {
      total += Number(activity.price) || 0;
    }
  }
  return total;
});

// Summary completeness helpers
const hasPersonalInfo = computed(
  () => !!(personalInfo.value.firstName || personalInfo.value.email),
);

// Submit registration
async function submitRegistration() {
  if (!isCurrentStepValid.value) {
    showValidationErrors.value = true;
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/registrations", {
      method: "POST",
      body: {
        ...personalInfo.value,
        totalPrice: totalPrice.value,
        meals: selectedMeals.value,
        activities: selectedActivities.value,
      },
    });

    toast.success("Inscription réussie !");
    router.push("/inscription/confirmation");
  } catch (error: any) {
    console.error("Registration error:", error);
    toast.error(error.data?.statusMessage || "Erreur lors de l'inscription");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto px-6 py-24 space-y-12">
    <!-- Hidden page state -->
    <Empty v-if="siteSettings && !siteSettings.showInscription" class="py-24">
      <EmptyMedia variant="icon">
        <Icon name="lucide:clock" class="size-5" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Bientôt disponible</EmptyTitle>
        <EmptyDescription>
          Les inscriptions seront bientôt ouvertes. Revenez prochainement !
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" class="rounded-full" as-child>
          <NuxtLink to="/">Retour à l'accueil</NuxtLink>
        </Button>
      </EmptyContent>
    </Empty>

    <template v-else>
      <!-- Header -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
          {{ pageContent?.pageTitle }}
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {{ pageContent?.pageSubtitle }}
        </p>
      </div>

      <!-- Not authenticated -->
      <template v-if="!isAuthenticated">
        <div class="max-w-xl mx-auto">
          <Card class="border-border/50">
            <CardContent class="pt-8 pb-6">
              <div class="text-center space-y-6">
                <div
                  class="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                >
                  <Icon name="lucide:lock" class="h-8 w-8 text-primary" />
                </div>
                <div class="space-y-2">
                  <h2 class="text-2xl font-bold">Connexion requise</h2>
                  <p class="text-muted-foreground">
                    Pour vous inscrire à l'événement, vous devez d'abord vous
                    connecter ou créer un compte.
                  </p>
                </div>
                <div
                  class="flex flex-col sm:flex-row gap-3 justify-center pt-2"
                >
                  <Button as-child size="lg" class="rounded-full">
                    <NuxtLink to="/auth/signin">
                      <Icon name="lucide:log-in" class="mr-2 h-4 w-4" />
                      Se connecter
                    </NuxtLink>
                  </Button>
                  <Button
                    variant="outline"
                    as-child
                    size="lg"
                    class="rounded-full"
                  >
                    <NuxtLink to="/auth/signup">
                      <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
                      Créer un compte
                    </NuxtLink>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </template>

      <!-- Authenticated -->
      <template v-else>
        <div
          class="grid lg:grid-cols-[minmax(0,600px)_320px] xl:grid-cols-[minmax(0,640px)_360px] gap-8 items-start justify-center"
        >
          <!-- LEFT: Stepper + Form -->
          <div class="space-y-6 min-w-0">
            <!-- Stepper Navigation -->
            <ClientOnly>
              <Card class="border-border/50 bg-muted/30 p-0">
                <CardContent class="py-2">
                  <Stepper
                    v-model="currentStep"
                    class="flex w-full items-start gap-2"
                  >
                    <StepperItem
                      v-for="(stepItem, index) in steps"
                      :key="stepItem.step"
                      :step="stepItem.step"
                      class="relative flex w-full flex-col items-center justify-center"
                    >
                      <StepperTrigger class="flex flex-col items-center gap-2">
                        <StepperIndicator>
                          <Icon :name="stepItem.icon" class="h-4 w-4" />
                        </StepperIndicator>
                        <StepperTitle
                          class="text-xs font-medium hidden sm:block"
                        >
                          {{ stepItem.title }}
                        </StepperTitle>
                      </StepperTrigger>

                      <StepperSeparator
                        v-if="index < steps.length - 1"
                        class="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 block h-0.5 shrink-0 bg-muted group-data-[state=completed]:bg-primary"
                      />
                    </StepperItem>
                  </Stepper>
                </CardContent>
              </Card>
              <template #fallback>
                <Skeleton class="h-24 w-full rounded-xl" />
              </template>
            </ClientOnly>

            <!-- Form Content -->
            <Card class="overflow-hidden p-0">
              <CardContent class="pt-5 pb-5">
                <!-- Step 1: Personal Info -->
                <RegistrationStepPersonalInfo
                  v-if="currentStep === 1"
                  v-model="personalInfo"
                  :show-errors="showValidationErrors"
                />

                <!-- Step 2: Meals -->
                <RegistrationStepMeals
                  v-if="currentStep === 2"
                  v-model="selectedMeals"
                  :meals-data="meals"
                  :show-errors="showValidationErrors"
                />

                <!-- Step 3: Activities -->
                <RegistrationStepActivities
                  v-if="currentStep === 3"
                  v-model="selectedActivities"
                  :activities-data="activities"
                  :show-errors="showValidationErrors"
                />
              </CardContent>

              <!-- Navigation -->
              <CardFooter
                class="flex items-center justify-between border-t bg-muted/30 px-6 py-4"
              >
                <Button
                  variant="ghost"
                  :disabled="currentStep === 1"
                  @click="prevStep"
                >
                  <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
                  Précédent
                </Button>

                <div class="flex items-center gap-1.5">
                  <div
                    v-for="step in totalSteps"
                    :key="step"
                    class="h-1.5 rounded-full transition-all duration-300"
                    :class="
                      step <= currentStep
                        ? 'w-6 bg-primary'
                        : 'w-1.5 bg-muted-foreground/20'
                    "
                  />
                </div>

                <Button v-if="currentStep < totalSteps" @click="nextStep">
                  Suivant
                  <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
                </Button>
                <Button
                  v-else
                  :disabled="isSubmitting"
                  @click="submitRegistration"
                >
                  <Icon
                    v-if="isSubmitting"
                    name="lucide:loader-2"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  <Icon
                    v-else
                    name="lucide:check-circle"
                    class="mr-2 h-4 w-4"
                  />
                  {{ isSubmitting ? "Inscription en cours..." : "Confirmer" }}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <!-- RIGHT: Sticky Summary Panel -->
          <div class="hidden lg:block sticky top-24">
            <Card class="border-border/50 overflow-hidden py-0">
              <!-- Header -->
              <CardHeader class="bg-muted/30 border-b pt-6">
                <CardTitle class="text-base flex items-center gap-2">
                  <div
                    class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
                  >
                    <Icon
                      name="lucide:clipboard-list"
                      class="h-3.5 w-3.5 text-primary"
                    />
                  </div>
                  Récapitulatif
                </CardTitle>
              </CardHeader>

              <CardContent class="p-0">
                <!-- Empty state -->
                <div
                  v-if="
                    !hasPersonalInfo &&
                    !selectedMeals.length &&
                    !selectedActivities.length
                  "
                  class="flex flex-col items-center justify-center px-6 text-center"
                >
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                  >
                    <Icon
                      name="lucide:file-text"
                      class="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Remplissez le formulaire pour voir votre récapitulatif en
                    temps réel
                  </p>
                </div>

                <!-- Content -->
                <div v-else class="divide-y">
                  <!-- Participant -->
                  <div v-if="hasPersonalInfo" class="px-5 py-4 space-y-2.5">
                    <p
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Participant
                    </p>
                    <div class="space-y-1">
                      <p
                        v-if="personalInfo.firstName || personalInfo.lastName"
                        class="text-sm font-semibold"
                      >
                        {{ personalInfo.firstName }} {{ personalInfo.lastName }}
                      </p>
                      <p
                        v-if="personalInfo.email"
                        class="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <Icon name="lucide:mail" class="h-3 w-3 shrink-0" />
                        {{ personalInfo.email }}
                      </p>
                      <p
                        v-if="personalInfo.phone"
                        class="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <Icon name="lucide:phone" class="h-3 w-3 shrink-0" />
                        {{ personalInfo.phone }}
                      </p>
                      <p
                        v-if="
                          personalInfo.iutId && getIutName(personalInfo.iutId)
                        "
                        class="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <Icon
                          name="lucide:building-2"
                          class="h-3 w-3 shrink-0"
                        />
                        {{ getIutName(personalInfo.iutId) }}
                      </p>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        <Badge
                          v-if="personalInfo.isMotorized"
                          variant="outline"
                          class="text-xs gap-1 font-normal"
                        >
                          <Icon name="lucide:car" class="h-3 w-3" />
                          Motorisé
                        </Badge>
                        <Badge
                          v-if="personalInfo.allergens"
                          variant="outline"
                          class="text-xs gap-1 font-normal text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
                        >
                          <Icon name="lucide:wheat" class="h-3 w-3" />
                          Allergies
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <!-- Repas -->
                  <div
                    v-if="selectedMeals.length > 0"
                    class="px-5 py-4 space-y-2.5"
                  >
                    <p
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                    >
                      Repas
                      <Badge
                        variant="secondary"
                        class="text-xs tabular-nums font-normal"
                      >
                        {{ selectedMeals.length }}
                      </Badge>
                    </p>
                    <div class="space-y-2">
                      <div
                        v-for="sm in selectedMeals"
                        :key="sm.mealId"
                        class="flex items-start justify-between gap-2"
                      >
                        <div class="min-w-0 space-y-0.5">
                          <p class="text-xs font-medium leading-tight truncate">
                            {{ getMealById(sm.mealId)?.name }}
                          </p>
                          <div
                            v-if="getMealById(sm.mealId)"
                            class="flex flex-wrap gap-1"
                          >
                            <span
                              v-if="
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.starterOptionId,
                                )
                              "
                              class="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5"
                            >
                              {{
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.starterOptionId,
                                )
                              }}
                            </span>
                            <span
                              v-if="
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.mainOptionId,
                                )
                              "
                              class="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5"
                            >
                              {{
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.mainOptionId,
                                )
                              }}
                            </span>
                            <span
                              v-if="
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.dessertOptionId,
                                )
                              "
                              class="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5"
                            >
                              {{
                                getOptionName(
                                  getMealById(sm.mealId),
                                  sm.dessertOptionId,
                                )
                              }}
                            </span>
                          </div>
                        </div>
                        <span
                          class="text-xs font-semibold tabular-nums shrink-0 text-foreground"
                        >
                          {{
                            Number(getMealById(sm.mealId)?.price || 0).toFixed(
                              2,
                            )
                          }}
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Activités -->
                  <div
                    v-if="selectedActivities.length > 0"
                    class="px-5 py-4 space-y-2.5"
                  >
                    <p
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                    >
                      Activités
                      <Badge
                        variant="secondary"
                        class="text-xs tabular-nums font-normal"
                      >
                        {{ selectedActivities.length }}
                      </Badge>
                    </p>
                    <div class="space-y-2">
                      <div
                        v-for="id in selectedActivities"
                        :key="id"
                        class="flex items-start justify-between gap-2"
                      >
                        <div class="min-w-0">
                          <p class="text-xs font-medium leading-tight truncate">
                            {{ getActivityById(id)?.name }}
                          </p>
                        </div>
                        <span
                          v-if="Number(getActivityById(id)?.price || 0) > 0"
                          class="text-xs font-semibold tabular-nums shrink-0 text-foreground"
                        >
                          {{
                            Number(getActivityById(id)?.price || 0).toFixed(2)
                          }}
                          €
                        </span>
                        <span
                          v-else
                          class="text-xs text-muted-foreground shrink-0"
                        >
                          Gratuit
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="px-5 py-4 bg-primary/5">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Total à payer</span>
                      <span class="text-2xl font-bold tabular-nums">
                        {{ totalPrice.toFixed(2) }} €
                      </span>
                    </div>
                    <p
                      v-if="totalPrice === 0"
                      class="text-xs text-muted-foreground mt-1"
                    >
                      Aucun repas ou activité payante sélectionné
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
