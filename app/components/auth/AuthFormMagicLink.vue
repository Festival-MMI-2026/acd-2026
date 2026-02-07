<script setup lang="ts">
import { signIn } from "~/lib/auth-client";

const props = defineProps<{
  mode: "signin" | "signup";
}>();

const emit = defineEmits<{
  success: [];
}>();

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

async function handleSubmit() {
  error.value = "";

  if (!isValidEmailDomain(email.value)) {
    error.value =
      "Veuillez utiliser une adresse email @univ-reims.fr ou @etudiant.univ-reims.fr";
    return;
  }

  isLoading.value = true;

  const { data, error: signInError } = await signIn.magicLink(
    {
      email: email.value,
      ...(props.mode === "signup" ? { name: name.value } : {}),
      callbackURL: "/",
      ...(props.mode === "signup" ? { newUserCallbackURL: "/" } : {}),
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
    emit("success");
  }
}
</script>

<template>
  <!-- Magic Link Sent Confirmation -->
  <div v-if="magicLinkSent" class="text-center space-y-4 py-2">
    <div
      class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <Icon name="lucide:mail-check" class="size-6 text-primary" />
    </div>
    <div class="space-y-2">
      <h2 class="text-xl font-semibold">Vérifiez votre email</h2>
      <p class="text-muted-foreground text-sm">
        Nous avons envoyé un lien de
        {{ mode === "signin" ? "connexion" : "confirmation" }} à
        <span class="font-medium text-foreground">{{ email }}</span>
      </p>
      <p v-if="mode === 'signup'" class="text-muted-foreground text-sm">
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

  <!-- Form -->
  <form v-else @submit.prevent="handleSubmit">
    <FieldGroup class="gap-5">
      <Alert v-if="error" variant="destructive" class="rounded-xl">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Name field (signup only) -->
      <Field v-if="mode === 'signup'">
        <FieldLabel for="magic-name">Nom</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:user" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="magic-name"
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
        <FieldLabel for="magic-email">Email</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:mail" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="magic-email"
            v-model="email"
            type="email"
            placeholder="exemple@univ-reims.fr"
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
</template>
