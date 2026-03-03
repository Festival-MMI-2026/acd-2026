<script setup lang="ts">
import { toast } from "vue-sonner";

defineProps<{ open: boolean }>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const file = ref<File | null>(null);
const isLoading = ref(false);
const result = ref<{ created: number; errors: string[] } | null>(null);

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  file.value = target.files?.[0] ?? null;
  result.value = null;
}

function close() {
  file.value = null;
  result.value = null;
  emit("update:open", false);
}

async function handleUpload() {
  if (!file.value) return;

  isLoading.value = true;
  result.value = null;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const data = await $fetch<{ created: number; errors: string[] }>(
      "/api/events/import",
      { method: "POST", body: formData },
    );
    result.value = data;
    if (data.created > 0) {
      toast.success(`${data.created} événement${data.created > 1 ? "s" : ""} importé${data.created > 1 ? "s" : ""} avec succès`);
      emit("success");
    }
    if (data.errors.length > 0 && data.created === 0) {
      toast.error("L'import a échoué, vérifiez le fichier");
    }
  } catch (error: any) {
    toast.error(error.data?.statusMessage || "Erreur lors de l'import");
  } finally {
    isLoading.value = false;
  }
}

const csvTemplate = `titre;date;heure_debut;heure_fin;lieu;description
Accueil des participants;2026-06-15;09:00;10:00;Hall d'entrée;Accueil et remise des badges
Séance plénière d'ouverture;2026-06-15;10:00;12:00;Amphithéâtre;Discours d'ouverture et présentation du programme
Déjeuner;2026-06-15;12:00;14:00;Restaurant universitaire;
Ateliers thématiques;2026-06-15;14:00;17:00;Salles de TD;
Dîner de gala;2026-06-15;19:00;23:00;Salle des fêtes;`;

function downloadTemplate() {
  const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_import_programme.csv";
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <Dialog :open="open" @update:open="close">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="lucide:upload" class="h-4 w-4" />
          Importer le programme
        </DialogTitle>
        <DialogDescription>
          Importez des événements depuis un fichier CSV.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Format explanation -->
        <div class="rounded-lg border bg-muted/40 p-3 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Format CSV attendu
          </p>
          <p class="text-xs text-muted-foreground">
            Séparateur <code class="bg-muted px-1 rounded">,</code> ou <code class="bg-muted px-1 rounded">;</code>. Une ligne = un événement.
          </p>
          <div class="overflow-x-auto">
            <table class="text-[11px] w-full border-collapse">
              <thead>
                <tr class="text-muted-foreground">
                  <th class="text-left pr-3 pb-1 font-medium">Colonne</th>
                  <th class="text-left pb-1 font-medium">Valeurs / Format</th>
                </tr>
              </thead>
              <tbody class="text-foreground">
                <tr><td class="pr-3 py-0.5 font-mono">titre</td><td>Texte libre <span class="text-destructive">*</span></td></tr>
                <tr><td class="pr-3 py-0.5 font-mono">date</td><td>YYYY-MM-DD <span class="text-destructive">*</span></td></tr>
                <tr><td class="pr-3 py-0.5 font-mono">heure_debut</td><td>HH:MM <span class="text-destructive">*</span></td></tr>
                <tr><td class="pr-3 py-0.5 font-mono">heure_fin</td><td>HH:MM <span class="text-destructive">*</span></td></tr>
                <tr><td class="pr-3 py-0.5 font-mono">lieu</td><td>Texte libre (optionnel)</td></tr>
                <tr><td class="pr-3 py-0.5 font-mono">description</td><td>Texte libre (optionnel)</td></tr>
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" class="h-7 text-xs gap-1.5" @click="downloadTemplate">
            <Icon name="lucide:download" class="h-3 w-3" />
            Télécharger le modèle
          </Button>
        </div>

        <!-- File input -->
        <div class="space-y-1.5">
          <Label for="csv-events">Fichier CSV</Label>
          <Input id="csv-events" type="file" accept=".csv,.txt" @change="handleFileChange" />
        </div>

        <!-- Result -->
        <div v-if="result" class="space-y-2">
          <div v-if="result.created > 0" class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Icon name="lucide:check-circle" class="h-4 w-4 shrink-0" />
            <span>{{ result.created }} événement{{ result.created > 1 ? "s" : "" }} importé{{ result.created > 1 ? "s" : "" }}</span>
          </div>
          <div v-if="result.errors.length > 0" class="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
            <p class="text-xs font-semibold text-destructive">{{ result.errors.length }} erreur{{ result.errors.length > 1 ? "s" : "" }}</p>
            <ul class="text-xs text-destructive/80 space-y-0.5 list-disc ml-4">
              <li v-for="(err, i) in result.errors" :key="i">{{ err }}</li>
            </ul>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close" :disabled="isLoading">
          {{ result?.created ? "Fermer" : "Annuler" }}
        </Button>
        <Button @click="handleUpload" :disabled="!file || isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          <Icon v-else name="lucide:upload" class="mr-2 h-4 w-4" />
          Importer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
