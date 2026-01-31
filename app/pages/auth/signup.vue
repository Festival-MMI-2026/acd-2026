<script setup lang="ts">
import { signUp } from "~/lib/auth-client";
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-icons/vue";

definePageMeta({
  layout: "default",
});

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const error = ref("");

async function handleRegister() {
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  // Validate password length
  if (password.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  isLoading.value = true;
  error.value = "";

  const { data, error: signUpError } = await signUp.email(
    {
      name: name.value,
      email: email.value,
      password: password.value,
      callbackURL: "/",
    },
    {
      onError: (ctx) => {
        error.value = ctx.error.message;
      },
    },
  );

  isLoading.value = false;

  if (data && !signUpError) {
    navigateTo("/");
  }
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-sm space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p class="text-muted-foreground">
          Entrez vos informations pour créer votre compte
        </p>
      </div>

      <!-- Form -->
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <form @submit.prevent="handleRegister" class="space-y-5">
            <!-- Error message -->
            <Alert v-if="error" variant="destructive" class="rounded-xl">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Name field -->
            <div class="space-y-2">
              <Label for="name">Nom</Label>
              <div class="relative">
                <PersonIcon
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="name"
                  v-model="name"
                  type="text"
                  placeholder="Jean Dupont"
                  class="pl-11 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <!-- Email field -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <div class="relative">
                <EnvelopeClosedIcon
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="exemple@email.com"
                  class="pl-11 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <!-- Password field -->
            <div class="space-y-2">
              <Label for="password">Mot de passe</Label>
              <div class="relative">
                <LockClosedIcon
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="pl-11 h-12 rounded-xl"
                  required
                />
              </div>
              <p class="text-xs text-muted-foreground">Minimum 8 caractères</p>
            </div>

            <!-- Confirm Password field -->
            <div class="space-y-2">
              <Label for="confirmPassword">Confirmer le mot de passe</Label>
              <div class="relative">
                <LockClosedIcon
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  class="pl-11 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <!-- Submit button -->
            <Button
              type="submit"
              class="w-full h-12 rounded-full text-base"
              :disabled="isLoading"
            >
              <Icon
                v-if="isLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isLoading ? "Création..." : "Créer mon compte" }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-muted-foreground">
          Déjà un compte ?
          <NuxtLink
            to="/auth/signin"
            class="font-medium text-foreground hover:underline"
          >
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
