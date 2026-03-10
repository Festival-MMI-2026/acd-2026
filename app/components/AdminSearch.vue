<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const open = defineModel<boolean>("open", { default: false });
const router = useRouter();

const searchQuery = ref("");
const isSearching = ref(false);
const inputRef = ref<HTMLInputElement>();

interface SearchResults {
  registrations: { id: string; firstName: string; lastName: string; email: string; status: string }[];
  orders: { id: string; orderNumber: string; amount: number; paymentStatus: string }[];
  activities: { id: string; name: string; date: string }[];
  meals: { id: string; name: string; date: string; mealType: string }[];
}

const results = ref<SearchResults>({
  registrations: [],
  orders: [],
  activities: [],
  meals: [],
});

const hasResults = computed(() =>
  results.value.registrations.length > 0 ||
  results.value.orders.length > 0 ||
  results.value.activities.length > 0 ||
  results.value.meals.length > 0
);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!val || val.trim().length < 2) {
    results.value = { registrations: [], orders: [], activities: [], meals: [] };
    isSearching.value = false;
    return;
  }
  isSearching.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch<SearchResults>("/api/search", {
        query: { q: val.trim() },
      });
      results.value = data;
    } catch {
      results.value = { registrations: [], orders: [], activities: [], meals: [] };
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

// Reset when dialog closes
watch(open, (val) => {
  if (!val) {
    searchQuery.value = "";
    results.value = { registrations: [], orders: [], activities: [], meals: [] };
    isSearching.value = false;
  } else {
    nextTick(() => inputRef.value?.focus());
  }
});

function navigate(path: string) {
  open.value = false;
  router.push(path);
}

// Keyboard shortcut ⌘K / Ctrl+K
function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    open.value = !open.value;
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="overflow-hidden p-0 max-w-lg gap-0">
      <DialogHeader class="sr-only">
        <DialogTitle>Recherche</DialogTitle>
        <DialogDescription>Recherche globale dans l'administration</DialogDescription>
      </DialogHeader>

      <!-- Search Input -->
      <div class="flex items-center gap-2 border-b px-3 h-11">
        <Icon name="lucide:search" class="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des inscriptions, paiements, activités…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Kbd v-if="!searchQuery" class="text-[10px]">ESC</Kbd>
      </div>

      <!-- Results -->
      <div class="max-h-80 overflow-y-auto">
        <!-- Loading -->
        <div
          v-if="isSearching"
          class="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground"
        >
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          Recherche…
        </div>

        <!-- Empty -->
        <div
          v-else-if="searchQuery.length >= 2 && !hasResults"
          class="flex flex-col items-center justify-center py-8 gap-1 text-sm text-muted-foreground"
        >
          <Icon name="lucide:search-x" class="h-5 w-5 mb-1" />
          Aucun résultat pour "{{ searchQuery }}"
        </div>

        <!-- Initial state -->
        <div
          v-else-if="searchQuery.length < 2 && !hasResults"
          class="flex flex-col items-center justify-center py-8 gap-2 text-sm text-muted-foreground"
        >
          <Icon name="lucide:search" class="h-5 w-5" />
          Tapez au moins 2 caractères…
        </div>

        <!-- Groups -->
        <template v-if="hasResults && !isSearching">
          <!-- Inscriptions -->
          <div v-if="results.registrations.length">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Inscriptions</p>
            <button
              v-for="reg in results.registrations"
              :key="reg.id"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              @click="navigate(`/admin/inscriptions/${reg.id}`)"
            >
              <Icon name="lucide:ticket" class="h-4 w-4 text-muted-foreground shrink-0" />
              <div class="flex-1 truncate text-left">
                <span class="font-medium">{{ reg.firstName }} {{ reg.lastName }}</span>
                <span class="text-muted-foreground ml-2 text-xs">{{ reg.email }}</span>
              </div>
              <Badge variant="outline" class="text-xs shrink-0">
                {{ statusLabels[reg.status] || reg.status }}
              </Badge>
            </button>
          </div>

          <!-- Separator -->
          <div v-if="results.registrations.length && results.orders.length" class="mx-3 my-1 h-px bg-border" />

          <!-- Paiements -->
          <div v-if="results.orders.length">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Paiements</p>
            <button
              v-for="order in results.orders"
              :key="order.id"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              @click="navigate(`/admin/orders/${order.id}`)"
            >
              <Icon name="lucide:receipt" class="h-4 w-4 text-muted-foreground shrink-0" />
              <span class="font-medium font-mono text-sm flex-1 text-left">{{ order.orderNumber }}</span>
              <Badge variant="outline" class="text-xs shrink-0">
                {{ statusLabels[order.paymentStatus] || order.paymentStatus }}
              </Badge>
            </button>
          </div>

          <!-- Separator -->
          <div v-if="(results.registrations.length || results.orders.length) && results.activities.length" class="mx-3 my-1 h-px bg-border" />

          <!-- Activités -->
          <div v-if="results.activities.length">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Activités</p>
            <button
              v-for="activity in results.activities"
              :key="activity.id"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              @click="navigate(`/admin/activites`)"
            >
              <Icon name="lucide:compass" class="h-4 w-4 text-muted-foreground shrink-0" />
              <span class="font-medium flex-1 text-left">{{ activity.name }}</span>
            </button>
          </div>

          <!-- Separator -->
          <div v-if="(results.registrations.length || results.orders.length || results.activities.length) && results.meals.length" class="mx-3 my-1 h-px bg-border" />

          <!-- Repas -->
          <div v-if="results.meals.length">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Repas</p>
            <button
              v-for="meal in results.meals"
              :key="meal.id"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              @click="navigate(`/admin/repas`)"
            >
              <Icon name="lucide:utensils" class="h-4 w-4 text-muted-foreground shrink-0" />
              <span class="font-medium flex-1 text-left">{{ meal.name }}</span>
              <Badge variant="outline" class="text-xs shrink-0">
                {{ meal.mealType === "LUNCH" ? "Déjeuner" : "Dîner" }}
              </Badge>
            </button>
          </div>
        </template>

        <!-- Bottom padding -->
        <div v-if="hasResults" class="h-1" />
      </div>
    </DialogContent>
  </Dialog>
</template>
