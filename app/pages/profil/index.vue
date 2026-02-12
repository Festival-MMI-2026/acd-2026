<script setup lang="ts">
import { authClient, useSession, signOut } from "~/lib/auth-client";
import { toast } from "vue-sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-vue-next";

definePageMeta({
  layout: "default",
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

// Fetch IUTs
const { data: iuts } =
  await useFetch<{ id: string; name: string; city?: string | null }[]>(
    "/api/iuts",
  );

// Fetch user's registration by email
const userEmail = computed(() => session.value.data?.user?.email || "");
const {
  data: registration,
  refresh: refreshRegistration,
  status: regStatus,
} = await useFetch<any>("/api/registrations/me", {
  query: { email: userEmail },
  watch: [userEmail],
});

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
const registrationForm = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  allergens: "",
  isMotorized: false,
  isLoading: false,
});

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

// Initialize registration form
watchEffect(() => {
  if (registration.value) {
    registrationForm.firstName = registration.value.firstName || "";
    registrationForm.lastName = registration.value.lastName || "";
    registrationForm.phone = registration.value.phone || "";
    registrationForm.allergens = registration.value.allergens || "";
    registrationForm.isMotorized = registration.value.isMotorized || false;
  }
});

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
  registrationForm.isLoading = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}`, {
      method: "PUT",
      body: {
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        phone: registrationForm.phone,
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
  if (registration.value) {
    registrationForm.firstName = registration.value.firstName;
    registrationForm.lastName = registration.value.lastName;
    registrationForm.phone = registration.value.phone;
    registrationForm.allergens = registration.value.allergens || "";
    registrationForm.isMotorized = registration.value.isMotorized;
  }
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
          <NuxtLink to="/" class="hover:text-foreground transition-colors">Accueil</NuxtLink>
          <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-foreground font-medium">Mon profil</span>
        </nav>

        <!-- Page title -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold tracking-tight">Mon profil</h1>
          <p class="text-muted-foreground mt-1">Gérez vos informations personnelles et vos préférences</p>
        </div>

        <!-- Incomplete profile banner -->
        <Alert variant="destructive" v-if="isProfileIncomplete" class="mb-8">
          <AlertCircleIcon />
          <AlertTitle>Profil incomplet</AlertTitle>
          <AlertDescription>
            Veuillez renseigner votre numéro de téléphone et sélectionner
            votre IUT.
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
                :class="activeSection === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'"
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

                  <!-- Avatar section -->
                  <div class="flex items-center gap-6">
                    <div
                      class="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0"
                    >
                      {{ userInitials }}
                    </div>
                    <div
                      class="flex-1 flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    >
                      <Icon name="lucide:camera" class="h-6 w-6 text-muted-foreground" />
                      <p class="text-sm text-muted-foreground">Cliquez pour uploader ou glissez-déposez</p>
                      <p class="text-xs text-muted-foreground/60">PNG, JPG ou GIF (max. 2MB)</p>
                    </div>
                  </div>

                  <!-- Name fields -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label for="firstName" class="text-sm font-medium">Prénom</Label>
                      <Input
                        id="firstName"
                        v-model="profileForm.firstName"
                        type="text"
                        placeholder="Jean"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="lastName" class="text-sm font-medium">Nom</Label>
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
                    <Input
                      :value="session.data.user.email"
                      disabled
                      class="bg-muted/40 text-muted-foreground"
                    />
                    <p class="text-xs text-muted-foreground">
                      L'adresse email ne peut pas être modifiée.
                    </p>
                  </div>

                  <!-- Phone -->
                  <div class="space-y-2">
                    <Label for="tel" class="text-sm font-medium">Téléphone</Label>
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
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      :disabled="profileForm.isLoading"
                    >
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
              <Card
                v-if="!registration && regStatus !== 'pending'"
                class="rounded-2xl"
              >
                <CardContent class="py-16">
                  <div class="text-center space-y-5">
                    <div
                      class="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center"
                    >
                      <Icon
                        name="lucide:clipboard-x"
                        class="h-7 w-7 text-muted-foreground"
                      />
                    </div>
                    <div class="space-y-2">
                      <h3 class="text-lg font-semibold">Aucune inscription</h3>
                      <p class="text-muted-foreground text-sm max-w-sm mx-auto">
                        Vous n'avez pas encore d'inscription. Inscrivez-vous pour participer à l'ACD MMI 2026.
                      </p>
                    </div>
                    <Button as-child size="lg">
                      <NuxtLink to="/inscription">
                        S'inscrire maintenant
                        <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
                      </NuxtLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>

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

              <!-- Registration exists -->
              <template v-else-if="registration">
                <!-- Overview Card -->
                <Card class="rounded-2xl">
                  <CardHeader>
                    <div class="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle class="text-lg">Mon inscription</CardTitle>
                        <CardDescription>
                          Inscrit le {{ formatDate(registration.createdAt) }}
                        </CardDescription>
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
                  </CardHeader>
                  <CardContent>
                    <!-- View mode -->
                    <div v-if="!editingRegistration" class="space-y-6">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom complet</p>
                          <p class="font-medium">{{ registration.firstName }} {{ registration.lastName }}</p>
                        </div>
                        <div class="space-y-1">
                          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                          <p class="font-medium truncate">{{ registration.email }}</p>
                        </div>
                        <div class="space-y-1">
                          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Téléphone</p>
                          <p class="font-medium">{{ registration.phone }}</p>
                        </div>
                        <div class="space-y-1">
                          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motorisé</p>
                          <div class="flex items-center gap-2">
                            <Icon
                              :name="registration.isMotorized ? 'lucide:car' : 'lucide:x'"
                              class="h-4 w-4"
                              :class="registration.isMotorized ? 'text-primary' : 'text-muted-foreground'"
                            />
                            <p class="font-medium">{{ registration.isMotorized ? "Oui" : "Non" }}</p>
                          </div>
                        </div>
                        <div v-if="registration.allergens" class="space-y-1 sm:col-span-2">
                          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Allergènes</p>
                          <p class="font-medium">{{ registration.allergens }}</p>
                        </div>
                      </div>

                      <Separator />
                      <div class="flex justify-end">
                        <Button
                          variant="outline"
                          @click="editingRegistration = true"
                        >
                          <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                      </div>
                    </div>

                    <!-- Edit mode -->
                    <form
                      v-else
                      @submit.prevent="handleUpdateRegistration"
                      class="space-y-5"
                    >
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Separator />
                      <div class="flex gap-3 justify-end">
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
                    </form>
                  </CardContent>
                </Card>

                <!-- Order & Payment -->
                <Card v-if="registration.order" class="rounded-2xl">
                  <CardHeader>
                    <CardTitle class="text-lg">Commande</CardTitle>
                    <CardDescription>{{ registration.order.orderNumber }}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</p>
                        <p class="text-2xl font-bold">
                          {{ formatPrice(registration.order.amount) }}
                          <span class="text-sm font-normal text-muted-foreground">EUR</span>
                        </p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut paiement</p>
                        <Badge
                          :variant="(paymentStatusMap[registration.order.paymentStatus]?.variant as any) || 'outline'"
                          class="mt-1"
                        >
                          {{ paymentStatusMap[registration.order.paymentStatus]?.label || registration.order.paymentStatus }}
                        </Badge>
                      </div>
                      <div v-if="registration.order.paymentMethod" class="space-y-1">
                        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mode de paiement</p>
                        <p class="font-medium capitalize mt-1">{{ registration.order.paymentMethod?.toLowerCase() }}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <!-- Meals -->
                <Card
                  v-if="registration.meals && registration.meals.length > 0"
                  class="rounded-2xl"
                >
                  <CardHeader>
                    <CardTitle class="text-lg">Repas sélectionnés</CardTitle>
                    <CardDescription>
                      {{ registration.meals.length }} repas choisi{{ registration.meals.length > 1 ? "s" : "" }}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-3">
                      <div
                        v-for="rm in registration.meals"
                        :key="rm.id"
                        class="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <div class="space-y-2 min-w-0">
                          <p class="font-semibold">{{ rm.meal?.name }}</p>
                          <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span v-if="rm.starterOption" class="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border">
                              Entrée: {{ rm.starterOption.name }}
                            </span>
                            <span v-if="rm.mainOption" class="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border">
                              Plat: {{ rm.mainOption.name }}
                            </span>
                            <span v-if="rm.dessertOption" class="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border">
                              Dessert: {{ rm.dessertOption.name }}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" class="shrink-0">
                          {{ formatPrice(rm.meal?.price) }} EUR
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <!-- Activities -->
                <Card
                  v-if="registration.activities && registration.activities.length > 0"
                  class="rounded-2xl"
                >
                  <CardHeader>
                    <CardTitle class="text-lg">Activités choisies</CardTitle>
                    <CardDescription>
                      {{ registration.activities.length }} activité{{ registration.activities.length > 1 ? "s" : "" }}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        v-for="ra in registration.activities"
                        :key="ra.id"
                        class="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <Icon name="lucide:check-circle-2" class="h-4 w-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-medium text-sm">{{ ra.activity?.name }}</p>
                          <p v-if="ra.activity?.description" class="text-xs text-muted-foreground line-clamp-1">
                            {{ ra.activity.description }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <!-- Total -->
                <Card class="rounded-2xl border-primary/20 bg-primary/[0.02]">
                  <CardContent class="py-5">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold">Total inscription</span>
                      <span class="text-2xl font-bold">
                        {{ formatPrice(registration.totalPrice) }}
                        <span class="text-sm font-normal text-muted-foreground">EUR</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </template>
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
                  <form @submit.prevent="handleChangePassword" class="space-y-5">
                    <Alert v-if="passwordForm.error" variant="destructive">
                      <AlertDescription>{{ passwordForm.error }}</AlertDescription>
                    </Alert>

                    <div class="space-y-2">
                      <Label for="currentPassword" class="text-sm font-medium">Mot de passe actuel</Label>
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
                      <Label for="newPassword" class="text-sm font-medium">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        v-model="passwordForm.newPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                      <p class="text-xs text-muted-foreground">Minimum 8 caractères.</p>
                    </div>

                    <div class="space-y-2">
                      <Label for="confirmPassword" class="text-sm font-medium">Confirmer le mot de passe</Label>
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
                      <Button
                        type="submit"
                        :disabled="passwordForm.isLoading"
                      >
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
                  <CardTitle class="text-lg text-destructive">Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles sur votre compte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                      <p class="font-semibold">Supprimer mon compte</p>
                      <p class="text-sm text-muted-foreground">
                        Toutes vos données seront définitivement supprimées.
                      </p>
                    </div>
                    <AlertDialog v-model:open="showDeleteDialog">
                      <AlertDialogTrigger as-child>
                        <Button variant="destructive" class="shrink-0">
                          <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Toutes vos données,
                            inscriptions et préférences seront définitivement
                            supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <Alert v-if="deleteForm.error" variant="destructive">
                          <AlertDescription>{{ deleteForm.error }}</AlertDescription>
                        </Alert>

                        <div class="space-y-2">
                          <Label for="deletePassword" class="text-sm font-medium">
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
                            :disabled="deleteForm.isLoading || !deleteForm.password"
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
