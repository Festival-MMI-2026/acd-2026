<script setup lang="ts">
import { authClient, useSession, signOut } from "~/lib/auth-client";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
});

const session = useSession();
const router = useRouter();

// Redirect if not logged in (client-side only to avoid SSR redirect before session is fetched)
if (import.meta.client) {
  watchEffect(() => {
    if (!session.value.isPending && !session.value.data) {
      router.push("/auth/signin");
    }
  });
}

// Fetch IUTs
const { data: iuts } = await useFetch<{ id: string; name: string; city?: string | null }[]>("/api/iuts");

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

// Check if profile is incomplete
const isProfileIncomplete = computed(() => {
  if (!session.value.data?.user) return false;
  const user = session.value.data.user as any;
  return !user.tel || !user.iut;
});

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

  // Validate passwords match
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordForm.error = "Les mots de passe ne correspondent pas";
    return;
  }

  // Validate password length
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
</script>

<template>
  <div class="container mx-auto px-6 py-24 max-w-2xl space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Mon Profil</h1>
      <p class="text-muted-foreground">
        Gérez vos informations personnelles et les paramètres de votre compte.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="session.isPending" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-6 w-6 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Content -->
    <div v-else-if="session.data?.user" class="space-y-8">
      <!-- Incomplete profile banner -->
      <Alert v-if="isProfileIncomplete" class="border-primary/50 bg-primary/5">
        <Icon name="lucide:info" class="h-4 w-4 text-primary" />
        <AlertDescription class="text-sm">
          Votre profil est incomplet. Veuillez renseigner votre numéro de
          téléphone et sélectionner votre IUT pour finaliser votre inscription.
        </AlertDescription>
      </Alert>

      <!-- Profile Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:user" class="h-5 w-5 text-primary" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Mettez à jour vos informations de profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <!-- Error -->
            <Alert v-if="profileForm.error" variant="destructive">
              <AlertDescription>{{ profileForm.error }}</AlertDescription>
            </Alert>

            <!-- Email (read-only) -->
            <Field>
              <FieldLabel>Email</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:mail"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  :value="session.data.user.email"
                  disabled
                  class="border-0 shadow-none bg-muted/50"
                />
              </InputGroup>
              <FieldDescription>
                L'adresse email ne peut pas être modifiée.
              </FieldDescription>
            </Field>

            <!-- FirstName / LastName -->
            <div class="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel for="firstName">Prénom</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Icon
                      name="lucide:user"
                      class="size-4 text-muted-foreground"
                    />
                  </InputGroupAddon>
                  <Input
                    id="firstName"
                    v-model="profileForm.firstName"
                    type="text"
                    placeholder="Jean"
                    class="border-0 shadow-none focus-visible:ring-0"
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel for="lastName">Nom</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Icon
                      name="lucide:user"
                      class="size-4 text-muted-foreground"
                    />
                  </InputGroupAddon>
                  <Input
                    id="lastName"
                    v-model="profileForm.lastName"
                    type="text"
                    placeholder="Dupont"
                    class="border-0 shadow-none focus-visible:ring-0"
                  />
                </InputGroup>
              </Field>
            </div>

            <!-- Phone -->
            <Field>
              <FieldLabel for="tel">Téléphone</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:phone"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="tel"
                  v-model="profileForm.tel"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  class="border-0 shadow-none focus-visible:ring-0"
                />
              </InputGroup>
            </Field>

            <!-- IUT Select -->
            <Field>
              <FieldLabel for="iut">IUT</FieldLabel>
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
            </Field>

            <Button
              type="submit"
              :disabled="profileForm.isLoading"
              class="rounded-full"
            >
              <Icon
                v-if="profileForm.isLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              Enregistrer les modifications
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Password Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:lock" class="h-5 w-5 text-primary" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe pour sécuriser votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <!-- Error -->
            <Alert v-if="passwordForm.error" variant="destructive">
              <AlertDescription>{{ passwordForm.error }}</AlertDescription>
            </Alert>

            <!-- Current password -->
            <Field>
              <FieldLabel for="currentPassword">Mot de passe actuel</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:key"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-0 shadow-none focus-visible:ring-0"
                  required
                />
              </InputGroup>
            </Field>

            <!-- New password -->
            <Field>
              <FieldLabel for="newPassword">Nouveau mot de passe</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:lock"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-0 shadow-none focus-visible:ring-0"
                  required
                />
              </InputGroup>
              <FieldDescription> Minimum 8 caractères. </FieldDescription>
            </Field>

            <!-- Confirm password -->
            <Field>
              <FieldLabel for="confirmPassword"
                >Confirmer le mot de passe</FieldLabel
              >
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:lock"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  class="border-0 shadow-none focus-visible:ring-0"
                  required
                />
              </InputGroup>
            </Field>

            <Button
              type="submit"
              :disabled="passwordForm.isLoading"
              class="rounded-full"
            >
              <Icon
                v-if="passwordForm.isLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              Modifier le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Danger Zone -->
      <Card class="border-destructive/50">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-destructive">
            <Icon name="lucide:alert-triangle" class="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="font-medium">Supprimer mon compte</p>
              <p class="text-sm text-muted-foreground">
                Toutes vos données seront définitivement supprimées.
              </p>
            </div>
            <AlertDialog v-model:open="showDeleteDialog">
              <AlertDialogTrigger as-child>
                <Button variant="destructive" class="rounded-full">
                  <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer votre compte?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données,
                    inscriptions et préférences seront définitivement
                    supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <!-- Error -->
                <Alert v-if="deleteForm.error" variant="destructive">
                  <AlertDescription>{{ deleteForm.error }}</AlertDescription>
                </Alert>

                <!-- Password confirmation -->
                <Field>
                  <FieldLabel for="deletePassword">
                    Confirmez avec votre mot de passe
                  </FieldLabel>
                  <Input
                    id="deletePassword"
                    v-model="deleteForm.password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </Field>

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
</template>
