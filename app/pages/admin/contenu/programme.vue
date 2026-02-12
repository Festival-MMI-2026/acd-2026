<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  layout: "admin",
});

const { data: content, refresh } = await useFetch("/api/programme-content");

const form = ref({
  pageTitle: "",
  pageSubtitle: "",
});

const saving = ref(false);

watchEffect(() => {
  if (content.value) {
    form.value = {
      pageTitle: content.value.pageTitle,
      pageSubtitle: content.value.pageSubtitle,
    };
  }
});

async function save() {
  saving.value = true;
  try {
    await $fetch("/api/programme-content", {
      method: "PUT",
      body: form.value,
    });
    await refresh();
    toast.success("Contenu sauvegardé avec succès");
  } catch (e) {
    toast.error("Impossible de sauvegarder les modifications");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Page Programme</h1>
        <p class="text-muted-foreground">
          Modifier le titre et la description de la page Programme
        </p>
      </div>
      <Button class="rounded-full" :disabled="saving" @click="save">
        <Icon
          :name="saving ? 'lucide:loader-2' : 'lucide:save'"
          :class="['mr-2 h-4 w-4', saving && 'animate-spin']"
        />
        {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
      </Button>
    </div>

    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:calendar" class="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>En-tête de la page</CardTitle>
            <CardDescription>
              Le titre et la description affichés en haut de la page Programme
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Titre</Label>
          <Input
            v-model="form.pageTitle"
            class="rounded-xl text-lg"
            placeholder="Programme"
          />
        </div>
        <Separator />
        <div class="space-y-2">
          <Label class="text-sm font-medium">Sous-titre</Label>
          <Textarea
            v-model="form.pageSubtitle"
            class="rounded-xl resize-none"
            rows="2"
            placeholder="Retrouvez le programme complet..."
          />
        </div>
      </CardContent>
    </Card>

    <!-- Preview -->
    <Card class="rounded-2xl border-dashed">
      <CardHeader class="pb-3">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:eye" class="h-4 w-4" />
          <span class="text-sm font-medium">Aperçu</span>
        </div>
      </CardHeader>
      <CardContent>
        <div class="text-center space-y-2 py-6">
          <h2 class="text-2xl font-bold tracking-tight">
            {{ form.pageTitle || "Titre..." }}
          </h2>
          <p class="text-sm text-muted-foreground max-w-md mx-auto">
            {{ form.pageSubtitle || "Sous-titre..." }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
