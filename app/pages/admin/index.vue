<script setup lang="ts">
import { useSession } from "~/lib/auth-client";
import type { ChartConfig } from "@/components/ui/chart";
import {
  VisArea,
  VisAxis,
  VisGroupedBar,
  VisLine,
  VisXYContainer,
} from "@unovis/vue";
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

definePageMeta({
  layout: "admin",
});

const session = useSession();

// Fetch stats (paginate, pageSize large enough for dashboard recent list)
const { data: registrationsResponse } = await useFetch<{
  items: any[];
  total: number;
}>("/api/registrations", { query: { pageSize: 20 } });
const registrations = computed(() => registrationsResponse.value?.items ?? []);
const registrationsTotal = computed(
  () => registrationsResponse.value?.total ?? 0,
);
const { data: events } = await useFetch("/api/events");
const { data: meals } = await useFetch("/api/meals");
const { data: activities } = await useFetch("/api/activities");

const stats = computed(() => [
  {
    title: "Inscriptions",
    value: registrationsTotal.value,
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

// Fetch real chart data from API
const { data: chartDataRaw } =
  await useFetch<{ date: string; inscriptions: number; revenus: number }[]>(
    "/api/stats/chart",
  );

const chartData = computed(() => {
  if (!chartDataRaw.value || chartDataRaw.value.length === 0) {
    // Return empty array if no data
    return [];
  }
  return chartDataRaw.value.map((item) => ({
    ...item,
    date: new Date(item.date),
  }));
});

type ChartData = { date: Date; inscriptions: number; revenus: number };
type BarData = { date: Date; revenus: number };

const chartConfig = {
  inscriptions: {
    label: "Inscriptions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const tooltipTemplate = () => {
  return (_data: any, x: number | Date) => {
    const data = "data" in _data ? _data.data : _data;
    const dateStr = new Date(x).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `
      <div class="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <div class="font-medium">${dateStr}</div>
        <div class="grid gap-1.5">
          <div class="flex w-full items-center gap-2">
            <div class="shrink-0 rounded-[2px] h-2.5 w-2.5" style="background-color: var(--chart-2); border-color: var(--chart-2);"></div>
            <div class="flex flex-1 justify-between items-center leading-none">
              <span class="text-muted-foreground">Inscriptions</span>
              <span class="font-mono font-medium tabular-nums">${(data.inscriptions as number)?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>`;
  };
};

const svgDefs = `
  <linearGradient id="fillInscriptions" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-inscriptions)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-inscriptions)"
      stop-opacity="0.1"
    />
  </linearGradient>
`;

const timeRange = ref("90d");
const filterRange = computed(() => {
  if (!chartData.value.length) return [];

  // Get the most recent date from data
  const dates = chartData.value.map((item) => item.date.getTime());
  const referenceDate = new Date(Math.max(...dates));

  let daysToSubtract = 90;
  if (timeRange.value === "30d") {
    daysToSubtract = 30;
  } else if (timeRange.value === "7d") {
    daysToSubtract = 7;
  }

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return chartData.value.filter((item) => item.date >= startDate);
});

// Bar chart config for payments (revenues only)
const barChartConfig = {
  revenus: {
    label: "Revenus (€)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Filter chart data to last 3 months for bar chart (only date + revenus)
const barChartData = computed(() => {
  if (!chartData.value.length) return [];

  const dates = chartData.value.map((item) => item.date.getTime());
  const referenceDate = new Date(Math.max(...dates));
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - 90);

  return chartData.value
    .filter((item) => item.date >= startDate)
    .map((item) => ({ date: item.date, revenus: item.revenus }));
});

const barTotal = computed(() =>
  barChartData.value.reduce((acc, d) => acc + d.revenus, 0),
);

const barTooltipTemplate = () => {
  return (_data: any, x: number | Date) => {
    const data = "data" in _data ? _data.data : _data;
    const dateStr = new Date(x).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `
      <div class="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <div class="font-medium">${dateStr}</div>
        <div class="grid gap-1.5">
          <div class="flex w-full items-center gap-2">
            <div class="shrink-0 rounded-[2px] h-2.5 w-2.5" style="background-color: var(--chart-1); border-color: var(--chart-1);"></div>
            <div class="flex flex-1 justify-between items-center leading-none">
              <span class="text-muted-foreground">Revenus</span>
              <span class="font-mono font-medium tabular-nums">${data.revenus?.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>`;
  };
};

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
  <div class="space-y-8">
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
          <Icon name="lucide:download" class="h-4 w-4" />
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
      <!-- Chart -->
      <Card class="rounded-2xl lg:col-span-2 flex flex-col pt-0">
        <CardHeader
          class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"
        >
          <div class="grid flex-1 gap-1">
            <CardTitle>Inscriptions</CardTitle>
            <CardDescription> Évolution des inscriptions </CardDescription>
          </div>
          <Select v-model="timeRange">
            <SelectTrigger
              class="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Selectionner une période"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent class="rounded-xl">
              <SelectItem value="90d" class="rounded-lg">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" class="rounded-lg">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" class="rounded-lg">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent class="px-2 pt-4 sm:px-6 sm:pt-6 pb-4 flex-1">
          <ClientOnly>
            <ChartContainer
              :config="chartConfig"
              class="aspect-auto h-[250px] w-full"
              :cursor="true"
            >
              <VisXYContainer
                :data="filterRange"
                :svg-defs="svgDefs"
                :margin="{ left: -40 }"
              >
                <VisArea
                  :x="(d: ChartData) => d.date"
                  :y="(d: ChartData) => d.inscriptions"
                  color="url(#fillInscriptions)"
                  :opacity="0.6"
                />
                <VisLine
                  :x="(d: ChartData) => d.date"
                  :y="(d: ChartData) => d.inscriptions"
                  :color="chartConfig.inscriptions.color"
                  :line-width="1"
                />
                <VisAxis
                  type="x"
                  :x="(d: ChartData) => d.date"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :num-ticks="6"
                  :tick-format="
                    (d: number) => {
                      const date = new Date(d);
                      return date.toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }
                  "
                />
                <VisAxis
                  type="y"
                  :num-ticks="3"
                  :tick-line="false"
                  :domain-line="false"
                />
                <ChartTooltip />
                <ChartCrosshair
                  :hide-when-far-from-pointer="false"
                  :template="tooltipTemplate()"
                  :color="chartConfig.inscriptions.color"
                />
              </VisXYContainer>
            </ChartContainer>
          </ClientOnly>
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
              <Icon :name="action.icon" class="h-4 w-4" />
              {{ action.title }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Bar Chart - Paiements -->
    <Card class="rounded-2xl py-4 sm:py-0">
      <CardHeader class="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div
          class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6"
        >
          <CardTitle>Paiements</CardTitle>
          <CardDescription> Revenus sur les 3 derniers mois </CardDescription>
        </div>
        <div
          class="flex flex-col justify-center gap-1 border-t px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
        >
          <span class="text-muted-foreground text-xs">Total</span>
          <span class="text-lg leading-none font-bold sm:text-3xl">
            {{ barTotal.toFixed(2) }} €
          </span>
        </div>
      </CardHeader>
      <CardContent class="px-2 sm:p-6">
        <ClientOnly>
          <ChartContainer
            :config="barChartConfig"
            class="aspect-auto h-[250px] w-full"
            cursor
          >
            <VisXYContainer :data="barChartData" :margin="{ left: -24 }">
              <VisGroupedBar
                :x="(d: BarData) => d.date"
                :y="(d: BarData) => d.revenus"
                :color="barChartConfig.revenus.color"
                :bar-padding="0.1"
                :rounded-corners="false"
              />
              <VisAxis
                type="x"
                :x="(d: BarData) => d.date"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :tick-format="
                  (d: number) => {
                    const date = new Date(d);
                    return date.toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }
                "
              />
              <VisAxis
                type="y"
                :num-ticks="3"
                :tick-line="false"
                :domain-line="false"
              />
              <ChartTooltip />
              <ChartCrosshair
                :hide-when-far-from-pointer="false"
                :template="barTooltipTemplate()"
                color="#0000"
              />
            </VisXYContainer>
          </ChartContainer>
        </ClientOnly>
      </CardContent>
    </Card>

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
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
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
                    <AvatarImage :src="avatarUrl(`${registration.firstName} ${registration.lastName}`)" />
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
