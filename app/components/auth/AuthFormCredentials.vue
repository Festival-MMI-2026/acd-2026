<script setup lang="ts">
import { signIn, signUp } from "~/lib/auth-client";

const props = defineProps<{
  mode: "signin" | "signup";
}>();

const emit = defineEmits<{
  success: [];
}>();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");
const verificationSent = ref(false);

async function handleSubmit() {
  error.value = "";

  if (props.mode === "signup" && password.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  isLoading.value = true;

  if (props.mode === "signin") {
    const { error: signInError } = await signIn.email(
      {
        email: email.value,
        password: password.value,
      },
      {
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            verificationSent.value = true;
          } else {
            error.value = ctx.error.message;
          }
        },
        onSuccess: () => {
          emit("success");
          navigateTo("/");
        },
      },
    );

    if (signInError && signInError.status !== 403) {
      error.value = signInError.message || "Erreur lors de la connexion";
    }
  } else {
    const { error: signUpError } = await signUp.email(
      {
        email: email.value,
        password: password.value,
        name: `${firstName.value} ${lastName.value}`.trim(),
        firstName: firstName.value,
        lastName: lastName.value,
      },
      {
        onError: (ctx) => {
          error.value = ctx.error.message;
        },
        onSuccess: () => {
          verificationSent.value = true;
          emit("success");
        },
      },
    );

    if (signUpError) {
      error.value = signUpError.message || "Erreur lors de l'inscription";
    }
  }

  isLoading.value = false;
}
</script>

<template>
  <!-- Verification Email Sent Confirmation -->
  <div v-if="verificationSent" class="text-center space-y-4 py-2">
    <div
      class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <Icon name="lucide:mail-check" class="size-6 text-primary" />
    </div>
    <div class="space-y-2">
      <h2 class="text-xl font-semibold">Vérifiez votre email</h2>
      <p class="text-muted-foreground text-sm">
        Nous avons envoyé un email de vérification à
        <span class="font-medium text-foreground">{{ email }}</span>
      </p>
      <p class="text-muted-foreground text-sm">
        Cliquez sur le lien dans l'email pour activer votre compte.
      </p>
    </div>
    <Button
      variant="outline"
      size="lg"
      class="w-full"
      @click="verificationSent = false"
    >
      <Icon name="lucide:arrow-left" class="size-4" />
      Retour
    </Button>
  </div>

  <form v-else @submit.prevent="handleSubmit">
    <FieldGroup class="gap-5">
      <Alert v-if="error" variant="destructive" class="rounded-xl">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Name fields (signup only) -->
      <div v-if="mode === 'signup'" class="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel for="cred-firstName">Prénom</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:user" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="cred-firstName"
              v-model="firstName"
              type="text"
              placeholder="Jean"
              class="border-0 shadow-none focus-visible:ring-0"
              required
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel for="cred-lastName">Nom</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:user" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="cred-lastName"
              v-model="lastName"
              type="text"
              placeholder="Dupont"
              class="border-0 shadow-none focus-visible:ring-0"
              required
            />
          </InputGroup>
        </Field>
      </div>

      <!-- Email field -->
      <Field>
        <FieldLabel for="cred-email">Email</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:mail" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="cred-email"
            v-model="email"
            type="email"
            placeholder="exemple@email.fr"
            class="border-0 shadow-none focus-visible:ring-0"
            required
          />
        </InputGroup>
      </Field>

      <!-- Password field -->
      <Field>
        <FieldLabel for="cred-password">Mot de passe</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:lock" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="cred-password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="border-0 shadow-none focus-visible:ring-0"
            required
            :minlength="mode === 'signup' ? 8 : undefined"
          />
        </InputGroup>
        <p v-if="mode === 'signup'" class="text-xs text-muted-foreground mt-1">
          8 caractères minimum
        </p>
        <div v-if="mode === 'signin'" class="flex justify-end">
          <Button
            variant="link"
            size="sm"
            class="h-auto p-0 text-xs text-muted-foreground"
            as-child
          >
            <NuxtLink to="/auth/reset-password">
              Mot de passe oublié ?
            </NuxtLink>
          </Button>
        </div>
      </Field>

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
        {{
          isLoading
            ? mode === "signin"
              ? "Connexion..."
              : "Inscription..."
            : mode === "signin"
              ? "Se connecter"
              : "Créer un compte"
        }}
      </Button>
    </FieldGroup>
  </form>
</template>
