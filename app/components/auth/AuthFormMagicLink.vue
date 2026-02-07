<script setup lang="ts">
import { signIn } from "~/lib/auth-client";

const props = defineProps<{
  mode: "signin" | "signup";
}>();

const emit = defineEmits<{
  success: [];
}>();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const isLoading = ref(false);
const error = ref("");
const magicLinkSent = ref(false);

async function handleSubmit() {
  error.value = "";
  isLoading.value = true;

  const { data, error: signInError } = await signIn.magicLink(
    {
      email: email.value,
      ...(props.mode === "signup"
        ? { name: `${firstName.value} ${lastName.value}`.trim(), firstName: firstName.value, lastName: lastName.value }
        : {}),
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

      <!-- Name fields (signup only) -->
      <div v-if="mode === 'signup'" class="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel for="magic-firstName">Prénom</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:user" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="magic-firstName"
              v-model="firstName"
              type="text"
              placeholder="Jean"
              class="border-0 shadow-none focus-visible:ring-0"
              required
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel for="magic-lastName">Nom</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:user" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="magic-lastName"
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
        <FieldLabel for="magic-email">Email</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="lucide:mail" class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <Input
            id="magic-email"
            v-model="email"
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
