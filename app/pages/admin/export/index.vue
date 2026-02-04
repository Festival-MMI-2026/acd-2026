<script setup lang="ts">
import { DatePicker } from "@/components/ui/date-picker";

definePageMeta({
  layout: "admin",
});

const filterByDate = ref(false);
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

const exportFormats = [
  {
    id: "csv",
    name: "CSV",
    icon: "lucide:file-text",
    description: "Format texte universel",
  },
  {
    id: "xlsx",
    name: "Excel",
    icon: "lucide:file-spreadsheet",
    description: "Format Microsoft Excel",
  },
  {
    id: "pdf",
    name: "PDF",
    icon: "lucide:file",
    description: "Document imprimable",
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
    count: 142,
    icon: "lucide:users",
    selected: true,
  },
  {
    id: "events",
    name: "Événements",
    count: 12,
    icon: "lucide:calendar",
    selected: false,
  },
  {
    id: "meals",
    name: "Repas",
    count: 4,
    icon: "lucide:utensils",
    selected: false,
  },
  {
    id: "activities",
    name: "Activités",
    count: 8,
    icon: "lucide:activity",
    selected: false,
  },
]);

const selectedFormat = ref("csv");

const recentExports = ref([
  {
    id: 1,
    name: "inscriptions_20260204.csv",
    date: "2026-02-04T14:30:00",
    size: "45 KB",
    category: "Inscriptions",
  },
  {
    id: 2,
    name: "programme_complet.xlsx",
    date: "2026-02-03T10:15:00",
    size: "128 KB",
    category: "Programme",
  },
  {
    id: 3,
    name: "statistiques_janvier.pdf",
    date: "2026-02-01T16:45:00",
    size: "256 KB",
    category: "Statistiques",
  },
]);
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Export de données</h1>
        <p class="text-muted-foreground">
          Exporter les inscriptions et données en CSV/Excel
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Export Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Data Selection -->
        <Card class="rounded-2xl">
          <CardHeader>
            <CardTitle>Données à exporter</CardTitle>
            <CardDescription
              >Sélectionnez les catégories de données</CardDescription
            >
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="cat in dataCategories"
                :key="cat.id"
                @click="cat.selected = !cat.selected"
                :class="[
                  'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  cat.selected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/50 hover:bg-muted',
                ]"
              >
                <div
                  :class="[
                    'h-10 w-10 rounded-xl flex items-center justify-center',
                    cat.selected ? 'bg-primary/10' : 'bg-background',
                  ]"
                >
                  <Icon
                    :name="cat.icon"
                    :class="[
                      'h-5 w-5',
                      cat.selected ? 'text-primary' : 'text-muted-foreground',
                    ]"
                  />
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ cat.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ cat.count }} entrées
                  </p>
                </div>
                <Icon
                  :name="cat.selected ? 'lucide:check-circle' : 'lucide:circle'"
                  :class="[
                    'h-5 w-5',
                    cat.selected ? 'text-primary' : 'text-muted-foreground/30',
                  ]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Format Selection -->
        <Card class="rounded-2xl">
          <CardHeader>
            <CardTitle>Format d'export</CardTitle>
            <CardDescription>Choisissez le format de fichier</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="format in exportFormats"
                :key="format.id"
                @click="selectedFormat = format.id"
                :class="[
                  'text-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                  selectedFormat === format.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/50 hover:bg-muted',
                ]"
              >
                <Icon
                  :name="format.icon"
                  :class="[
                    'h-8 w-8 mx-auto mb-2',
                    selectedFormat === format.id
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  ]"
                />
                <p class="font-medium text-sm">{{ format.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ format.description }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Export Options -->
        <Card class="rounded-2xl">
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Inclure les en-têtes</p>
                <p class="text-sm text-muted-foreground">
                  Ajouter les noms de colonnes
                </p>
              </div>
              <Switch :default-checked="true" />
            </div>
            <Separator />
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Filtrer par date</p>
                  <p class="text-sm text-muted-foreground">
                    Exporter seulement une période
                  </p>
                </div>
                <Switch v-model:checked="filterByDate" />
              </div>
              <div v-if="filterByDate" class="grid grid-cols-2 gap-4 pt-2">
                <div class="space-y-2">
                  <Label class="text-xs">Date de début</Label>
                  <DatePicker v-model="startDate" placeholder="Début" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs">Date de fin</Label>
                  <DatePicker v-model="endDate" placeholder="Fin" />
                </div>
              </div>
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Anonymiser les données</p>
                <p class="text-sm text-muted-foreground">
                  Masquer les informations personnelles
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
          <CardFooter>
            <Button class="w-full rounded-full" size="lg">
              <Icon name="lucide:download" class="mr-2 h-4 w-4" />
              Exporter les données
            </Button>
          </CardFooter>
        </Card>
      </div>

      <!-- Recent Exports -->
      <div>
        <Card class="rounded-2xl">
          <CardHeader>
            <CardTitle>Exports récents</CardTitle>
            <CardDescription
              >Téléchargez vos exports précédents</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="exp in recentExports"
              :key="exp.id"
              class="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Icon name="lucide:file" class="h-8 w-8 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ exp.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ exp.size }} •
                  {{ new Date(exp.date).toLocaleDateString("fr-FR") }}
                </p>
              </div>
              <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <Icon name="lucide:download" class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
