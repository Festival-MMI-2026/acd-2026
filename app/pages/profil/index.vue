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

// Profile form state
const profileForm = reactive({
  name: "",
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
    profileForm.name = session.value.data.user.name || "";
  }
});

// Update profile
async function handleUpdateProfile() {
  profileForm.error = "";
  profileForm.isLoading = true;

  try {
    const { error } = await authClient.updateUser({
      name: profileForm.name,
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

            <!-- Name -->
            <Field>
              <FieldLabel for="name">Nom</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:user"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  placeholder="Votre nom"
                  class="border-0 shadow-none focus-visible:ring-0"
                />
              </InputGroup>
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
