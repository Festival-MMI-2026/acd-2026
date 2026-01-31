<script setup lang="ts">
import { signIn } from "~/lib/auth-client";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-icons/vue";

definePageMeta({
  layout: "default",
});

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");

async function handleLogin() {
  isLoading.value = true;
  error.value = "";

  const { data, error: signInError } = await signIn.email(
    {
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

  if (data && !signInError) {
    navigateTo("/");
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Connexion</h1>
        <p class="text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>

      <!-- Form -->
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Error message -->
            <Alert v-if="error" variant="destructive" class="rounded-xl">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

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
              <div class="flex items-center justify-between">
                <Label for="password">Mot de passe</Label>
                <NuxtLink
                  to="/auth/forgot-password"
                  class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mot de passe oublié ?
                </NuxtLink>
              </div>
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
              {{ isLoading ? "Connexion..." : "Se connecter" }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-muted-foreground">
          Pas encore de compte ?
          <NuxtLink
            to="/auth/signup"
            class="font-medium text-foreground hover:underline"
          >
            Créer un compte
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
