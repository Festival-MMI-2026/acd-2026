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
const totalSteps = 4;

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

// Submission state
const isSubmitting = ref(false);

// Steps definition
const steps = [
  { step: 1, title: "Informations", icon: "lucide:user" },
  { step: 2, title: "Repas", icon: "lucide:utensils" },
  { step: 3, title: "Activités", icon: "lucide:activity" },
  { step: 4, title: "Confirmation", icon: "lucide:check" },
];

// Validate current step before allowing next
function validateCurrentStep(): boolean {
  switch (currentStep.value) {
    case 1:
      if (
        !personalInfo.value.firstName ||
        !personalInfo.value.lastName ||
        !personalInfo.value.email ||
        !personalInfo.value.phone
      ) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return false;
      }
      return true;
    case 2:
    case 3:
      return true;
    default:
      return true;
  }
}

function nextStep() {
  if (validateCurrentStep() && currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Calculate total price
function calculateTotalPrice(): number {
  let total = 0;

  console.log("Calculating price for meals:", selectedMeals.value);
  console.log("Available meals:", meals.value);

  for (const selectedMeal of selectedMeals.value) {
    const meal = meals.value?.find((m) => m.id === selectedMeal.mealId);
    if (meal) {
      total += Number(meal.price) || 0;
      console.log(
        `Added meal ${meal.name}: ${meal.price}€, total now: ${total}`,
      );

      // Add option prices
      for (const optionId of [
        selectedMeal.starterOptionId,
        selectedMeal.mainOptionId,
        selectedMeal.dessertOptionId,
      ]) {
        if (optionId) {
          const option = meal.options?.find((o: any) => o.id === optionId);
          if (option?.additionalPrice) {
            total += Number(option.additionalPrice);
          }
        }
      }
    }
  }

  console.log("Final total:", total);
  return total;
}

// Submit registration
async function submitRegistration() {
  isSubmitting.value = true;

  try {
    const totalPrice = calculateTotalPrice();

    console.log("Submitting with:", {
      personalInfo: personalInfo.value,
      selectedMeals: selectedMeals.value,
      selectedActivities: selectedActivities.value,
      totalPrice,
    });

    await $fetch("/api/registrations", {
      method: "POST",
      body: {
        ...personalInfo.value,
        totalPrice,
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
    <div
      v-if="siteSettings && !siteSettings.showInscription"
      class="text-center py-24 space-y-6"
    >
      <div
        class="bg-muted/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto"
      >
        <Icon
          name="lucide:clock"
          class="h-10 w-10 text-muted-foreground"
        />
      </div>
      <h2 class="text-2xl font-bold tracking-tight">Bientôt disponible</h2>
      <p class="text-muted-foreground max-w-md mx-auto">
        Les inscriptions seront bientôt ouvertes. Revenez prochainement !
      </p>
      <Button variant="outline" class="rounded-full" as-child>
        <NuxtLink to="/">Retour à l'accueil</NuxtLink>
      </Button>
    </div>

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
              <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
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
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- Stepper Navigation -->
        <ClientOnly>
          <Card class="border-border/50 bg-muted/30">
            <CardContent class="py-5">
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
                    <StepperTitle class="text-xs font-medium hidden sm:block">
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
        <Card class="overflow-hidden">
          <CardContent class="pt-8 pb-6">
            <!-- Step 1: Personal Info -->
            <RegistrationStepPersonalInfo
              v-if="currentStep === 1"
              v-model="personalInfo"
            />

            <!-- Step 2: Meals - pass meals data as prop -->
            <RegistrationStepMeals
              v-if="currentStep === 2"
              v-model="selectedMeals"
              :meals-data="meals"
            />

            <!-- Step 3: Activities - pass activities data as prop -->
            <RegistrationStepActivities
              v-if="currentStep === 3"
              v-model="selectedActivities"
              :activities-data="activities"
            />

            <!-- Step 4: Summary -->
            <RegistrationStepSummary
              v-if="currentStep === 4"
              :personal-info="personalInfo"
              :selected-meals="selectedMeals"
              :selected-activities="selectedActivities"
              :meals="meals || []"
              :activities="activities || []"
              :is-submitting="isSubmitting"
              @submit="submitRegistration"
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
            <div v-else class="w-[100px]"></div>
          </CardFooter>
        </Card>
      </div>
    </template>
    </template>
  </div>
</template>
