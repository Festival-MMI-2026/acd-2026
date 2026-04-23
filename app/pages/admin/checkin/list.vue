<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({ layout: "admin" });

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  iutId: string | null;
}

const { data: registrationsResponse, refresh } = await useFetch<{
  items: Registration[];
  total: number;
}>("/api/registrations", { query: { pageSize: 200 } });

// ── Filters ────────────────────────────────────────────────────────
const searchQuery = ref("");
const presenceFilter = ref<"all" | "present" | "absent">("all");
const currentPage = ref(1);
const itemsPerPage = 20;

// Only CONFIRMED registrations are relevant for check-in
const confirmed = computed(() =>
  (registrationsResponse.value?.items || []).filter(
    (r) => r.status === "CONFIRMED",
  ),
);

const stats = computed(() => {
  const total = confirmed.value.length;
  const present = confirmed.value.filter((r) => r.checkedIn).length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent: total - present, percentage };
});

const filtered = computed(() => {
  let list = confirmed.value;

  if (presenceFilter.value === "present")
    list = list.filter((r) => r.checkedIn);
  else if (presenceFilter.value === "absent")
    list = list.filter((r) => !r.checkedIn);

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }

  // Present first, then absent; within each group alphabetically
  return [...list].sort((a, b) => {
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1;
    return a.lastName.localeCompare(b.lastName);
  });
});

watch([searchQuery, presenceFilter], () => {
  currentPage.value = 1;
});

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filtered.value.slice(start, start + itemsPerPage);
});

// ── Check-in toggle ────────────────────────────────────────────────
const loadingId = ref<string | null>(null);

async function toggleCheckin(reg: Registration) {
  loadingId.value = reg.id;
  const newValue = !reg.checkedIn;
  try {
    await $fetch(`/api/registrations/${reg.id}/checkin`, {
      method: "PATCH",
      body: { checkedIn: newValue },
    });
    toast.success(
      newValue
        ? `${reg.firstName} ${reg.lastName} — Présence confirmée`
        : "Check-in annulé",
    );
    await refresh();
  } catch {
    toast.error("Erreur lors du check-in");
  } finally {
    loadingId.value = null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function formatCheckinTime(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- ── Header ── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Participants</h1>
        <p class="text-muted-foreground text-sm">
          Liste des participants confirmés
        </p>
      </div>

      <!-- Stats pill -->
      <div class="flex items-center gap-3 shrink-0">
        <div
          class="flex items-center gap-2 rounded-full border bg-card px-4 py-2"
        >
          <div class="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-700"
              :style="{ width: `${stats.percentage}%` }"
            />
          </div>
          <span class="text-sm font-medium tabular-nums">
            {{ stats.present }} / {{ stats.total }}
          </span>
          <span class="text-xs text-muted-foreground">présents</span>
        </div>
      </div>
    </div>

    <!-- ── Stat cards ── -->
    <div class="grid grid-cols-3 gap-4">
      <Item variant="outline" class="rounded-xl flex-col items-start">
        <ItemContent>
          <ItemTitle class="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Total
          </ItemTitle>
          <p class="text-3xl font-bold tabular-nums">{{ stats.total }}</p>
        </ItemContent>
      </Item>
      <Item variant="outline" class="rounded-xl flex-col items-start">
        <ItemContent>
          <ItemTitle class="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Présents
          </ItemTitle>
          <p class="text-3xl font-bold tabular-nums text-primary">{{ stats.present }}</p>
        </ItemContent>
      </Item>
      <Item variant="outline" class="rounded-xl flex-col items-start">
        <ItemContent>
          <ItemTitle class="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Absents
          </ItemTitle>
          <p class="text-3xl font-bold tabular-nums text-muted-foreground">{{ stats.absent }}</p>
        </ItemContent>
      </Item>
    </div>

    <!-- ── Filters ── -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- Search -->
      <div class="relative flex-1 min-w-48">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher un participant…"
          class="pl-9 rounded-full bg-card"
        />
      </div>

      <!-- Presence filter tabs -->
      <div class="flex items-center rounded-full border bg-card p-1 gap-1">
        <button
          v-for="tab in [
            { value: 'all', label: 'Tous', count: stats.total },
            { value: 'present', label: 'Présents', count: stats.present },
            { value: 'absent', label: 'Absents', count: stats.absent },
          ]"
          :key="tab.value"
          class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all"
          :class="
            presenceFilter === tab.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="presenceFilter = tab.value as 'all' | 'present' | 'absent'"
        >
          {{ tab.label }}
          <span
            class="text-xs tabular-nums"
            :class="
              presenceFilter === tab.value
                ? 'opacity-75'
                : 'text-muted-foreground'
            "
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── List ── -->
    <div class="overflow-hidden rounded-xl border bg-card">
      <!-- Empty state -->
      <div
        v-if="filtered.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3"
      >
        <Icon name="lucide:users" class="h-10 w-10 text-muted-foreground/30" />
        <p class="text-sm text-muted-foreground">Aucun participant trouvé</p>
      </div>

      <!-- Header row -->
      <div
        v-else
        class="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b"
      >
        <div class="col-span-5">Participant</div>
        <div class="col-span-3">Check-in</div>
        <div class="col-span-2">Contact</div>
        <div class="col-span-2 text-right">Action</div>
      </div>

      <!-- Rows -->
      <div
        v-for="reg in paginated"
        :key="reg.id"
        class="grid grid-cols-12 gap-4 px-5 py-3.5 items-center border-b last:border-0 transition-colors hover:bg-muted/30"
      >
        <!-- Participant -->
        <div class="col-span-5 flex items-center gap-3 min-w-0 py-2">
          <Avatar class="h-9 w-9 shrink-0">
            <AvatarImage :src="avatarUrl(`${reg.firstName} ${reg.lastName}`)" />
            <AvatarFallback
              class="text-xs font-semibold"
              :class="
                reg.checkedIn
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              "
            >
              {{ reg.firstName?.charAt(0) }}{{ reg.lastName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">
              {{ reg.firstName }} {{ reg.lastName }}
            </p>
            <p class="text-xs text-muted-foreground truncate">
              {{ reg.email }}
            </p>
          </div>
        </div>

        <!-- Check-in status -->
        <div class="col-span-3">
          <template v-if="reg.checkedIn">
            <Badge
              class="rounded-full bg-primary/10 text-primary border-0 text-xs font-medium gap-1"
            >
              <Icon name="lucide:check-circle" class="h-3 w-3" />
              Présent
            </Badge>
            <p
              v-if="reg.checkedInAt"
              class="text-xs text-muted-foreground mt-0.5"
            >
              {{ formatCheckinTime(reg.checkedInAt) }}
            </p>
          </template>
          <Badge
            v-else
            class="rounded-full bg-muted text-muted-foreground border-0 text-xs font-medium gap-1"
          >
            <Icon name="lucide:circle" class="h-3 w-3" />
            Absent
          </Badge>
        </div>

        <!-- Phone -->
        <div class="col-span-2 text-xs text-muted-foreground truncate">
          {{ reg.phone || "—" }}
        </div>

        <!-- Toggle button -->
        <div class="col-span-2 flex justify-end">
          <Button
            :variant="reg.checkedIn ? 'outline' : 'default'"
            size="sm"
            class="rounded-full h-8 text-xs px-3"
            :disabled="loadingId === reg.id"
            @click="toggleCheckin(reg)"
          >
            <Icon
              v-if="loadingId === reg.id"
              name="lucide:loader-2"
              class="h-3 w-3 animate-spin"
            />
            <Icon
              v-else-if="reg.checkedIn"
              name="lucide:rotate-ccw"
              class="h-3 w-3"
            />
            <Icon v-else name="lucide:check" class="h-3 w-3" />
            {{ reg.checkedIn ? "Annuler" : "Check-in" }}
          </Button>
        </div>
      </div>
    </div>

    <!-- ── Pagination ── -->
    <div
      v-if="filtered.length > itemsPerPage"
      class="flex items-center justify-between"
    >
      <p class="text-sm text-muted-foreground">
        {{ (currentPage - 1) * itemsPerPage + 1 }}–{{
          Math.min(currentPage * itemsPerPage, filtered.length)
        }}
        sur {{ filtered.length }}
      </p>
      <Pagination
        v-model:page="currentPage"
        :total="filtered.length"
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
</template>
