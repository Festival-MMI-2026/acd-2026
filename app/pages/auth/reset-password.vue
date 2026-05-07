<script setup lang="ts">
import { authClient } from "~/lib/auth-client";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();

// Get token from URL query (Better Auth redirects here with ?token=xxx)
const token = computed(() => (route.query.token as string) || "");
const hasToken = computed(() => !!token.value);

// --- Request reset form ---
const requestEmail = ref("");
const requestLoading = ref(false);
const requestSent = ref(false);

async function handleRequestReset() {
  requestLoading.value = true;
  try {
    await authClient.requestPasswordReset({
      email: requestEmail.value,
      redirectTo: "/auth/reset-password",
    });
    requestSent.value = true;
  } catch (e) {
    // Don't reveal if email exists or not
    requestSent.value = true;
  } finally {
    requestLoading.value = false;
  }
}

// --- New password form ---
const newPassword = ref("");
const confirmPassword = ref("");
const resetLoading = ref(false);
const error = ref("");
const resetSuccess = ref(false);

async function handleResetPassword() {
  error.value = "";

  if (newPassword.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  resetLoading.value = true;
  try {
    await authClient.resetPassword({
      newPassword: newPassword.value,
      token: token.value,
    });
    resetSuccess.value = true;
    toast.success("Mot de passe modifié avec succès");
  } catch (e: any) {
    error.value =
      e?.message || "Le lien a expiré ou est invalide. Veuillez réessayer.";
  } finally {
    resetLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center gap-2">
          <NuxtImg
            src="/logo.svg"
            alt="ACD Logo"
            class="h-16 dark:hidden"
            loading="eager"
            height="64"
          />
          <NuxtImg
            src="/logo.svg"
            alt="ACD Logo"
            class="h-16 hidden dark:block dark:grayscale dark:invert dark:contrast-200"
            loading="eager"
            height="64"
          />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ hasToken ? "Nouveau mot de passe" : "Mot de passe oublié" }}
        </h1>
        <p class="text-muted-foreground">
          {{
            hasToken
              ? "Choisissez un nouveau mot de passe"
              : "Entrez votre email pour recevoir un lien de réinitialisation"
          }}
        </p>
      </div>

      <Card>
        <CardContent class="pt-6">
          <!-- ====== REQUEST RESET (no token) ====== -->
          <template v-if="!hasToken">
            <!-- Email sent confirmation -->
            <div v-if="requestSent" class="text-center space-y-4 py-2">
              <div
                class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Icon name="lucide:mail-check" class="size-6 text-primary" />
              </div>
              <div class="space-y-2">
                <h2 class="text-xl font-semibold">Vérifiez votre email</h2>
                <p class="text-muted-foreground text-sm">
                  Si un compte existe avec l'adresse
                  <span class="font-medium text-foreground">{{
                    requestEmail
                  }}</span
                  >, vous recevrez un lien de réinitialisation.
                </p>
              </div>
              <div class="space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  class="w-full"
                  @click="requestSent = false"
                >
                  <Icon name="lucide:arrow-left" class="size-4" />
                  Utiliser une autre adresse
                </Button>
                <Button variant="link" size="sm" as-child class="w-full">
                  <NuxtLink to="/auth/signin"> Retour à la connexion </NuxtLink>
                </Button>
              </div>
            </div>

            <!-- Request form -->
            <form v-else @submit.prevent="handleRequestReset">
              <FieldGroup class="gap-5">
                <Field>
                  <FieldLabel for="reset-email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Icon
                        name="lucide:mail"
                        class="size-4 text-muted-foreground"
                      />
                    </InputGroupAddon>
                    <Input
                      id="reset-email"
                      v-model="requestEmail"
                      type="email"
                      placeholder="exemple@email.fr"
                      class="border-0 shadow-none focus-visible:ring-0"
                      required
                    />
                  </InputGroup>
                </Field>

                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  class="w-full"
                  :disabled="requestLoading"
                >
                  <Icon
                    v-if="requestLoading"
                    name="lucide:loader-2"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{
                    requestLoading
                      ? "Envoi en cours..."
                      : "Envoyer le lien de réinitialisation"
                  }}
                </Button>
              </FieldGroup>
            </form>
          </template>

          <!-- ====== RESET PASSWORD (with token) ====== -->
          <template v-else>
            <!-- Success -->
            <div v-if="resetSuccess" class="text-center space-y-4 py-2">
              <div
                class="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:check" class="size-6 text-green-500" />
              </div>
              <div class="space-y-2">
                <h2 class="text-xl font-semibold">Mot de passe modifié</h2>
                <p class="text-muted-foreground text-sm">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez
                  maintenant vous connecter.
                </p>
              </div>
              <Button size="lg" class="w-full" as-child>
                <NuxtLink to="/auth/signin">
                  <Icon name="lucide:log-in" class="mr-2 h-4 w-4" />
                  Se connecter
                </NuxtLink>
              </Button>
            </div>

            <!-- Reset form -->
            <form v-else @submit.prevent="handleResetPassword">
              <FieldGroup class="gap-5">
                <Alert v-if="error" variant="destructive" class="rounded-xl">
                  <AlertDescription>{{ error }}</AlertDescription>
                </Alert>

                <Field>
                  <FieldLabel for="new-password"
                    >Nouveau mot de passe</FieldLabel
                  >
                  <InputGroup>
                    <InputGroupAddon>
                      <Icon
                        name="lucide:lock"
                        class="size-4 text-muted-foreground"
                      />
                    </InputGroupAddon>
                    <Input
                      id="new-password"
                      v-model="newPassword"
                      type="password"
                      placeholder="••••••••"
                      class="border-0 shadow-none focus-visible:ring-0"
                      required
                      minlength="8"
                    />
                  </InputGroup>
                  <p class="text-xs text-muted-foreground mt-1">
                    8 caractères minimum
                  </p>
                </Field>

                <Field>
                  <FieldLabel for="confirm-password"
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
                      id="confirm-password"
                      v-model="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      class="border-0 shadow-none focus-visible:ring-0"
                      required
                      minlength="8"
                    />
                  </InputGroup>
                </Field>

                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  class="w-full"
                  :disabled="resetLoading"
                >
                  <Icon
                    v-if="resetLoading"
                    name="lucide:loader-2"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{
                    resetLoading
                      ? "Réinitialisation..."
                      : "Réinitialiser le mot de passe"
                  }}
                </Button>
              </FieldGroup>
            </form>
          </template>
        </CardContent>
      </Card>

      <div class="flex justify-center">
        <Button
          variant="link"
          size="sm"
          class="text-xs text-muted-foreground h-0"
          as-child
        >
          <NuxtLink to="/auth/signin">
            <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
            Retour à la connexion
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
