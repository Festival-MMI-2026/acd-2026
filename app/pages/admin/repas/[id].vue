<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();

interface MealOption {
  id: string;
  name: string;
  optionType: "STARTER" | "MAIN" | "CHEESE" | "DESSERT";
  hasAllergens: boolean;
  allergens: string[];
}

interface MealData {
  id: string;
  name: string;
  date: string;
  mealType: "LUNCH" | "DINNER";
  price: number | string;
  options: MealOption[];
}

const { data: meal, refresh } = await useFetch<MealData>(
  `/api/meals/${route.params.id}`,
);

const isLoading = ref(false);

// Option form state
const showOptionForm = ref(false);
const editingOption = ref<MealOption | null>(null);
const hasAllergensEnabled = ref(false);
const optionForm = reactive({
  name: "",
  optionType: "STARTER" as "STARTER" | "MAIN" | "CHEESE" | "DESSERT",
  allergens: [] as string[],
});

const allergenOptions = Object.entries(ALLERGEN_MAP).map(([value, info]) => ({
  value,
  label: info.label,
}));

const optionTypeLabels: Record<string, string> = {
  STARTER: "Entrée",
  MAIN: "Plat",
  CHEESE: "Fromage",
  DESSERT: "Dessert",
};

const mealTypeLabels: Record<string, string> = {
  LUNCH: "Déjeuner",
  DINNER: "Dîner",
};

// Group options by type
const starterOptions = computed(
  () => meal.value?.options.filter((o) => o.optionType === "STARTER") || [],
);
const mainOptions = computed(
  () => meal.value?.options.filter((o) => o.optionType === "MAIN") || [],
);
const cheeseOptions = computed(
  () => meal.value?.options.filter((o) => o.optionType === "CHEESE") || [],
);
const dessertOptions = computed(
  () => meal.value?.options.filter((o) => o.optionType === "DESSERT") || [],
);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function openAddOption(type: "STARTER" | "MAIN" | "CHEESE" | "DESSERT") {
  editingOption.value = null;
  optionForm.name = "";
  optionForm.optionType = type;
  hasAllergensEnabled.value = false;
  optionForm.allergens = [];
  showOptionForm.value = true;
}

function openEditOption(option: MealOption) {
  editingOption.value = option;
  optionForm.name = option.name;
  optionForm.optionType = option.optionType;
  hasAllergensEnabled.value = option.hasAllergens;
  optionForm.allergens = option.allergens || [];
  showOptionForm.value = true;
}

function toggleAllergen(allergen: string) {
  const index = optionForm.allergens.indexOf(allergen);
  if (index > -1) {
    optionForm.allergens.splice(index, 1);
  } else {
    optionForm.allergens.push(allergen);
  }
}

async function saveOption() {
  if (!optionForm.name || !meal.value) {
    toast.error("Le nom est requis");
    return;
  }

  isLoading.value = true;

  try {
    if (editingOption.value) {
      await $fetch(
        `/api/meals/${meal.value.id}/options/${editingOption.value.id}`,
        {
          method: "PUT",
          body: { ...optionForm, hasAllergens: hasAllergensEnabled.value },
        },
      );
      toast.success("Option modifiée");
    } else {
      await $fetch(`/api/meals/${meal.value.id}/options`, {
        method: "POST",
        body: { ...optionForm, hasAllergens: hasAllergensEnabled.value },
      });
      toast.success("Option ajoutée");
    }

    showOptionForm.value = false;
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Une erreur est survenue");
  } finally {
    isLoading.value = false;
  }
}

// Delete confirmation state
const showDeleteDialog = ref(false);
const optionToDelete = ref<MealOption | null>(null);

function confirmDeleteOption(option: MealOption) {
  optionToDelete.value = option;
  showDeleteDialog.value = true;
}

async function executeDeleteOption() {
  if (!meal.value || !optionToDelete.value) return;

  isLoading.value = true;

  try {
    await $fetch(
      `/api/meals/${meal.value.id}/options/${optionToDelete.value.id}`,
      {
        method: "DELETE",
      },
    );
    toast.success("Option supprimée");
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Une erreur est survenue");
  } finally {
    isLoading.value = false;
    showDeleteDialog.value = false;
    optionToDelete.value = null;
  }
}
</script>

<template>
  <div v-if="meal" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="router.push('/admin/repas')"
        >
          <Icon name="lucide:arrow-left" class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold">{{ meal.name }}</h1>
          <p class="text-muted-foreground">
            {{ formatDate(meal.date) }} • {{ mealTypeLabels[meal.mealType] }} •
            {{ Number(meal.price).toFixed(2) }} €
          </p>
        </div>
      </div>
    </div>

    <!-- Options sections -->
    <div class="grid gap-6">
      <!-- Starters -->
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle class="text-lg">Entrées</CardTitle>
            <CardDescription
              >{{ starterOptions.length }} / 3 options</CardDescription
            >
          </div>
          <Button
            v-if="starterOptions.length < 3"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="openAddOption('STARTER')"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div
            v-if="starterOptions.length === 0"
            class="text-center py-6 text-muted-foreground"
          >
            Aucune entrée
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="option in starterOptions"
              :key="option.id"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="flex items-center gap-3">
                <span class="font-medium">{{ option.name }}</span>
                <div
                  v-if="option.hasAllergens && option.allergens.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="allergen in option.allergens"
                    :key="allergen"
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getAllergenInfo(allergen).badgeClass"
                  >
                    <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                    {{ getAllergenInfo(allergen).label }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openEditOption(option)"
                >
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive"
                  @click="confirmDeleteOption(option)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Mains -->
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle class="text-lg">Plats</CardTitle>
            <CardDescription
              >{{ mainOptions.length }} / 3 options</CardDescription
            >
          </div>
          <Button
            v-if="mainOptions.length < 3"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="openAddOption('MAIN')"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div
            v-if="mainOptions.length === 0"
            class="text-center py-6 text-muted-foreground"
          >
            Aucun plat
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="option in mainOptions"
              :key="option.id"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="flex items-center gap-3">
                <span class="font-medium">{{ option.name }}</span>
                <div
                  v-if="option.hasAllergens && option.allergens.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="allergen in option.allergens"
                    :key="allergen"
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getAllergenInfo(allergen).badgeClass"
                  >
                    <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                    {{ getAllergenInfo(allergen).label }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openEditOption(option)"
                >
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive"
                  @click="confirmDeleteOption(option)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Cheeses -->
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle class="text-lg">Fromages</CardTitle>
            <CardDescription
              >{{ cheeseOptions.length }} / 3 options</CardDescription
            >
          </div>
          <Button
            v-if="cheeseOptions.length < 3"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="openAddOption('CHEESE')"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div
            v-if="cheeseOptions.length === 0"
            class="text-center py-6 text-muted-foreground"
          >
            Aucun fromage
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="option in cheeseOptions"
              :key="option.id"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="flex items-center gap-3">
                <span class="font-medium">{{ option.name }}</span>
                <div
                  v-if="option.hasAllergens && option.allergens.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="allergen in option.allergens"
                    :key="allergen"
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getAllergenInfo(allergen).badgeClass"
                  >
                    <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                    {{ getAllergenInfo(allergen).label }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openEditOption(option)"
                >
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive"
                  @click="confirmDeleteOption(option)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Desserts -->
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle class="text-lg">Desserts</CardTitle>
            <CardDescription
              >{{ dessertOptions.length }} / 3 options</CardDescription
            >
          </div>
          <Button
            v-if="dessertOptions.length < 3"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="openAddOption('DESSERT')"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div
            v-if="dessertOptions.length === 0"
            class="text-center py-6 text-muted-foreground"
          >
            Aucun dessert
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="option in dessertOptions"
              :key="option.id"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="flex items-center gap-3">
                <span class="font-medium">{{ option.name }}</span>
                <div
                  v-if="option.hasAllergens && option.allergens.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="allergen in option.allergens"
                    :key="allergen"
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getAllergenInfo(allergen).badgeClass"
                  >
                    <Icon :name="getAllergenInfo(allergen).icon" class="h-3 w-3 shrink-0" />
                    {{ getAllergenInfo(allergen).label }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openEditOption(option)"
                >
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive"
                  @click="confirmDeleteOption(option)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Option form dialog -->
    <Dialog :open="showOptionForm" @update:open="showOptionForm = $event">
      <DialogContent class="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {{ editingOption ? "Modifier" : "Ajouter" }} une
            {{ optionTypeLabels[optionForm.optionType]?.toLowerCase() }}
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent class="space-y-4">
          <div class="space-y-2">
            <Label for="optionName">Nom *</Label>
            <Input
              id="optionName"
              v-model="optionForm.name"
              placeholder="Salade César..."
            />
          </div>

          <div class="flex flex-col gap-3 border p-3 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Allergènes</Label>
                <p class="text-sm text-muted-foreground">
                  Ce plat contient-il des allergènes ?
                </p>
              </div>
              <Button
                type="button"
                :variant="hasAllergensEnabled ? 'default' : 'outline'"
                @click="hasAllergensEnabled = !hasAllergensEnabled"
              >
                {{ hasAllergensEnabled ? "Oui" : "Non" }}
              </Button>
            </div>

            <div v-if="hasAllergensEnabled" class="space-y-2 pt-2 border-t">
              <Label>Sélectionnez les allergènes</Label>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="allergen in allergenOptions"
                  :key="allergen.value"
                  type="button"
                  size="sm"
                  :variant="
                    optionForm.allergens.includes(allergen.value)
                      ? 'default'
                      : 'outline'
                  "
                  class="rounded-full gap-1"
                  @click="toggleAllergen(allergen.value)"
                >
                  <Icon :name="getAllergenInfo(allergen.value).icon" class="h-3 w-3" />
                  {{ allergen.label }}
                </Button>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            @click="showOptionForm = false"
            :disabled="isLoading"
          >
            Annuler
          </Button>
          <Button @click="saveOption" :disabled="isLoading">
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ editingOption ? "Enregistrer" : "Ajouter" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement
            l'option "{{ optionToDelete?.name }}" de ce repas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false"
            >Annuler</AlertDialogCancel
          >
          <AlertDialogAction
            @click="executeDeleteOption"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-24">
    <Icon
      name="lucide:loader-2"
      class="h-8 w-8 animate-spin text-muted-foreground"
    />
  </div>
</template>
