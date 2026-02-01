<script setup lang="ts">
import { signIn } from "~/lib/auth-client";

definePageMeta({
  layout: "auth",
});

const name = ref("");
const email = ref("");
const isLoading = ref(false);
const error = ref("");
const magicLinkSent = ref(false);

const allowedDomains = ["univ-reims.fr", "etudiant.univ-reims.fr"];

function isValidEmailDomain(emailValue: string): boolean {
  const domain = emailValue.split("@")[1]?.toLowerCase();
  return domain ? allowedDomains.includes(domain) : false;
}

async function handleRegister() {
  error.value = "";

  // Validate email domain
  if (!isValidEmailDomain(email.value)) {
    error.value =
      "Veuillez utiliser une adresse email @univ-reims.fr ou @etudiant.univ-reims.fr";
    return;
  }

  isLoading.value = true;

  const { data, error: signInError } = await signIn.magicLink(
    {
      email: email.value,
      name: name.value,
      callbackURL: "/",
      newUserCallbackURL: "/",
    },
    {
      onError: (ctx) => {
        error.value = ctx.error.message;
      },
    },
  );

  isLoading.value = false;

  if (data && !signInError) {
    magicLinkSent.value = true;
  }
}

async function handleGithubSignIn() {
  await signIn.social({
    provider: "github",
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
          <img
            src="/LightLogoACD.svg"
            alt="ACD Logo"
            class="h-10 dark:hidden"
          />
          <img
            src="/DarkLogoACD.svg"
            alt="ACD Logo"
            class="h-10 hidden dark:block"
          />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p class="text-muted-foreground">
          Entrez vos informations pour créer votre compte
        </p>
      </div>

      <!-- Magic Link Sent Confirmation -->
      <Card v-if="magicLinkSent">
        <CardContent class="pt-6">
          <div class="text-center space-y-4">
            <div
              class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Icon name="lucide:mail-check" class="size-6 text-primary" />
            </div>
            <div class="space-y-2">
              <h2 class="text-xl font-semibold">Vérifiez votre email</h2>
              <p class="text-muted-foreground text-sm">
                Nous avons envoyé un lien de confirmation à
                <span class="font-medium text-foreground">{{ email }}</span>
              </p>
              <p class="text-muted-foreground text-sm">
                Cliquez sur le lien pour activer votre compte.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              class="w-full"
              @click="magicLinkSent = false"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
              Utiliser une autre adresse
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Form -->
      <Card v-else>
        <CardContent>
          <form @submit.prevent="handleRegister">
            <FieldGroup class="gap-5">
              <!-- Error message -->
              <Alert v-if="error" variant="destructive" class="rounded-xl">
                <AlertDescription>{{ error }}</AlertDescription>
              </Alert>

              <!-- Name field -->
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
                    v-model="name"
                    type="text"
                    placeholder="Jean Dupont"
                    class="border-0 shadow-none focus-visible:ring-0"
                    required
                  />
                </InputGroup>
              </Field>

              <!-- Email field -->
              <Field>
                <FieldLabel for="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Icon
                      name="lucide:mail"
                      class="size-4 text-muted-foreground"
                    />
                  </InputGroupAddon>
                  <Input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="exemple@email.com"
                    class="border-0 shadow-none focus-visible:ring-0"
                    required
                  />
                </InputGroup>
              </Field>

              <!-- Submit button -->
              <Button
                variant="default"
                size="lg"
                type="submit"
                class="w-full"
                :disabled="isLoading"
              >
                <Icon
                  v-if="isLoading"
                  name="lucide:loader-2"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                {{ isLoading ? "Envoi en cours..." : "Continuer" }}
              </Button>
            </FieldGroup>
          </form>
          <Separator orientation="horizontal" />
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
