<script setup lang="ts">
import { signIn } from "~/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Inscription — ACD MMI 2026",
  description: "Créez votre compte pour accéder à l'ACD MMI 2026.",
  robots: "noindex, nofollow",
});

const { data: settings } = await useFetch("/api/settings");
const isMaintenance = computed(() => settings.value?.maintenanceMode ?? false);

if (isMaintenance.value) {
  await navigateTo("/maintenance");
}

async function handleGithubSignIn() {
  await signIn.social({
    provider: "github",
    callbackURL: "/auth/callback",
  });
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-sm space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center">
          <NuxtImg
            src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
            alt="ACD Logo"
            class="h-16 dark:hidden"
            loading="eager"
            height="64"
          />
          <NuxtImg
            src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
            alt="ACD Logo"
            class="h-16 hidden dark:block dark:grayscale dark:invert dark:contrast-200"
            loading="eager"
            height="64"
          />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p class="text-muted-foreground">
          Entrez vos informations pour créer votre compte
        </p>
      </div>

      <!-- Card with Tabs -->
      <Card>
        <CardContent>
          <Tabs default-value="magic-link" class="w-full">
            <TabsList class="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="magic-link">Lien magique</TabsTrigger>
              <TabsTrigger value="credentials">Mot de passe</TabsTrigger>
            </TabsList>

            <TabsContent value="magic-link">
              <AuthFormMagicLink mode="signup" />
            </TabsContent>

            <TabsContent value="credentials">
              <AuthFormCredentials mode="signup" />
            </TabsContent>
          </Tabs>

          <Separator orientation="horizontal" class="mt-4" />
          <p class="text-center text-sm text-muted-foreground mt-2 mb-4">ou</p>
          <div class="flex flex-col space-y-2">
            <Button
              variant="outline"
              class="w-full"
              @click="handleGithubSignIn"
            >
              <Icon name="lucide:github" class="mr-2 h-4 w-4" />
              Continuer avec Github
            </Button>
          </div>
        </CardContent>
        <CardFooter class="flex justify-center">
          <p class="text-sm text-muted-foreground">
            Déjà un compte ?
            <Button variant="link" size="sm" as-child>
              <NuxtLink to="/auth/signin"> Se connecter </NuxtLink>
            </Button>
          </p>
        </CardFooter>
      </Card>
      <div class="flex justify-center">
        <Button
          variant="link"
          size="sm"
          class="text-xs text-muted-foreground h-0"
          as-child
        >
          <NuxtLink to="/">
            <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
            Retour à l'accueil
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
