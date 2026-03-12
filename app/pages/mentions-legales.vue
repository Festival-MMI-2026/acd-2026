<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: settings } = await useFetch("/api/settings");

useHead({ title: "Mentions légales" });
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-bold mb-8">Mentions légales</h1>

    <div
      v-if="settings?.legalMentions"
      class="prose prose-neutral dark:prose-invert max-w-none"
      v-html="settings.legalMentions"
    />
    <p v-else class="text-muted-foreground italic">
      Les mentions légales n'ont pas encore été renseignées.
    </p>
  </main>
</template>
