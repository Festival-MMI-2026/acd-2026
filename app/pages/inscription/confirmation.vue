<script setup lang="ts">
import confetti from "canvas-confetti";

definePageMeta({
  layout: "default",
});

onMounted(() => {
  // Initial burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  // Second burst slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  }, 250);
});
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="container max-w-lg py-8 px-4">
      <Card class="rounded-2xl text-center">
        <CardContent class="pt-8 pb-6">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6"
          >
            <Icon name="lucide:check-circle-2" class="h-8 w-8 text-green-500" />
          </div>

          <h1 class="text-2xl font-bold mb-2">Inscription confirmée !</h1>
          <p class="text-muted-foreground mb-6">
            Votre inscription a bien été enregistrée. Vous recevrez un email de
            confirmation avec tous les détails.
          </p>

          <div class="flex flex-col gap-3 justify-center">
            <Button variant="default" size="lg" as-child>
              <NuxtLink to="/acces">
                <Icon name="lucide:map" class="mr-2 h-4 w-4" />
                Informations pratiques
              </NuxtLink>
            </Button>
            <Button variant="link" size="sm" as-child>
              <NuxtLink to="/"> Retour à l'accueil </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
