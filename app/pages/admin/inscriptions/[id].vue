<script setup lang="ts">
import { toast } from "vue-sonner";
import type { Activity, Meal } from "~/types/registration";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iutId?: string | null;
  allergens?: string | null;
  isMotorized: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  noPork?: boolean;
  noAlcohol?: boolean;
  totalPrice: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  meals?: any[];
  activities?: any[];
}

interface Iut {
  id: string;
  name: string;
  city?: string | null;
}

const { data: registration, refresh } = await useFetch<Registration>(
  `/api/registrations/${route.params.id}`,
);

const { data: iuts } = useLazyFetch<Iut[]>("/api/iuts");
const { data: mealsCatalog } = useLazyFetch<Meal[]>("/api/meals");
const { data: activitiesCatalog } = useLazyFetch<Activity[]>("/api/activities");

// Edit mode
const isEditing = ref(false);
const isSaving = ref(false);
const editShowErrors = ref(false);
const editForm = reactive({
  allergens: "",
  isVegetarian: false,
  isVegan: false,
  noPork: false,
  noAlcohol: false,
});
const {
  selectedMeals: editMeals,
  selectedActivities: editActivities,
  totalPrice: editTotal,
  mealsValid: isEditMealsValid,
  activitiesValid: isEditActivitiesValid,
  hydrate: hydrateEditSelection,
} = useRegistrationForm(mealsCatalog, activitiesCatalog);

function hydrateEditFromRegistration() {
  if (!registration.value) return;
  editForm.allergens = registration.value.allergens || "";
  editForm.isVegetarian = registration.value.isVegetarian || false;
  editForm.isVegan = registration.value.isVegan || false;
  editForm.noPork = registration.value.noPork || false;
  editForm.noAlcohol = registration.value.noAlcohol || false;
  hydrateEditSelection(
    registration.value.meals?.map((rm: any) => ({
      mealId: rm.mealId,
      starterOptionId: rm.starterOptionId || undefined,
      mainOptionId: rm.mainOptionId || undefined,
      cheeseOptionId: rm.cheeseOptionId || undefined,
      dessertOptionId: rm.dessertOptionId || undefined,
    })),
    registration.value.activities?.map((ra: any) => ra.activityId),
  );
}

function startEdit() {
  hydrateEditFromRegistration();
  editShowErrors.value = false;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

async function saveEdit() {
  if (!registration.value) return;
  if (!isEditMealsValid.value) {
    editShowErrors.value = true;
    toast.error("Vérifiez les choix de repas (entrée/plat/fromage/dessert)");
    return;
  }
  if (!isEditActivitiesValid.value) {
    editShowErrors.value = true;
    toast.error("Sélectionnez au moins une activité");
    return;
  }

  isSaving.value = true;
  try {
    // Tri chronologique : la facture et la BDD reflètent l'ordre des dates
    const sortedMeals = sortSelectedMealsByDate(
      editMeals.value,
      mealsCatalog.value || [],
    );
    const sortedActivities = sortSelectedActivityIdsByDate(
      editActivities.value,
      activitiesCatalog.value || [],
    );

    await $fetch(`/api/registrations/${registration.value.id}`, {
      method: "PUT",
      body: {
        firstName: registration.value.firstName,
        lastName: registration.value.lastName,
        phone: registration.value.phone,
        allergens: editForm.allergens || null,
        isMotorized: registration.value.isMotorized,
        isVegetarian: editForm.isVegetarian,
        isVegan: editForm.isVegan,
        noPork: editForm.noPork,
        noAlcohol: editForm.noAlcohol,
        meals: sortedMeals,
        activities: sortedActivities,
      },
    });
    toast.success("Inscription mise à jour");
    isEditing.value = false;
    await refresh();
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || "Erreur lors de la sauvegarde");
  } finally {
    isSaving.value = false;
  }
}

const iutInfo = computed(() => {
  if (!registration.value?.iutId || !iuts.value) return null;
  return iuts.value.find((i) => i.id === registration.value!.iutId) || null;
});

const hasAnyDietary = computed(() => {
  const r = registration.value;
  if (!r) return false;
  return !!(r.isVegan || r.isVegetarian || r.noPork || r.noAlcohol);
});

const isLoading = ref(false);
const isCheckingIn = ref(false);

async function toggleCheckin() {
  if (!registration.value) return;
  isCheckingIn.value = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}/checkin`, {
      method: "PATCH",
      body: { checkedIn: !registration.value.checkedIn },
    });
    toast.success(
      registration.value.checkedIn ? "Check-in annulé" : "Présence confirmée",
    );
    refresh();
  } catch {
    toast.error("Erreur lors du check-in");
  } finally {
    isCheckingIn.value = false;
  }
}

async function updateStatus(newStatus: string) {
  if (!registration.value) return;

  isLoading.value = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    toast.success(`Statut mis à jour`);
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour");
  } finally {
    isLoading.value = false;
  }
}

const downloadingInvoice = ref(false);
const previewOpen = ref(false);
const iframeLoading = ref(false);

async function downloadInvoice() {
  if (!registration.value) return;
  downloadingInvoice.value = true;
  try {
    const response = await $fetch(
      `/api/registrations/${registration.value.id}/invoice`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(response as unknown as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Facture_${registration.value.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Facture téléchargée");
  } catch (error) {
    console.error(error);
    toast.error("Impossible de générer la facture");
  } finally {
    downloadingInvoice.value = false;
  }
}

function copyToClipboard(text: string) {
  if (import.meta.client) {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  }
}

const showDeleteDialog = ref(false);
const isDeleting = ref(false);

async function deleteRegistration() {
  if (!registration.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}`, {
      method: "DELETE",
    });
    toast.success("Inscription supprimée");
    router.push("/admin/inscriptions");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la suppression");
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
  }
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Calculate totals for invoice
const invoiceDetails = computed(() => {
  if (!registration.value) return { meals: [], activities: [], subtotal: 0 };

  const meals = (
    registration.value.meals?.map((m: any) => {
      const choices = [
        m.starterOption?.name && { label: "Entrée", name: m.starterOption.name },
        m.mainOption?.name && { label: "Plat", name: m.mainOption.name },
        m.cheeseOption?.name && { label: "Fromage", name: m.cheeseOption.name },
        m.dessertOption?.name && { label: "Dessert", name: m.dessertOption.name },
      ].filter(Boolean) as { label: string; name: string }[];
      return {
        name: m.meal?.name || "Repas",
        price: Number(m.meal?.price || 0),
        date: m.meal?.date as string | undefined,
        mealType: m.meal?.mealType as "LUNCH" | "DINNER" | undefined,
        choices,
      };
    }) || []
  ).sort(compareMealsByDate);

  const activities = (
    registration.value.activities?.map((a: any) => ({
      name: a.activity?.name || "Activité",
      price: Number(a.activity?.price || 0),
      date: a.activity?.date as string | undefined,
      startTime: a.activity?.startTime as string | undefined,
      endTime: a.activity?.endTime as string | undefined,
      allDay: !!a.activity?.allDay,
      location: a.activity?.location as string | undefined,
    })) || []
  ).sort(compareActivitiesByDate);

  const subtotal =
    meals.reduce((acc, m) => acc + m.price, 0) +
    activities.reduce((acc, a) => acc + a.price, 0);

  return { meals, activities, subtotal };
});

const { data: appSettings } = await useFetch("/api/settings");

// TVA extraite du total (les prix sont TTC) — taux configurable dans les paramètres
// En mode édition, on utilise le total recalculé en direct
const vat = computed(() =>
  computeVat(
    isEditing.value ? editTotal.value : invoiceDetails.value.subtotal,
    Number(appSettings.value?.vatRate) || 0,
  ),
);

function formatShortDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
</script>

<template>
  <div v-if="registration" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="router.push('/admin/inscriptions')"
        >
          <Icon name="lucide:arrow-left" class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold">Inscription</h1>
          <p class="text-muted-foreground">{{ registration.email }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge
          :class="['rounded-full px-3 py-1', statusColors[registration.status]]"
        >
          {{ statusLabels[registration.status] }}
        </Badge>
        <Button
          v-if="!isEditing"
          variant="outline"
          size="sm"
          class="rounded-full"
          @click="startEdit"
        >
          <Icon name="lucide:pencil" class="mr-2 h-3.5 w-3.5" />
          Modifier
        </Button>
        <template v-else>
          <Button
            variant="outline"
            size="sm"
            class="rounded-full"
            :disabled="isSaving"
            @click="cancelEdit"
          >
            Annuler
          </Button>
          <Button
            size="sm"
            class="rounded-full"
            :disabled="isSaving"
            @click="saveEdit"
          >
            <Icon
              v-if="isSaving"
              name="lucide:loader-2"
              class="mr-2 h-3.5 w-3.5 animate-spin"
            />
            <Icon v-else name="lucide:check" class="mr-2 h-3.5 w-3.5" />
            Sauvegarder
          </Button>
        </template>
        <Button
          v-if="!isEditing"
          variant="ghost"
          size="icon"
          class="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Supprimer l'inscription"
          @click="showDeleteDialog = true"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content - Invoice -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Invoice Details -->
        <div>
          <div class="pb-0 p-6">
            <h2 class="text-lg font-semibold">Détails de la facture</h2>
          </div>
          <div class="space-y-4 p-6">
            <!-- Invoice Info -->
            <div class="grid gap-3 text-sm">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">N° Inscription</span>
                <div class="flex items-center gap-2">
                  <code class="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                    {{ registration.id.slice(0, 12) }}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click="copyToClipboard(registration.id)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Date d'inscription</span>
                <span>{{ formatDate(registration.createdAt) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Statut</span>
                <Badge
                  :class="['rounded-full', statusColors[registration.status]]"
                >
                  {{ statusLabels[registration.status] }}
                </Badge>
              </div>
            </div>

            <!-- Edit mode: meals + activities selection -->
            <div v-if="isEditing" class="space-y-8 mt-12">
              <div>
                <h4 class="font-medium text-md text-muted-foreground mb-4">
                  Repas
                </h4>
                <RegistrationStepMeals
                  v-model="editMeals"
                  :meals-data="mealsCatalog"
                  :show-errors="editShowErrors"
                />
              </div>
              <Separator />
              <div>
                <h4 class="font-medium text-md text-muted-foreground mb-4">
                  Activités
                </h4>
                <RegistrationStepActivities
                  v-model="editActivities"
                  :activities-data="activitiesCatalog"
                  :show-errors="editShowErrors"
                />
              </div>
            </div>

            <!-- Read mode: line items -->
            <div v-else class="space-y-3 mt-12">
              <h4 class="font-medium text-md text-muted-foreground">
                Éléments facturés
              </h4>

              <!-- Meals -->
              <div
                v-for="(meal, index) in invoiceDetails.meals"
                :key="`meal-${index}`"
                class="flex justify-between gap-4 py-2"
              >
                <div class="flex items-start gap-2 min-w-0 flex-1">
                  <Icon
                    name="lucide:utensils"
                    class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div class="min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span class="font-medium">{{ meal.name }}</span>
                      <Badge v-if="meal.date" variant="outline" class="text-xs font-normal gap-1">
                        <Icon name="lucide:calendar" class="h-3 w-3" />
                        {{ formatShortDate(meal.date) }}
                      </Badge>
                      <Badge v-if="meal.mealType" variant="outline" class="text-xs font-normal gap-1">
                        <Icon
                          :name="meal.mealType === 'LUNCH' ? 'lucide:sun' : 'lucide:moon'"
                          class="h-3 w-3"
                        />
                        {{ meal.mealType === "LUNCH" ? "Déjeuner" : "Dîner" }}
                      </Badge>
                    </div>
                    <ul v-if="meal.choices.length" class="text-xs text-muted-foreground space-y-0.5">
                      <li v-for="c in meal.choices" :key="c.label">
                        <span class="font-medium">{{ c.label }} :</span> {{ c.name }}
                      </li>
                    </ul>
                  </div>
                </div>
                <span class="font-medium tabular-nums shrink-0">{{ meal.price.toFixed(2) }} €</span>
              </div>

              <!-- Activities -->
              <div
                v-for="(activity, index) in invoiceDetails.activities"
                :key="`activity-${index}`"
                class="flex justify-between gap-4 py-2"
              >
                <div class="flex items-start gap-2 min-w-0 flex-1">
                  <Icon
                    name="lucide:compass"
                    class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div class="min-w-0 space-y-1">
                    <span class="font-medium">{{ activity.name }}</span>
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Badge v-if="activity.date" variant="outline" class="text-xs font-normal gap-1">
                        <Icon name="lucide:calendar" class="h-3 w-3" />
                        {{ formatShortDate(activity.date) }}
                      </Badge>
                      <Badge
                        v-if="
                          !activity.allDay &&
                          (activity.startTime || activity.endTime)
                        "
                        variant="outline"
                        class="text-xs font-normal gap-1 tabular-nums"
                      >
                        <Icon name="lucide:clock" class="h-3 w-3" />
                        <template v-if="activity.startTime && activity.endTime">
                          {{ activity.startTime }} – {{ activity.endTime }}
                        </template>
                        <template v-else>
                          {{ activity.startTime || activity.endTime }}
                        </template>
                      </Badge>
                      <Badge
                        v-else-if="activity.allDay"
                        variant="outline"
                        class="text-xs font-normal gap-1"
                      >
                        <Icon name="lucide:calendar-clock" class="h-3 w-3" />
                        Toute la journée
                      </Badge>
                      <Badge v-if="activity.location" variant="outline" class="text-xs font-normal gap-1">
                        <Icon name="lucide:map-pin" class="h-3 w-3" />
                        {{ activity.location }}
                      </Badge>
                    </div>
                  </div>
                </div>
                <span class="font-medium tabular-nums shrink-0">
                  {{ activity.price.toFixed(2) }} €
                </span>
              </div>

              <!-- Empty state -->
              <div
                v-if="
                  invoiceDetails.meals.length === 0 &&
                  invoiceDetails.activities.length === 0
                "
                class="py-4 text-center text-muted-foreground text-sm"
              >
                Aucun élément facturé
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Totals -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sous-total HT</span>
                <span>{{ vat.ht.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">TVA ({{ vat.rate }}%)</span>
                <span>{{ vat.tva.toFixed(2) }} €</span>
              </div>
              <Separator />
              <div class="flex justify-between text-lg font-bold pt-2">
                <span>Total TTC</span>
                <span>{{ vat.ttc.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Customer Details -->
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">Participant</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-14 w-14">
                <AvatarImage :src="avatarUrl(`${registration.firstName} ${registration.lastName}`)" />
                <AvatarFallback class="bg-muted text-foreground text-lg">
                  {{ registration.firstName?.charAt(0)
                  }}{{ registration.lastName?.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-semibold">
                  {{ registration.firstName }} {{ registration.lastName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ registration.email }}
                </p>
              </div>
            </div>

            <Separator />

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Téléphone</p>
                <p class="font-medium">{{ registration.phone || "—" }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Inscrit le</p>
                <p class="font-medium">
                  {{ formatDate(registration.createdAt) }}
                </p>
              </div>
            </div>

            <Button
              class="w-full rounded-full"
              as="a"
              :href="`mailto:${registration.email}`"
            >
              <Icon name="lucide:mail" class="h-4 w-4" />
              Envoyer un email
            </Button>
          </CardContent>
        </Card>

        <!-- Préférences & informations -->
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">Préférences & informations</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- IUT -->
            <div class="flex items-start justify-between gap-4 text-sm">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <Icon name="lucide:graduation-cap" class="h-3.5 w-3.5" />
                IUT
              </span>
              <span class="font-medium text-right">
                <template v-if="iutInfo">
                  {{ iutInfo.name }}
                  <span v-if="iutInfo.city" class="text-muted-foreground font-normal">
                    · {{ iutInfo.city }}
                  </span>
                </template>
                <template v-else-if="registration.iutId">
                  <code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {{ registration.iutId.slice(0, 8) }}…
                  </code>
                </template>
                <template v-else>—</template>
              </span>
            </div>

            <!-- Motorisé -->
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <Icon name="lucide:car" class="h-3.5 w-3.5" />
                Motorisé
              </span>
              <Badge
                :variant="registration.isMotorized ? 'default' : 'outline'"
                class="rounded-full"
              >
                {{ registration.isMotorized ? "Oui" : "Non" }}
              </Badge>
            </div>

            <Separator />

            <!-- Préférences alimentaires -->
            <div class="space-y-2">
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Préférences alimentaires
              </p>
              <!-- Edit mode -->
              <div v-if="isEditing" class="grid grid-cols-2 gap-2">
                <label class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <span class="flex items-center gap-2 text-sm">
                    <Icon name="lucide:leaf" class="h-4 w-4 text-muted-foreground" />
                    Végétarien
                  </span>
                  <Switch v-model="editForm.isVegetarian" />
                </label>
                <label class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <span class="flex items-center gap-2 text-sm">
                    <Icon name="lucide:sprout" class="h-4 w-4 text-muted-foreground" />
                    Vegan
                  </span>
                  <Switch v-model="editForm.isVegan" />
                </label>
                <label class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <span class="flex items-center gap-2 text-sm">
                    <Icon name="lucide:ban" class="h-4 w-4 text-muted-foreground" />
                    Sans porc
                  </span>
                  <Switch v-model="editForm.noPork" />
                </label>
                <label class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                  <span class="flex items-center gap-2 text-sm">
                    <Icon name="lucide:wine-off" class="h-4 w-4 text-muted-foreground" />
                    Sans alcool
                  </span>
                  <Switch v-model="editForm.noAlcohol" />
                </label>
              </div>
              <!-- Read mode -->
              <div v-else-if="hasAnyDietary" class="flex flex-wrap gap-1.5">
                <Badge v-if="registration.isVegan" variant="outline" class="gap-1 font-normal">
                  <Icon name="lucide:sprout" class="h-3 w-3" />
                  Vegan
                </Badge>
                <Badge v-else-if="registration.isVegetarian" variant="outline" class="gap-1 font-normal">
                  <Icon name="lucide:leaf" class="h-3 w-3" />
                  Végétarien
                </Badge>
                <Badge v-if="registration.noPork" variant="outline" class="gap-1 font-normal">
                  <Icon name="lucide:ban" class="h-3 w-3" />
                  Sans porc
                </Badge>
                <Badge v-if="registration.noAlcohol" variant="outline" class="gap-1 font-normal">
                  <Icon name="lucide:wine-off" class="h-3 w-3" />
                  Sans alcool
                </Badge>
              </div>
              <p v-else class="text-sm text-muted-foreground">Aucune</p>
            </div>

            <!-- Allergies -->
            <div class="space-y-2">
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="lucide:alert-triangle" class="h-3.5 w-3.5" />
                Allergies alimentaires
              </p>
              <Input
                v-if="isEditing"
                v-model="editForm.allergens"
                placeholder="Ex : gluten, lactose…"
              />
              <div
                v-else-if="registration.allergens"
                class="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
              >
                {{ registration.allergens }}
              </div>
              <p v-else class="text-sm text-muted-foreground">Aucune renseignée</p>
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <Card class="gap-2">
          <CardHeader>
            <CardTitle class="text-base">Statut</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Select
              :model-value="registration.status"
              :disabled="isLoading"
              @update:model-value="updateStatus($event as string)"
            >
              <SelectTrigger class="w-full rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
              </SelectContent>
            </Select>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              @click="previewOpen = true"
            >
              <Icon name="lucide:eye" class="mr-2 h-4 w-4" />
              Prévisualiser la facture
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              @click="downloadInvoice"
              :disabled="downloadingInvoice"
            >
              <Icon
                v-if="downloadingInvoice"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              <Icon v-else name="lucide:download" class="mr-2 h-4 w-4" />
              {{
                downloadingInvoice ? "Génération..." : "Télécharger la facture"
              }}
            </Button>
          </CardContent>
        </Card>

        <!-- Check-in & QR Code -->
        <Card class="rounded-xl">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-base">Présence</CardTitle>
              <Badge
                :class="[
                  'rounded-full text-xs',
                  registration.checkedIn
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground',
                ]"
              >
                <Icon
                  :name="registration.checkedIn ? 'lucide:check-circle' : 'lucide:circle'"
                  class="h-3 w-3 mr-1"
                />
                {{ registration.checkedIn ? "Présent" : "Absent" }}
              </Badge>
            </div>
            <p
              v-if="registration.checkedIn && registration.checkedInAt"
              class="text-xs text-muted-foreground mt-1"
            >
              Enregistré le
              {{
                new Date(registration.checkedInAt).toLocaleString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- QR Code -->
            <div class="flex justify-center">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${registration.id}`"
                :alt="`QR code - ${registration.id}`"
                class="rounded-lg border bg-white p-2"
                width="160"
                height="160"
              />
            </div>
            <p class="text-xs text-center text-muted-foreground">
              Scannez ce code depuis la page
              <NuxtLink to="/admin/checkin" class="underline underline-offset-2">
                Check-in
              </NuxtLink>
            </p>
            <Button
              :variant="registration.checkedIn ? 'outline' : 'default'"
              size="sm"
              class="w-full rounded-full"
              :disabled="isCheckingIn"
              @click="toggleCheckin"
            >
              <Icon
                v-if="isCheckingIn"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              <Icon
                v-else-if="registration.checkedIn"
                name="lucide:rotate-ccw"
                class="mr-2 h-4 w-4"
              />
              <Icon
                v-else
                name="lucide:check-circle"
                class="mr-2 h-4 w-4"
              />
              {{
                isCheckingIn
                  ? "Enregistrement..."
                  : registration.checkedIn
                    ? "Annuler la présence"
                    : "Marquer comme présent"
              }}
            </Button>
          </CardContent>
        </Card>

        <!-- History -->
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <div class="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p class="font-medium">Inscription créée</p>
                  <p class="text-muted-foreground text-xs">
                    {{ formatDate(registration.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Loading / Not Found -->
  <div v-else class="flex items-center justify-center py-24">
    <Icon
      name="lucide:loader-2"
      class="h-8 w-8 animate-spin text-muted-foreground"
    />
  </div>

  <!-- Invoice Preview Dialog -->
  <Dialog v-model:open="previewOpen" @update:open="(v) => { if (v) iframeLoading = true }">
    <DialogContent class="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle> Facture — {{ registration?.id }} </DialogTitle>
      </DialogHeader>
      <div class="flex-1 relative">
        <div
          v-if="iframeLoading"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-10"
        >
          <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
          <p class="text-sm text-muted-foreground">Génération de la facture…</p>
        </div>
        <iframe
          v-if="registration && previewOpen"
          :src="`/api/registrations/${registration.id}/invoice`"
          class="w-full h-full rounded-b-lg"
          type="application/pdf"
          @load="iframeLoading = false"
        />
      </div>
    </DialogContent>
  </Dialog>

  <AlertDialog
    :open="showDeleteDialog"
    @update:open="showDeleteDialog = $event"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer cette inscription ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. L'inscription de
          <span class="font-medium">
            {{ registration?.firstName }} {{ registration?.lastName }}
          </span>
          ainsi que ses repas, activités et le paiement associé seront supprimés
          définitivement.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">Annuler</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          :disabled="isDeleting"
          @click="deleteRegistration"
        >
          <Icon
            v-if="isDeleting"
            name="lucide:loader-2"
            class="mr-2 h-4 w-4 animate-spin"
          />
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
