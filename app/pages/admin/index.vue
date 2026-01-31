<script setup lang="ts">
import { useSession } from "~/lib/auth-client";

definePageMeta({
  layout: "admin",
});

const session = useSession();

// Fetch stats
const { data: registrations } = await useFetch("/api/registrations");
const { data: events } = await useFetch("/api/events");
const { data: meals } = await useFetch("/api/meals");
const { data: activities } = await useFetch("/api/activities");

const stats = computed(() => [
  {
    title: "Inscriptions",
    value: registrations.value?.length || 0,
    icon: "lucide:users",
    href: "/admin/inscriptions",
    description: "participants inscrits",
  },
  {
    title: "Événements",
    value: events.value?.length || 0,
    icon: "lucide:calendar",
    href: "/admin/programme",
    description: "au programme",
  },
  {
    title: "Repas",
    value: meals.value?.length || 0,
    icon: "lucide:utensils",
    href: "/admin/repas",
    description: "repas disponibles",
  },
  {
    title: "Activités",
    value: activities.value?.length || 0,
    icon: "lucide:activity",
    href: "/admin/activites",
    description: "activités proposées",
  },
]);

// Calculate total revenue
const totalRevenue = computed(() => {
  if (!registrations.value) return 0;
  return registrations.value.reduce((acc, r) => acc + Number(r.totalPrice), 0);
});

// Quick actions
const quickActions = [
  {
    title: "Ajouter un événement",
    icon: "lucide:plus",
    href: "/admin/programme",
  },
  { title: "Nouveau repas", icon: "lucide:utensils", href: "/admin/repas" },
  {
    title: "Nouvelle activité",
    icon: "lucide:activity",
    href: "/admin/activites",
  },
  {
    title: "Voir les paramètres",
    icon: "lucide:settings",
    href: "/admin/parametres",
  },
];
</script>

<template>
  <div class="max-w-6xl space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground mt-1">
          Bienvenue, {{ session.data?.user?.name || "Admin" }} 👋
        </p>
      </div>
      <Button class="rounded-full" as-child>
        <NuxtLink to="/admin/inscriptions">
          <Icon name="lucide:download" class="mr-2 h-4 w-4" />
          Exporter
        </NuxtLink>
      </Button>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.title"
        :to="stat.href"
        class="group"
      >
        <Card
          class="rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <CardContent class="pt-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-muted-foreground">{{ stat.title }}</p>
                <p class="text-4xl font-bold mt-2">{{ stat.value }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ stat.description }}
                </p>
              </div>
              <div
                class="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <Icon :name="stat.icon" class="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>

    <!-- Revenue + Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Revenue -->
      <Card class="rounded-2xl lg:col-span-2">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:euro" class="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Revenus totaux</CardTitle>
              <CardDescription>Montant total des inscriptions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-5xl font-bold">{{ totalRevenue.toFixed(2) }} €</p>
          <p class="text-sm text-muted-foreground mt-2">
            {{ registrations?.length || 0 }} inscriptions confirmées
          </p>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card class="rounded-2xl">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-2">
          <Button
            v-for="action in quickActions"
            :key="action.title"
            variant="outline"
            class="justify-start rounded-xl h-11"
            as-child
          >
            <NuxtLink :to="action.href">
              <Icon :name="action.icon" class="mr-3 h-4 w-4" />
              {{ action.title }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Recent registrations -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Dernières inscriptions</CardTitle>
            <CardDescription
              >Les 5 dernières inscriptions reçues</CardDescription
            >
          </div>
          <Button variant="outline" class="rounded-full" as-child>
            <NuxtLink to="/admin/inscriptions">
              Voir tout
              <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
            </NuxtLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          v-if="!registrations || registrations.length === 0"
          class="text-center py-12"
        >
          <Icon
            name="lucide:inbox"
            class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"
          />
          <p class="text-muted-foreground">Aucune inscription pour le moment</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Participant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="registration in registrations.slice(0, 5)"
              :key="registration.id"
              class="cursor-pointer"
            >
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="h-9 w-9">
                    <AvatarFallback
                      class="bg-foreground text-background text-sm"
                    >
                      {{ registration.firstName.charAt(0)
                      }}{{ registration.lastName.charAt(0) }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-medium">
                      {{ registration.firstName }} {{ registration.lastName }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ registration.email }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{
                  new Date(registration.createdAt).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
              </TableCell>
              <TableCell>
                <Badge
                  :class="[
                    'rounded-full',
                    registration.status === 'CONFIRMED'
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      : registration.status === 'CANCELLED'
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
                  ]"
                >
                  {{
                    registration.status === "CONFIRMED"
                      ? "Confirmé"
                      : registration.status === "CANCELLED"
                        ? "Annulé"
                        : "En attente"
                  }}
                </Badge>
              </TableCell>
              <TableCell class="text-right font-semibold">
                {{ Number(registration.totalPrice).toFixed(2) }} €
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
