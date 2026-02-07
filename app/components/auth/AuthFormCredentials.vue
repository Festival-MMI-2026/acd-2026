<script setup lang="ts">
import { signIn, signUp } from "~/lib/auth-client";

const props = defineProps<{
  mode: "signin" | "signup";
}>();

const emit = defineEmits<{
  success: [];
}>();

const name = ref("");
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");

const allowedDomains = ["univ-reims.fr", "etudiant.univ-reims.fr"];

function isValidEmailDomain(emailValue: string): boolean {
  const domain = emailValue.split("@")[1]?.toLowerCase();
  return domain ? allowedDomains.includes(domain) : false;
}

async function handleSubmit() {
  error.value = "";

  if (!isValidEmailDomain(email.value)) {
    error.value =
      "Veuillez utiliser une adresse email @univ-reims.fr ou @etudiant.univ-reims.fr";
    return;
  }

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
          error.value = ctx.error.message;
        },
        onSuccess: () => {
          emit("success");
          navigateTo("/");
        },
      },
    );

    if (signInError) {
      error.value = signInError.message || "Erreur lors de la connexion";
    }
  } else {
    const { error: signUpError } = await signUp.email(
      {
        email: email.value,
        password: password.value,
        name: name.value,
      },
      {
        onError: (ctx) => {
          error.value = ctx.error.message;
        },
        onSuccess: () => {
          emit("success");
          navigateTo("/");
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
  <form @submit.prevent="handleSubmit">
    <FieldGroup class="gap-5">
      <Alert v-if="error" variant="destructive" class="rounded-xl">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Name field (signup only) -->
      <Field v-if="mode === 'signup'">
        <FieldLabel for="cred-name">Nom</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:user" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="cred-name"
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
        <FieldLabel for="cred-email">Email</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:mail" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="cred-email"
            v-model="email"
            type="email"
            placeholder="exemple@univ-reims.fr"
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
