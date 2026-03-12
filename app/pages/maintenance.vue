<script setup lang="ts">
definePageMeta({ layout: false });

useHead({ title: "Site en maintenance" });

const { data: settings } = await useFetch("/api/settings");
</script>

<template>
  <div
    class="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Icône -->
      <div
        class="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center"
      >
        <Icon name="lucide:wrench" class="h-6 w-6 text-primary" />
      </div>

      <!-- Texte -->
      <div class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight">Site en maintenance</h1>
        <p class="text-muted-foreground text-lg">
          {{ settings?.siteName || "Le site" }} est temporairement indisponible
          le temps d'une mise à jour. Merci de revenir dans quelques instants.
        </p>
      </div>

      <!-- Lien admin -->
      <Button variant="link" size="sm" as-child>
        <NuxtLink to="/auth/signin" class="inline-flex items-center gap-2">
          <Icon name="lucide:lock" class="h-4 w-4" />
          Accès administration
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
