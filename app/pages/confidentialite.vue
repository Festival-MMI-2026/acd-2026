<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: settings } = await useFetch("/api/settings");

useHead({ title: "Politique de confidentialité" });
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-bold mb-8">Politique de confidentialité</h1>

    <div
      v-if="settings?.privacyPolicy"
      class="prose prose-neutral dark:prose-invert max-w-none"
      v-html="settings.privacyPolicy"
    />
    <p v-else class="text-muted-foreground italic">
      La politique de confidentialité n'a pas encore été renseignée.
    </p>
  </main>
</template>
