<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  meals?: any[];
  activities?: any[];
}

const router = useRouter();

// Fetch registrations (paginated server-side, fetch all for client-side filtering)
const { data: registrationsResponse, status } = await useFetch<{
  items: Registration[];
  total: number;
}>("/api/registrations", { query: { pageSize: 200 } });
const registrations = computed(() => registrationsResponse.value?.items ?? []);

// Search and filters
const searchQuery = ref("");
const statusFilter = ref<string | null>(null);
const checkinFilter = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const confirmedCount = computed(
  () =>
    (registrations.value || []).filter((r) => r.status === "CONFIRMED").length,
);
const presentCount = computed(
  () =>
    (registrations.value || []).filter(
      (r) => r.status === "CONFIRMED" && r.checkedIn,
    ).length,
);

const filteredRegistrations = computed(() => {
  let result = registrations.value || [];

  if (statusFilter.value) {
    result = result.filter((r) => r.status === statusFilter.value);
  }

  if (checkinFilter.value === "present") {
    result = result.filter((r) => r.checkedIn);
  } else if (checkinFilter.value === "absent") {
    result = result.filter((r) => !r.checkedIn);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.firstName.toLowerCase().includes(query) ||
        r.lastName.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query),
    );
  }

  return result;
});

// Reset to page 1 when filters change
watch([searchQuery, statusFilter, checkinFilter], () => {
  currentPage.value = 1;
});

const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredRegistrations.value.slice(start, start + itemsPerPage);
});

function goToDetail(id: string) {
  router.push(`/admin/inscriptions/${id}`);
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Inscriptions</h1>
        <p class="text-muted-foreground">
          Gestion des inscriptions à l'événement ·
          <span class="text-foreground font-medium"
            >{{ presentCount }}/{{ confirmedCount }}</span
          >
          présents
        </p>
      </div>
      <Button variant="outline" class="rounded-full">
        <Icon name="lucide:download" class="h-4 w-4" />
        Exporter
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <Select v-model="statusFilter">
        <SelectTrigger class="w-44 rounded-full bg-card">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="null">Tous les statuts</SelectItem>
          <SelectItem value="CONFIRMED">Confirmé</SelectItem>
          <SelectItem value="PENDING">En attente</SelectItem>
          <SelectItem value="CANCELLED">Annulé</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="checkinFilter">
        <SelectTrigger class="w-44 rounded-full bg-card">
          <SelectValue placeholder="Tous" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="null">Tous</SelectItem>
          <SelectItem value="present">Présents</SelectItem>
          <SelectItem value="absent">Absents</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Table -->
    <div v-else class="overflow-hidden border-0">
      <!-- Table Header -->
      <div
        class="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground"
      >
        <div class="col-span-4">Participant</div>
        <div class="col-span-2">Date</div>
        <div class="col-span-2">Statut</div>
        <div class="col-span-2">Présence</div>
        <div class="col-span-2 text-right">Montant</div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRegistrations.length === 0" class="text-center py-16">
        <Icon
          name="lucide:inbox"
          class="h-12 w-12 mx-auto text-muted-foreground/30 mb-4"
        />
        <p class="text-muted-foreground">Aucune inscription trouvée</p>
      </div>

      <!-- Table Rows -->
      <div
        v-for="reg in paginatedRegistrations"
        :key="reg.id"
        class="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-colors hover:bg-muted/50 border-t border-border/50"
        @click="goToDetail(reg.id)"
      >
        <div class="col-span-4 flex items-center gap-3">
          <Avatar class="h-9 w-9">
            <AvatarImage :src="avatarUrl(`${reg.firstName} ${reg.lastName}`)" />
            <AvatarFallback class="bg-muted text-foreground text-xs">
              {{ reg.firstName?.charAt(0) }}{{ reg.lastName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <span class="text-sm truncate">{{ reg.email }}</span>
        </div>
        <div class="col-span-2 text-sm text-muted-foreground">
          {{ formatDate(reg.createdAt) }}
        </div>
        <div class="col-span-2">
          <Badge :class="['rounded-full text-xs', statusColors[reg.status]]">
            {{ statusLabels[reg.status] }}
          </Badge>
        </div>
        <div class="col-span-2">
          <Badge
            v-if="reg.checkedIn"
            class="rounded-full text-xs bg-green-500/10 text-green-600 dark:text-green-400"
          >
            <Icon name="lucide:check-circle" class="h-3 w-3 mr-1" />
            Présent
          </Badge>
          <span v-else class="text-xs text-muted-foreground">—</span>
        </div>
        <div class="col-span-2 text-right text-sm font-medium">
          {{ Number(reg.totalPrice).toFixed(2) }} €
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredRegistrations.length > itemsPerPage"
        class="flex items-center justify-between pt-4"
      >
        <p class="text-sm text-muted-foreground">
          {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
            Math.min(currentPage * itemsPerPage, filteredRegistrations.length)
          }}
          sur {{ filteredRegistrations.length }} inscription(s)
        </p>
        <Pagination
          v-model:page="currentPage"
          :total="filteredRegistrations.length"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          show-edges
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === currentPage"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else :index="index" />
            </template>
            <PaginationNext />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>
</template>
