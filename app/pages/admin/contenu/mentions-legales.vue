<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({ layout: "admin" });

const { data: settings, refresh } = await useFetch("/api/settings");

const content = ref(settings.value?.legalMentions ?? "");
const isSaving = ref(false);

watch(
  () => settings.value?.legalMentions,
  (val) => {
    if (val !== undefined) content.value = val;
  },
);

async function save() {
  isSaving.value = true;
  try {
    await $fetch("/api/settings", {
      method: "PUT",
      body: { ...settings.value, legalMentions: content.value },
    });
    toast.success("Mentions légales sauvegardées");
    refresh();
  } catch {
    toast.error("Erreur lors de la sauvegarde");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Mentions légales</h1>
        <p class="text-muted-foreground text-sm">
          Contenu affiché sur la page <code>/mentions-legales</code>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" as-child class="rounded-full">
          <NuxtLink to="/mentions-legales" target="_blank">
            <Icon name="lucide:external-link" class="h-4 w-4" />
            Voir la page
          </NuxtLink>
        </Button>
        <Button
          size="sm"
          class="rounded-full"
          :disabled="isSaving"
          @click="save"
        >
          <Icon
            v-if="isSaving"
            name="lucide:loader-2"
            class="h-4 w-4 animate-spin"
          />
          <Icon v-else name="lucide:save" class="h-4 w-4" />
          {{ isSaving ? "Sauvegarde…" : "Sauvegarder" }}
        </Button>
      </div>
    </div>

    <RichTextEditor v-model="content" />
  </div>
</template>
