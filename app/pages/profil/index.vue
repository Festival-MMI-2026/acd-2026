<script setup lang="ts">
import { authClient, useSession, signOut } from "~/lib/auth-client";
import { toast } from "vue-sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Mon profil — ACD MMI 2026",
  robots: "noindex, nofollow",
});

const session = useSession();
const router = useRouter();

// Redirect if not logged in (client-side only)
if (import.meta.client) {
  watchEffect(() => {
    if (!session.value.isPending && !session.value.data) {
      router.push("/auth/signin");
    }
  });
}

import type {
  Activity,
  Iut,
  Meal,
  Registration,
} from "~/types/registration";

// Fetch IUTs
const { data: iuts } = await useFetch<Iut[]>("/api/iuts");

// Fetch user's registration (server reads session, no query needed)
const userEmail = computed(() => session.value.data?.user?.email || "");
const {
  data: registration,
  refresh: refreshRegistration,
  status: regStatus,
} = await useFetch<Registration | null>("/api/registrations/me", {
  watch: [userEmail],
});

// Fetch meals and activities catalogs (for editing registration)
const { data: mealsCatalog } = await useFetch<Meal[]>("/api/meals");
const { data: activitiesCatalog } = await useFetch<Activity[]>("/api/activities");

// Profile form state
const profileForm = reactive({
  firstName: "",
  lastName: "",
  tel: "",
  iut: "",
  isLoading: false,
  error: "",
});

// Password form state
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  isLoading: false,
  error: "",
});

// Delete account state
const deleteForm = reactive({
  password: "",
  isLoading: false,
  error: "",
});
const showDeleteDialog = ref(false);

// Sidebar navigation
const activeSection = ref("personal");
const sidebarItems = [
  { id: "personal", label: "Informations", icon: "lucide:user" },
  { id: "registration", label: "Inscription", icon: "lucide:clipboard-list" },
  { id: "security", label: "Sécurité", icon: "lucide:shield" },
];

// Registration edit state
const editingRegistration = ref(false);
const editTab = ref("info");
const registrationForm = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  allergens: "",
  isMotorized: false,
  isLoading: false,
});
const editShowErrors = ref(false);
const {
  selectedMeals,
  selectedActivities,
  totalPrice: editTotal,
  mealsValid: isEditMealsValid,
  activitiesValid: isEditActivitiesValid,
  hydrate: hydrateRegistrationSelection,
} = useRegistrationForm(mealsCatalog, activitiesCatalog);

// Initialize profile form with session data
watchEffect(() => {
  if (session.value.data?.user) {
    const user = session.value.data.user as any;
    profileForm.firstName = user.firstName || "";
    profileForm.lastName = user.lastName || "";
    profileForm.tel = user.tel || "";
    profileForm.iut = user.iut || "";
  }
});

// Initialize registration form from fetched registration
watchEffect(() => {
  if (registration.value) {
    resetEditForm();
  }
});

function openEditRegistration() {
  resetEditForm();
  editTab.value = "info";
  editShowErrors.value = false;
  editingRegistration.value = true;
}

function resetEditForm() {
  if (!registration.value) return;
  registrationForm.firstName = registration.value.firstName;
  registrationForm.lastName = registration.value.lastName;
  registrationForm.phone = registration.value.phone;
  registrationForm.allergens = registration.value.allergens || "";
  registrationForm.isMotorized = registration.value.isMotorized;
  hydrateRegistrationSelection(
    registration.value.meals?.map((rm) => ({
      mealId: rm.mealId,
      starterOptionId: rm.starterOptionId || undefined,
      mainOptionId: rm.mainOptionId || undefined,
      dessertOptionId: rm.dessertOptionId || undefined,
    })),
    registration.value.activities?.map((ra) => ra.activityId),
  );
}

// Check if profile is incomplete
const isProfileIncomplete = computed(() => {
  if (!session.value.data?.user) return false;
  const user = session.value.data.user as any;
  return !user.tel || !user.iut;
});

// User initials for avatar
const userInitials = computed(() => {
  const user = session.value.data?.user as any;
  if (!user) return "?";
  const first = (user.firstName || user.name || "?")[0];
  const last = (user.lastName || "")[0] || "";
  return (first + last).toUpperCase();
});

// Status badge mapping
const statusMap: Record<
  string,
  { label: string; variant: string; icon: string }
> = {
  PENDING: { label: "En attente", variant: "outline", icon: "lucide:clock" },
  CONFIRMED: {
    label: "Confirmée",
    variant: "default",
    icon: "lucide:check-circle",
  },
  CANCELLED: {
    label: "Annulée",
    variant: "destructive",
    icon: "lucide:x-circle",
  },
};

// Payment status mapping
const paymentStatusMap: Record<string, { label: string; variant: string }> = {
  PENDING: { label: "En attente", variant: "outline" },
  PAID: { label: "Payé", variant: "default" },
  FAILED: { label: "Échoué", variant: "destructive" },
  REFUNDED: { label: "Remboursé", variant: "secondary" },
};

// Update profile
async function handleUpdateProfile() {
  profileForm.error = "";
  profileForm.isLoading = true;

  try {
    const { error } = await authClient.updateUser({
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      tel: profileForm.tel,
      iut: profileForm.iut,
    });

    if (error) {
      profileForm.error = error.message || "Erreur lors de la mise à jour";
    } else {
      toast.success("Profil mis à jour avec succès");
    }
  } catch (e: any) {
    profileForm.error = e.message || "Erreur inattendue";
  } finally {
    profileForm.isLoading = false;
  }
}

// Change password
async function handleChangePassword() {
  passwordForm.error = "";

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordForm.error = "Les mots de passe ne correspondent pas";
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    passwordForm.error = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  passwordForm.isLoading = true;

  try {
    const { error } = await authClient.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      passwordForm.error =
        error.message || "Erreur lors du changement de mot de passe";
    } else {
      toast.success("Mot de passe modifié avec succès");
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
    }
  } catch (e: any) {
    passwordForm.error = e.message || "Erreur inattendue";
  } finally {
    passwordForm.isLoading = false;
  }
}

// Delete account
async function handleDeleteAccount() {
  deleteForm.error = "";
  deleteForm.isLoading = true;

  try {
    const { error } = await authClient.deleteUser({
      password: deleteForm.password,
    });

    if (error) {
      deleteForm.error = error.message || "Erreur lors de la suppression";
    } else {
      toast.success("Compte supprimé avec succès");
      showDeleteDialog.value = false;
      await signOut();
      router.push("/");
    }
  } catch (e: any) {
    deleteForm.error = e.message || "Erreur inattendue";
  } finally {
    deleteForm.isLoading = false;
  }
}

// Update registration
async function handleUpdateRegistration() {
  if (!isEditMealsValid.value) {
    editShowErrors.value = true;
    editTab.value = "meals";
    toast.error("Veuillez vérifier vos choix de repas");
    return;
  }
  if (!isEditActivitiesValid.value) {
    editShowErrors.value = true;
    editTab.value = "activities";
    toast.error("Veuillez sélectionner au moins une activité");
    return;
  }

  if (!registration.value) return;

  registrationForm.isLoading = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}`, {
      method: "PUT",
      body: {
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        phone: registrationForm.phone,
        allergens: registrationForm.allergens || null,
        isMotorized: registrationForm.isMotorized,
        meals: selectedMeals.value,
        activities: selectedActivities.value,
      },
    });
    await refreshRegistration();
    editingRegistration.value = false;
    toast.success("Inscription mise à jour avec succès");
  } catch (e: any) {
    toast.error(e.data?.statusMessage || "Erreur lors de la modification");
  } finally {
    registrationForm.isLoading = false;
  }
}

function cancelEditRegistration() {
  editingRegistration.value = false;
  resetEditForm();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: any) {
  return Number(price || 0).toFixed(2);
}

const downloadingInvoice = ref(false);

async function downloadInvoice() {
  if (!registration.value?.id) return;
  downloadingInvoice.value = true;
  try {
    const response = await $fetch(
      `/api/registrations/${registration.value.id}/invoice`,
      {
        responseType: "blob",
      },
    );

    // Create a download link and trigger it
    const url = window.URL.createObjectURL(response as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Facture_${registration.value.order?.orderNumber || registration.value.id}.pdf`,
    );
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
</script>

<template>
  <div class="min-h-screen">
    <!-- Loading state -->
    <div v-if="session.isPending" class="flex justify-center py-32">
      <Icon
        name="lucide:loader-2"
        class="h-6 w-6 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Content -->
    <template v-else-if="session.data?.user">
      <section class="container max-w-5xl mx-auto px-6 pt-28 pb-16">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <NuxtLink to="/" class="hover:text-foreground transition-colors"
            >Accueil</NuxtLink
          >
          <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-foreground font-medium">Mon profil</span>
        </nav>

        <!-- Page title -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold tracking-tight">Mon profil</h1>
          <p class="text-muted-foreground mt-1">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <!-- Incomplete profile banner -->
        <Alert variant="destructive" v-if="isProfileIncomplete" class="mb-8">
          <AlertCircleIcon />
          <AlertTitle>Profil incomplet</AlertTitle>
          <AlertDescription>
            Veuillez renseigner votre numéro de téléphone et sélectionner votre
            IUT.
          </AlertDescription>
        </Alert>

        <!-- Main layout: sidebar + content -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar navigation -->
          <nav class="w-full lg:w-56 shrink-0">
            <div class="flex flex-row lg:flex-col gap-1">
              <button
                v-for="item in sidebarItems"
                :key="item.id"
                @click="activeSection = item.id"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left"
                :class="
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                "
              >
                <Icon :name="item.icon" class="h-4 w-4 shrink-0" />
                <span class="hidden sm:inline">{{ item.label }}</span>
              </button>
            </div>
          </nav>

          <!-- Content area -->
          <div class="flex-1 min-w-0">
            <!-- ==================== PERSONAL INFO ==================== -->
            <Card v-if="activeSection === 'personal'" class="rounded-2xl">
              <CardHeader>
                <CardTitle class="text-lg">Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour votre photo et vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form @submit.prevent="handleUpdateProfile" class="space-y-6">
                  <Alert v-if="profileForm.error" variant="destructive">
                    <AlertDescription>{{ profileForm.error }}</AlertDescription>
                  </Alert>
                  <!-- Name fields -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label for="firstName" class="text-sm font-medium"
                        >Prénom</Label
                      >
                      <Input
                        id="firstName"
                        v-model="profileForm.firstName"
                        type="text"
                        placeholder="Jean"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="lastName" class="text-sm font-medium"
                        >Nom</Label
                      >
                      <Input
                        id="lastName"
                        v-model="profileForm.lastName"
                        type="text"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <!-- Email (read-only) -->
                  <div class="space-y-2">
                    <Label class="text-sm font-medium">Email</Label>
                    <Input :model-value="session.data?.user?.email" disabled />
                    <p class="text-xs text-muted-foreground">
                      L'adresse email ne peut pas être modifiée.
                    </p>
                  </div>

                  <!-- Phone -->
                  <div class="space-y-2">
                    <Label for="tel" class="text-sm font-medium"
                      >Téléphone</Label
                    >
                    <Input
                      id="tel"
                      v-model="profileForm.tel"
                      type="tel"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <!-- IUT Select -->
                  <div class="space-y-2">
                    <Label for="iut" class="text-sm font-medium">IUT</Label>
                    <Select v-model="profileForm.iut">
                      <SelectTrigger id="iut">
                        <SelectValue placeholder="Sélectionnez votre IUT" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="item in iuts"
                          :key="item.id"
                          :value="item.name"
                        >
                          {{ item.name }}
                          <span v-if="item.city" class="text-muted-foreground">
                            — {{ item.city }}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Actions -->
                  <Separator />
                  <div class="flex justify-end gap-3">
                    <Button type="button" variant="outline"> Annuler </Button>
                    <Button type="submit" :disabled="profileForm.isLoading">
                      <Icon
                        v-if="profileForm.isLoading"
                        name="lucide:loader-2"
                        class="mr-2 h-4 w-4 animate-spin"
                      />
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <!-- ==================== REGISTRATION ==================== -->
            <div v-else-if="activeSection === 'registration'" class="space-y-6">
              <!-- No registration -->
              <Empty
                v-if="!registration && regStatus !== 'pending'"
                class="py-16"
              >
                <EmptyMedia variant="icon">
                  <Icon name="lucide:clipboard-x" class="size-5" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Aucune inscription</EmptyTitle>
                  <EmptyDescription>
                    Vous n'avez pas encore d'inscription. Inscrivez-vous pour
                    participer à l'ACD MMI 2026.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button as-child size="lg">
                    <NuxtLink to="/inscription">
                      S'inscrire maintenant
                      <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
                    </NuxtLink>
                  </Button>
                </EmptyContent>
              </Empty>

              <!-- Loading -->
              <div
                v-else-if="regStatus === 'pending'"
                class="flex justify-center py-16"
              >
                <Icon
                  name="lucide:loader-2"
                  class="h-6 w-6 animate-spin text-muted-foreground"
                />
              </div>

              <!-- Registration exists — Order-tracking style -->
              <Card
                v-else-if="registration"
                class="rounded-2xl overflow-hidden p-0"
              >
                <!-- Top metadata bar -->
                <div class="bg-muted/40 border-b px-6 py-4">
                  <div
                    class="flex flex-wrap items-center justify-between gap-4"
                  >
                    <div
                      class="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm"
                    >
                      <div>
                        <p class="text-muted-foreground text-xs">Inscrit le</p>
                        <p class="font-medium">
                          {{ formatDate(registration.createdAt) }}
                        </p>
                      </div>
                      <div v-if="registration.order">
                        <p class="text-muted-foreground text-xs">N° commande</p>
                        <p class="font-medium">
                          {{ registration.order.orderNumber }}
                        </p>
                      </div>
                      <div>
                        <p class="text-muted-foreground text-xs">Total</p>
                        <p class="font-medium">
                          {{ formatPrice(registration.totalPrice) }} EUR
                        </p>
                      </div>
                    </div>
                    <Badge
                      :variant="
                        registration.status === 'CONFIRMED'
                          ? 'default'
                          : registration.status === 'CANCELLED'
                            ? 'destructive'
                            : 'outline'
                      "
                    >
                      <Icon
                        :name="
                          statusMap[registration.status]?.icon || 'lucide:clock'
                        "
                        class="h-3 w-3 mr-1"
                      />
                      {{
                        statusMap[registration.status]?.label ||
                        registration.status
                      }}
                    </Badge>
                  </div>
                </div>

                <!-- Status banner -->
                <div
                  class="px-6 py-4 border-b flex items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <Icon
                        :name="
                          registration.status === 'CONFIRMED'
                            ? 'lucide:circle-check'
                            : registration.status === 'CANCELLED'
                              ? 'lucide:circle-x'
                              : 'lucide:hourglass'
                        "
                        class="h-5 w-5 text-primary"
                      />
                    </div>
                    <div>
                      <p class="font-medium">
                        {{
                          registration.status === "CONFIRMED"
                            ? "Inscription confirmée"
                            : registration.status === "CANCELLED"
                              ? "Inscription annulée"
                              : "En attente de confirmation"
                        }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ registration.firstName }}
                        {{ registration.lastName }} &middot;
                        {{ registration.email }} &middot;
                        {{ registration.phone }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="downloadInvoice"
                      :disabled="downloadingInvoice"
                      v-if="
                        registration.order?.paymentStatus &&
                        ['PAID', 'PENDING'].includes(
                          registration.order.paymentStatus,
                        )
                      "
                    >
                      <Icon
                        v-if="downloadingInvoice"
                        name="lucide:loader-2"
                        class="mr-2 h-3.5 w-3.5 animate-spin"
                      />
                      <Icon
                        v-else
                        name="lucide:file-text"
                        class="mr-2 h-3.5 w-3.5"
                      />
                      Facture
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openEditRegistration"
                    >
                      <Icon name="lucide:pencil" class="mr-2 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                  </div>
                </div>

                <!-- Items list -->
                <div class="divide-y">
                  <!-- Meals -->
                  <div
                    v-for="rm in registration.meals"
                    :key="rm.id"
                    class="px-6 py-5 flex items-start gap-4"
                  >
                    <div
                      class="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
                    >
                      <Icon
                        name="lucide:utensils"
                        class="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium">{{ rm.meal?.name }}</p>
                      <div class="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge
                          v-if="rm.starterOption"
                          variant="secondary"
                          class="text-xs font-normal"
                        >
                          Entrée: {{ rm.starterOption.name }}
                        </Badge>
                        <Badge
                          v-if="rm.mainOption"
                          variant="secondary"
                          class="text-xs font-normal"
                        >
                          Plat: {{ rm.mainOption.name }}
                        </Badge>
                        <Badge
                          v-if="rm.dessertOption"
                          variant="secondary"
                          class="text-xs font-normal"
                        >
                          Dessert: {{ rm.dessertOption.name }}
                        </Badge>
                      </div>
                    </div>
                    <p class="font-medium shrink-0">
                      {{ formatPrice(rm.meal?.price) }} EUR
                    </p>
                  </div>

                  <!-- Activities -->
                  <div
                    v-for="ra in registration.activities"
                    :key="ra.id"
                    class="px-6 py-5 flex items-start gap-4"
                  >
                    <div
                      class="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
                    >
                      <Icon
                        name="lucide:activity"
                        class="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium">{{ ra.activity?.name }}</p>
                      <p
                        v-if="ra.activity?.description"
                        class="text-sm text-muted-foreground mt-0.5 line-clamp-1"
                      >
                        {{ ra.activity.description }}
                      </p>
                    </div>
                  </div>

                  <!-- Extra info row: allergens + motorized -->
                  <div
                    v-if="registration.allergens || registration.isMotorized"
                    class="px-6 py-5 flex flex-wrap gap-4"
                  >
                    <div
                      v-if="registration.allergens"
                      class="flex items-center gap-2 text-sm"
                    >
                      <Icon
                        name="lucide:alert-triangle"
                        class="h-4 w-4 text-orange-500 shrink-0"
                      />
                      <span class="text-muted-foreground">Allergènes :</span>
                      <span class="font-medium">{{
                        registration.allergens
                      }}</span>
                    </div>
                    <div
                      v-if="registration.isMotorized"
                      class="flex items-center gap-2 text-sm"
                    >
                      <Icon
                        name="lucide:car"
                        class="h-4 w-4 text-primary shrink-0"
                      />
                      <span class="font-medium">Motorisé</span>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div
                  class="border-t bg-muted/20 px-6 py-4 flex items-center justify-between"
                >
                  <div
                    v-if="registration.order"
                    class="flex items-center gap-4 text-sm"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-muted-foreground">Paiement</span>
                      <Badge
                        :variant="
                          (paymentStatusMap[registration.order.paymentStatus]
                            ?.variant as any) || 'outline'
                        "
                        class="text-xs"
                      >
                        {{
                          paymentStatusMap[registration.order.paymentStatus]
                            ?.label || registration.order.paymentStatus
                        }}
                      </Badge>
                    </div>
                    <span
                      v-if="registration.order.paymentMethod"
                      class="text-muted-foreground"
                    >
                      via
                      <span class="capitalize">{{
                        registration.order.paymentMethod?.toLowerCase()
                      }}</span>
                    </span>
                  </div>
                  <div v-else />
                  <NuxtLink
                    to="/inscription"
                    class="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    Besoin d'aide ?
                  </NuxtLink>
                </div>
              </Card>

              <!-- Edit dialog -->
              <Dialog
                :open="editingRegistration"
                @update:open="
                  (v) => (v ? openEditRegistration() : cancelEditRegistration())
                "
              >
                <DialogScrollContent
                  class="max-w-3xl max-h-[90vh] overflow-y-auto"
                >
                  <DialogHeader>
                    <DialogTitle>Modifier mon inscription</DialogTitle>
                    <DialogDescription>
                      Mettez à jour vos informations, vos repas et vos activités.
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    @submit.prevent="handleUpdateRegistration"
                    class="space-y-6"
                  >
                    <Tabs v-model="editTab" class="w-full">
                      <TabsList class="grid w-full grid-cols-3">
                        <TabsTrigger value="info">
                          <Icon name="lucide:user" class="mr-2 h-3.5 w-3.5" />
                          Infos
                        </TabsTrigger>
                        <TabsTrigger value="meals">
                          <Icon
                            name="lucide:utensils"
                            class="mr-2 h-3.5 w-3.5"
                          />
                          Repas
                        </TabsTrigger>
                        <TabsTrigger value="activities">
                          <Icon
                            name="lucide:activity"
                            class="mr-2 h-3.5 w-3.5"
                          />
                          Activités
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="info" class="space-y-4 pt-4">
                        <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <Label class="text-sm font-medium">Prénom</Label>
                            <Input v-model="registrationForm.firstName" />
                          </div>
                          <div class="space-y-2">
                            <Label class="text-sm font-medium">Nom</Label>
                            <Input v-model="registrationForm.lastName" />
                          </div>
                        </div>
                        <div class="space-y-2">
                          <Label class="text-sm font-medium">Téléphone</Label>
                          <Input v-model="registrationForm.phone" type="tel" />
                        </div>
                        <div class="space-y-2">
                          <Label class="text-sm font-medium">Allergènes</Label>
                          <Input
                            v-model="registrationForm.allergens"
                            placeholder="Ex: gluten, lactose..."
                          />
                        </div>
                        <div class="flex items-center justify-between">
                          <Label class="text-sm font-medium"
                            >Véhicule motorisé</Label
                          >
                          <Switch
                            v-model:checked="registrationForm.isMotorized"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="meals" class="pt-4">
                        <RegistrationStepMeals
                          v-model="selectedMeals"
                          :meals-data="mealsCatalog"
                          :show-errors="editShowErrors"
                        />
                      </TabsContent>

                      <TabsContent value="activities" class="pt-4">
                        <RegistrationStepActivities
                          v-model="selectedActivities"
                          :activities-data="activitiesCatalog"
                          :show-errors="editShowErrors"
                        />
                      </TabsContent>
                    </Tabs>

                    <div
                      class="flex items-center justify-between border-t pt-4"
                    >
                      <div class="text-sm">
                        <span class="text-muted-foreground">Total : </span>
                        <span class="font-semibold tabular-nums">
                          {{ editTotal.toFixed(2) }} €
                        </span>
                      </div>
                      <div class="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          @click="cancelEditRegistration"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          :disabled="registrationForm.isLoading"
                        >
                          <Icon
                            v-if="registrationForm.isLoading"
                            name="lucide:loader-2"
                            class="mr-2 h-4 w-4 animate-spin"
                          />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogScrollContent>
              </Dialog>
            </div>

            <!-- ==================== SECURITY ==================== -->
            <div v-else-if="activeSection === 'security'" class="space-y-6">
              <!-- Password -->
              <Card class="rounded-2xl">
                <CardHeader>
                  <CardTitle class="text-lg">Mot de passe</CardTitle>
                  <CardDescription>
                    Modifiez votre mot de passe pour sécuriser votre compte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    @submit.prevent="handleChangePassword"
                    class="space-y-5"
                  >
                    <Alert v-if="passwordForm.error" variant="destructive">
                      <AlertDescription>{{
                        passwordForm.error
                      }}</AlertDescription>
                    </Alert>

                    <div class="space-y-2">
                      <Label for="currentPassword" class="text-sm font-medium"
                        >Mot de passe actuel</Label
                      >
                      <Input
                        id="currentPassword"
                        v-model="passwordForm.currentPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <Separator />

                    <div class="space-y-2">
                      <Label for="newPassword" class="text-sm font-medium"
                        >Nouveau mot de passe</Label
                      >
                      <Input
                        id="newPassword"
                        v-model="passwordForm.newPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                      <p class="text-xs text-muted-foreground">
                        Minimum 8 caractères.
                      </p>
                    </div>

                    <div class="space-y-2">
                      <Label for="confirmPassword" class="text-sm font-medium"
                        >Confirmer le mot de passe</Label
                      >
                      <Input
                        id="confirmPassword"
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <Separator />
                    <div class="flex justify-end gap-3">
                      <Button type="button" variant="outline">Annuler</Button>
                      <Button type="submit" :disabled="passwordForm.isLoading">
                        <Icon
                          v-if="passwordForm.isLoading"
                          name="lucide:loader-2"
                          class="mr-2 h-4 w-4 animate-spin"
                        />
                        Modifier le mot de passe
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <!-- Danger Zone -->
              <Card class="rounded-2xl border-destructive/30">
                <CardHeader>
                  <CardTitle class="text-lg text-destructive"
                    >Zone de danger</CardTitle
                  >
                  <CardDescription>
                    Actions irréversibles sur votre compte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div class="space-y-1">
                      <p class="font-semibold">Supprimer mon compte</p>
                      <p class="text-sm text-muted-foreground">
                        Toutes vos données seront définitivement supprimées.
                      </p>
                    </div>
                    <AlertDialog v-model:open="showDeleteDialog">
                      <AlertDialogTrigger as-child>
                        <Button variant="destructive" class="shrink-0">
                          <Icon name="lucide:trash-2" class="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle
                            >Supprimer votre compte ?</AlertDialogTitle
                          >
                          <AlertDialogDescription>
                            Cette action est irréversible. Toutes vos données,
                            inscriptions et préférences seront définitivement
                            supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <Alert v-if="deleteForm.error" variant="destructive">
                          <AlertDescription>{{
                            deleteForm.error
                          }}</AlertDescription>
                        </Alert>

                        <div class="space-y-2">
                          <Label
                            for="deletePassword"
                            class="text-sm font-medium"
                          >
                            Confirmez avec votre mot de passe
                          </Label>
                          <Input
                            id="deletePassword"
                            v-model="deleteForm.password"
                            type="password"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <Button
                            variant="destructive"
                            :disabled="
                              deleteForm.isLoading || !deleteForm.password
                            "
                            @click="handleDeleteAccount"
                          >
                            <Icon
                              v-if="deleteForm.isLoading"
                              name="lucide:loader-2"
                              class="mr-2 h-4 w-4 animate-spin"
                            />
                            Supprimer définitivement
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
