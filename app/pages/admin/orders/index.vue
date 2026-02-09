<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

interface Order {
  id: string;
  orderNumber: string;
  amount: number | string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  registration: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const router = useRouter();

const { data: orders, status } = await useFetch<Order[]>("/api/orders");

const searchQuery = ref("");
const statusFilter = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredOrders = computed(() => {
  let result = orders.value || [];

  if (statusFilter.value) {
    result = result.filter((o) => o.paymentStatus === statusFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.registration.email.toLowerCase().includes(query) ||
        o.registration.firstName.toLowerCase().includes(query) ||
        o.registration.lastName.toLowerCase().includes(query),
    );
  }

  return result;
});

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredOrders.value.slice(start, start + itemsPerPage);
});

function goToDetail(id: string) {
  router.push(`/admin/orders/${id}`);
}

const paymentStatusColors: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  REFUNDED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const paymentStatusLabels: Record<string, string> = {
  PAID: "Payé",
  PENDING: "En attente",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
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
        <h1 class="text-2xl font-bold tracking-tight">Paiements</h1>
        <p class="text-muted-foreground">Suivi des paiements</p>
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
          <SelectItem value="PAID">Payé</SelectItem>
          <SelectItem value="PENDING">En attente</SelectItem>
          <SelectItem value="FAILED">Échoué</SelectItem>
          <SelectItem value="REFUNDED">Remboursé</SelectItem>
        </SelectContent>
      </Select>
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher..."
          class="pl-9 rounded-full bg-card"
        />
      </div>
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
        <div class="col-span-2">N° Paiement</div>
        <div class="col-span-4">Client</div>
        <div class="col-span-2">Date</div>
        <div class="col-span-2">Statut</div>
        <div class="col-span-2 text-right">Montant</div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-16">
        <Icon
          name="lucide:receipt"
          class="h-12 w-12 mx-auto text-muted-foreground/30 mb-4"
        />
        <p class="text-muted-foreground">Aucun paiement trouvé</p>
      </div>

      <!-- Table Rows -->
      <div
        v-for="order in paginatedOrders"
        :key="order.id"
        class="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer transition-colors hover:bg-muted/50 border-t border-border/50"
        @click="goToDetail(order.id)"
      >
        <div class="col-span-2">
          <code class="text-xs font-mono">{{ order.orderNumber }}</code>
        </div>
        <div class="col-span-4 flex items-center gap-3">
          <Avatar class="h-8 w-8">
            <AvatarFallback class="bg-muted text-foreground text-xs">
              {{ order.registration.firstName?.charAt(0)
              }}{{ order.registration.lastName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <span class="text-sm truncate">{{ order.registration.email }}</span>
        </div>
        <div class="col-span-2">
          <Badge variant="outline">{{ formatDate(order.createdAt) }}</Badge>
        </div>
        <div class="col-span-2">
          <Badge :class="[paymentStatusColors[order.paymentStatus]]">
            {{ paymentStatusLabels[order.paymentStatus] }}
          </Badge>
        </div>
        <div class="col-span-2 text-right text-sm font-medium">
          {{ Number(order.amount).toFixed(2) }} €
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredOrders.length > itemsPerPage"
        class="flex items-center justify-between pt-4"
      >
        <p class="text-sm text-muted-foreground">
          {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
            Math.min(currentPage * itemsPerPage, filteredOrders.length)
          }}
          sur {{ filteredOrders.length }} paiement(s)
        </p>
        <Pagination
          v-model:page="currentPage"
          :total="filteredOrders.length"
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
