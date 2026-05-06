<script setup lang="ts">
import { toast } from "vue-sonner";
import { DatePicker } from "@/components/ui/date-picker";

definePageMeta({
  layout: "admin",
});

const filterByDate = ref(false);
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
const includeHeaders = ref(true);
const anonymize = ref(false);
const isExporting = ref(false);

const exportFormats = [
  {
    id: "csv",
    name: "CSV",
    icon: "lucide:file-text",
    description: "Format texte universel",
  },
  {
    id: "json",
    name: "JSON",
    icon: "lucide:file-json",
    description: "Format données structurées",
  },
];

const dataCategories = ref([
  {
    id: "registrations",
    name: "Inscriptions",
    count: 0,
    icon: "lucide:users",
    selected: true,
  },
  {
    id: "events",
    name: "Programme",
    count: 0,
    icon: "lucide:calendar",
    selected: false,
  },
  {
    id: "meals",
    name: "Repas",
    count: 0,
    icon: "lucide:utensils",
    selected: false,
  },
  {
    id: "activities",
    name: "Activités",
    count: 0,
    icon: "lucide:activity",
    selected: false,
  },
  {
    id: "hotels",
    name: "Hôtels",
    count: 0,
    icon: "lucide:building-2",
    selected: false,
  },
  {
    id: "iuts",
    name: "IUTs",
    count: 0,
    icon: "lucide:graduation-cap",
    selected: false,
  },
]);

const selectedFormat = ref("csv");

const selectedCategories = computed(() =>
  dataCategories.value.filter((c) => c.selected).map((c) => c.id),
);

// Fetch counts on mount
const fetchCounts = async () => {
  try {
    const counts = await $fetch<Record<string, number>>("/api/export/counts");
    for (const cat of dataCategories.value) {
      if (counts[cat.id] !== undefined) {
        cat.count = counts[cat.id] ?? 0;
      }
    }
  } catch (err) {
    console.error("Error fetching counts:", err);
  }
};

// Export data
const handleExport = async () => {
  if (!selectedCategories.value.length) {
    toast.error("Veuillez sélectionner au moins une catégorie");
    return;
  }

  isExporting.value = true;
  try {
    const response = await $fetch("/api/export", {
      method: "POST",
      body: {
        categories: selectedCategories.value,
        format: selectedFormat.value,
        includeHeaders: includeHeaders.value,
        anonymize: anonymize.value,
        startDate:
          filterByDate.value && startDate.value
            ? startDate.value.toISOString()
            : undefined,
        endDate:
          filterByDate.value && endDate.value
            ? endDate.value.toISOString()
            : undefined,
      },
    });

    // Create blob and download
    const isJson = selectedFormat.value === "json";
    const content = isJson ? JSON.stringify(response, null, 2) : response;
    const blob = new Blob([content as string], {
      type: isJson ? "application/json" : "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_${new Date().toISOString().split("T")[0]}.${selectedFormat.value}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Export téléchargé avec succès");
  } catch (err: any) {
    console.error("Export error:", err);
    toast.error(err.data?.statusMessage || "Erreur lors de l'export");
  } finally {
    isExporting.value = false;
  }
};

onMounted(() => {
  fetchCounts();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Export de données</h1>
        <p class="text-muted-foreground">
          Exporter les inscriptions et données en CSV ou JSON
        </p>
      </div>
      <Button
        class="rounded-full"
        @click="handleExport"
        :disabled="isExporting || !selectedCategories.length"
      >
        <Icon
          v-if="isExporting"
          name="lucide:loader-2"
          class="h-4 w-4 animate-spin"
        />
        <Icon v-else name="lucide:download" class="h-4 w-4" />
        {{ isExporting ? "Export en cours..." : "Exporter" }}
      </Button>
    </div>

    <!-- Data Selection -->
    <div>
      <h2 class="text-sm font-medium text-muted-foreground mb-3">
        Données à exporter
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="cat in dataCategories"
          :key="cat.id"
          @click="cat.selected = !cat.selected"
          :class="[
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            cat.selected
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50',
          ]"
        >
          <div
            :class="[
              'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
              cat.selected ? 'bg-primary/10' : 'bg-muted',
            ]"
          >
            <Icon
              :name="cat.icon"
              :class="[
                'h-4 w-4',
                cat.selected ? 'text-primary' : 'text-muted-foreground',
              ]"
            />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ cat.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ cat.count }} entrées
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Format Selection -->
    <div>
      <h2 class="text-sm font-medium text-muted-foreground mb-3">
        Format d'export
      </h2>
      <div class="flex gap-3">
        <div
          v-for="format in exportFormats"
          :key="format.id"
          @click="selectedFormat = format.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors',
            selectedFormat === format.id
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50',
          ]"
        >
          <Icon
            :name="format.icon"
            :class="[
              'h-5 w-5',
              selectedFormat === format.id
                ? 'text-primary'
                : 'text-muted-foreground',
            ]"
          />
          <div>
            <p class="text-sm font-medium">{{ format.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ format.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Options -->
    <div>
      <h2 class="text-sm font-medium text-muted-foreground mb-3">Options</h2>
      <div class="border rounded-lg divide-y bg-card">
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium">Inclure les en-têtes</p>
            <p class="text-xs text-muted-foreground">
              Ajouter les noms de colonnes
            </p>
          </div>
          <Switch v-model="includeHeaders" />
        </div>
        <div class="px-4 py-3 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Filtrer par date</p>
              <p class="text-xs text-muted-foreground">
                Exporter seulement une période
              </p>
            </div>
            <Switch v-model="filterByDate" />
          </div>
          <div v-if="filterByDate" class="grid grid-cols-2 gap-4 pt-1">
            <div class="space-y-1.5">
              <Label class="text-xs">Date de début</Label>
              <DatePicker v-model="startDate" placeholder="Début" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs">Date de fin</Label>
              <DatePicker v-model="endDate" placeholder="Fin" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium">Anonymiser les données</p>
            <p class="text-xs text-muted-foreground">
              Masquer les informations personnelles
            </p>
          </div>
          <Switch v-model="anonymize" />
        </div>
      </div>
    </div>
  </div>
</template>
