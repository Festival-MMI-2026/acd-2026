<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

const { data: logs, status } = await useFetch<AuditLog[]>("/api/audit-logs");

const actionFilter = ref<string | null>(null);

const filteredLogs = computed(() => {
  if (!actionFilter.value) return logs.value || [];
  return (logs.value || []).filter((l) => l.action === actionFilter.value);
});

const uniqueActions = computed(() => {
  const actions = new Set((logs.value || []).map((l) => l.action));
  return Array.from(actions).sort();
});

const actionConfig: Record<string, { icon: string; label: string; color: string }> = {
  // Registrations
  "registration.created": {
    icon: "lucide:user-plus",
    label: "Inscription créée",
    color: "text-green-500 bg-green-500/10",
  },
  "registration.updated": {
    icon: "lucide:user-pen",
    label: "Inscription modifiée",
    color: "text-blue-500 bg-blue-500/10",
  },
  "registration.status_changed": {
    icon: "lucide:refresh-cw",
    label: "Statut inscription modifié",
    color: "text-blue-500 bg-blue-500/10",
  },
  "registration.checkin": {
    icon: "lucide:scan-qr-code",
    label: "Check-in",
    color: "text-purple-500 bg-purple-500/10",
  },
  // Orders
  "order.status_changed": {
    icon: "lucide:credit-card",
    label: "Paiement mis à jour",
    color: "text-amber-500 bg-amber-500/10",
  },
  // Meals
  "meal.created": {
    icon: "lucide:utensils",
    label: "Repas créé",
    color: "text-green-500 bg-green-500/10",
  },
  "meal.updated": {
    icon: "lucide:utensils",
    label: "Repas modifié",
    color: "text-blue-500 bg-blue-500/10",
  },
  "meal.deleted": {
    icon: "lucide:utensils",
    label: "Repas supprimé",
    color: "text-red-500 bg-red-500/10",
  },
  // Activities
  "activity.created": {
    icon: "lucide:compass",
    label: "Activité créée",
    color: "text-green-500 bg-green-500/10",
  },
  "activity.updated": {
    icon: "lucide:compass",
    label: "Activité modifiée",
    color: "text-blue-500 bg-blue-500/10",
  },
  "activity.deleted": {
    icon: "lucide:compass",
    label: "Activité supprimée",
    color: "text-red-500 bg-red-500/10",
  },
  // Hotels
  "hotel.created": {
    icon: "lucide:hotel",
    label: "Hôtel créé",
    color: "text-green-500 bg-green-500/10",
  },
  "hotel.updated": {
    icon: "lucide:hotel",
    label: "Hôtel modifié",
    color: "text-blue-500 bg-blue-500/10",
  },
  "hotel.deleted": {
    icon: "lucide:hotel",
    label: "Hôtel supprimé",
    color: "text-red-500 bg-red-500/10",
  },
  // Events (Programme)
  "event.created": {
    icon: "lucide:calendar-plus",
    label: "Événement créé",
    color: "text-green-500 bg-green-500/10",
  },
  "event.updated": {
    icon: "lucide:calendar",
    label: "Événement modifié",
    color: "text-blue-500 bg-blue-500/10",
  },
  "event.deleted": {
    icon: "lucide:calendar-x",
    label: "Événement supprimé",
    color: "text-red-500 bg-red-500/10",
  },
  // Settings & System
  "settings.updated": {
    icon: "lucide:settings",
    label: "Paramètres modifiés",
    color: "text-slate-500 bg-slate-500/10",
  },
  "data.cleared": {
    icon: "lucide:trash-2",
    label: "Données supprimées",
    color: "text-red-600 bg-red-600/10",
  },
  // Users
  "user.updated": {
    icon: "lucide:user-cog",
    label: "Utilisateur modifié",
    color: "text-blue-500 bg-blue-500/10",
  },
};

function getActionInfo(action: string) {
  return (
    actionConfig[action] || {
      icon: "lucide:activity",
      label: action,
      color: "text-muted-foreground bg-muted",
    }
  );
}

function getEntityLink(entityType: string, entityId: string) {
  switch (entityType) {
    case "Registration":
      return `/admin/inscriptions/${entityId}`;
    case "Order":
      return `/admin/orders/${entityId}`;
    default:
      return null;
  }
}

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Journal d'activité</h1>
        <p class="text-muted-foreground">
          Historique des actions récentes ·
          <span class="text-foreground font-medium">{{
            filteredLogs.length
          }}</span>
          entrée{{ filteredLogs.length > 1 ? "s" : "" }}
        </p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-3">
      <Select v-model="actionFilter">
        <SelectTrigger class="w-56 rounded-full bg-card">
          <SelectValue placeholder="Toutes les actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="null">Toutes les actions</SelectItem>
          <SelectItem v-for="action in uniqueActions" :key="action" :value="action">
            {{ getActionInfo(action).label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 animate-spin text-muted-foreground"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="filteredLogs.length === 0"
      class="text-center py-16"
    >
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
      >
        <Icon
          name="lucide:scroll-text"
          class="h-7 w-7 text-muted-foreground"
        />
      </div>
      <p class="font-medium text-muted-foreground">Aucune activité enregistrée</p>
      <p class="mt-1 text-sm text-muted-foreground/70">
        Les actions apparaîtront ici au fur et à mesure
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-1">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="group flex items-start gap-4 px-4 py-3.5 rounded-xl transition-colors hover:bg-muted/50"
      >
        <!-- Icon -->
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          :class="getActionInfo(log.action).color"
        >
          <Icon
            :name="getActionInfo(log.action).icon"
            class="h-4 w-4"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium">
              {{ getActionInfo(log.action).label }}
            </p>
            <Badge variant="outline" class="text-xs font-normal shrink-0">
              {{ log.entityType }}
            </Badge>
          </div>

          <!-- Metadata -->
          <div
            v-if="log.metadata"
            class="text-xs text-muted-foreground space-y-0.5"
          >
            <p v-if="(log.metadata as any)?.name">
              {{ (log.metadata as any).name }}
            </p>
            <p v-if="(log.metadata as any)?.email">
              {{ (log.metadata as any).email }}
            </p>
            <p v-if="(log.metadata as any)?.oldStatus && (log.metadata as any)?.newStatus">
              {{ (log.metadata as any).oldStatus }} → {{ (log.metadata as any).newStatus }}
            </p>
          </div>

          <!-- Entity ID -->
          <NuxtLink
            v-if="getEntityLink(log.entityType, log.entityId)"
            :to="getEntityLink(log.entityType, log.entityId)!"
            class="text-xs text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
          >
            <Icon name="lucide:external-link" class="h-3 w-3" />
            Voir le détail
          </NuxtLink>
        </div>

        <!-- Time -->
        <div class="text-right shrink-0">
          <p class="text-xs text-muted-foreground">
            {{ formatRelativeTime(log.createdAt) }}
          </p>
          <p class="text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
            {{ formatFullDate(log.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
