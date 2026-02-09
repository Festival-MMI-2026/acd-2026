<script setup lang="ts">
import { signIn } from "~/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const activeTab = ref("signin");
const email = ref("");
const isLoading = ref(false);
const error = ref("");
const magicLinkSent = ref(false);

const allowedDomains = ["univ-reims.fr", "etudiant.univ-reims.fr"];

function isValidEmailDomain(emailValue: string): boolean {
  const domain = emailValue.split("@")[1]?.toLowerCase();
  return domain ? allowedDomains.includes(domain) : false;
}

async function handleMagicLink() {
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
      callbackURL: "/inscription",
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
    callbackURL: "/inscription",
  });
}

function closeDialog() {
  emit("update:open", false);
  // Reset state
  email.value = "";
  error.value = "";
  magicLinkSent.value = false;
  activeTab.value = "signin";
}

watch(
  () => props.open,
  (newVal) => {
    if (!newVal) {
      // Reset when dialog closes
      email.value = "";
      error.value = "";
      magicLinkSent.value = false;
    }
  },
);
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-center"> Connexion requise </DialogTitle>
        <DialogDescription class="text-center">
          Connectez-vous pour continuer votre inscription
        </DialogDescription>
      </DialogHeader>

      <!-- Magic Link Sent -->
      <div v-if="magicLinkSent" class="py-6">
        <div class="text-center space-y-4">
          <div
            class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:mail-check" class="size-6 text-primary" />
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold">Vérifiez votre email</h2>
            <p class="text-muted-foreground text-sm">
              Nous avons envoyé un lien de connexion à
              <span class="font-medium text-foreground">{{ email }}</span>
            </p>
          </div>
          <Button
            variant="outline"
            class="w-full"
            @click="magicLinkSent = false"
          >
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            Utiliser une autre adresse
          </Button>
        </div>
      </div>

      <!-- Auth Forms -->
      <Tabs v-else v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Connexion</TabsTrigger>
          <TabsTrigger value="signup">Inscription</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" class="space-y-4 pt-4">
          <form @submit.prevent="handleMagicLink" class="space-y-4">
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <Field>
              <FieldLabel for="signin-email">Email</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:mail"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="signin-email"
                  v-model="email"
                  type="email"
                  placeholder="exemple@univ-reims.fr"
                  class="border-0 shadow-none focus-visible:ring-0"
                  required
                />
              </InputGroup>
            </Field>

            <Button type="submit" class="w-full" :disabled="isLoading">
              <Icon
                v-if="isLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isLoading ? "Envoi..." : "Recevoir le lien" }}
            </Button>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <Separator class="w-full" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button variant="outline" class="w-full" @click="handleGithubSignIn">
            <Icon name="lucide:github" class="mr-2 h-4 w-4" />
            Continuer avec Github
          </Button>
        </TabsContent>

        <TabsContent value="signup" class="space-y-4 pt-4">
          <form @submit.prevent="handleMagicLink" class="space-y-4">
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <Field>
              <FieldLabel for="signup-email">Email universitaire</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon
                    name="lucide:mail"
                    class="size-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <Input
                  id="signup-email"
                  v-model="email"
                  type="email"
                  placeholder="exemple@univ-reims.fr"
                  class="border-0 shadow-none focus-visible:ring-0"
                  required
                />
              </InputGroup>
              <p class="text-xs text-muted-foreground mt-1">
                Utilisez votre email @univ-reims.fr ou @etudiant.univ-reims.fr
              </p>
            </Field>

            <Button type="submit" class="w-full" :disabled="isLoading">
              <Icon
                v-if="isLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isLoading ? "Envoi..." : "Créer un compte" }}
            </Button>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <Separator class="w-full" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button variant="outline" class="w-full" @click="handleGithubSignIn">
            <Icon name="lucide:github" class="mr-2 h-4 w-4" />
            S'inscrire avec Github
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
