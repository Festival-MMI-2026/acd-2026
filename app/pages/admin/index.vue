<script setup lang="ts">
import { useSession } from "~/lib/auth-client";
import type { ChartConfig } from "@/components/ui/chart";
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
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

// Adapted from user snippet
const chartData = [
  { date: new Date("2024-04-01"), revenus: 222, inscriptions: 150 },
  { date: new Date("2024-04-02"), revenus: 97, inscriptions: 180 },
  { date: new Date("2024-04-03"), revenus: 167, inscriptions: 120 },
  { date: new Date("2024-04-04"), revenus: 242, inscriptions: 260 },
  { date: new Date("2024-04-05"), revenus: 373, inscriptions: 290 },
  { date: new Date("2024-04-06"), revenus: 301, inscriptions: 340 },
  { date: new Date("2024-04-07"), revenus: 245, inscriptions: 180 },
  { date: new Date("2024-04-08"), revenus: 409, inscriptions: 320 },
  { date: new Date("2024-04-09"), revenus: 59, inscriptions: 110 },
  { date: new Date("2024-04-10"), revenus: 261, inscriptions: 190 },
  { date: new Date("2024-04-11"), revenus: 327, inscriptions: 350 },
  { date: new Date("2024-04-12"), revenus: 292, inscriptions: 210 },
  { date: new Date("2024-04-13"), revenus: 342, inscriptions: 380 },
  { date: new Date("2024-04-14"), revenus: 137, inscriptions: 220 },
  { date: new Date("2024-04-15"), revenus: 120, inscriptions: 170 },
  { date: new Date("2024-04-16"), revenus: 138, inscriptions: 190 },
  { date: new Date("2024-04-17"), revenus: 446, inscriptions: 360 },
  { date: new Date("2024-04-18"), revenus: 364, inscriptions: 410 },
  { date: new Date("2024-04-19"), revenus: 243, inscriptions: 180 },
  { date: new Date("2024-04-20"), revenus: 89, inscriptions: 150 },
  { date: new Date("2024-04-21"), revenus: 137, inscriptions: 200 },
  { date: new Date("2024-04-22"), revenus: 224, inscriptions: 170 },
  { date: new Date("2024-04-23"), revenus: 138, inscriptions: 230 },
  { date: new Date("2024-04-24"), revenus: 387, inscriptions: 290 },
  { date: new Date("2024-04-25"), revenus: 215, inscriptions: 250 },
  { date: new Date("2024-04-26"), revenus: 75, inscriptions: 130 },
  { date: new Date("2024-04-27"), revenus: 383, inscriptions: 420 },
  { date: new Date("2024-04-28"), revenus: 122, inscriptions: 180 },
  { date: new Date("2024-04-29"), revenus: 315, inscriptions: 240 },
  { date: new Date("2024-04-30"), revenus: 454, inscriptions: 380 },
  { date: new Date("2024-05-01"), revenus: 165, inscriptions: 220 },
  { date: new Date("2024-05-02"), revenus: 293, inscriptions: 310 },
  { date: new Date("2024-05-03"), revenus: 247, inscriptions: 190 },
  { date: new Date("2024-05-04"), revenus: 385, inscriptions: 420 },
  { date: new Date("2024-05-05"), revenus: 481, inscriptions: 390 },
  { date: new Date("2024-05-06"), revenus: 498, inscriptions: 520 },
  { date: new Date("2024-05-07"), revenus: 388, inscriptions: 300 },
  { date: new Date("2024-05-08"), revenus: 149, inscriptions: 210 },
  { date: new Date("2024-05-09"), revenus: 227, inscriptions: 180 },
  { date: new Date("2024-05-10"), revenus: 293, inscriptions: 330 },
  { date: new Date("2024-05-11"), revenus: 335, inscriptions: 270 },
  { date: new Date("2024-05-12"), revenus: 197, inscriptions: 240 },
  { date: new Date("2024-05-13"), revenus: 197, inscriptions: 160 },
  { date: new Date("2024-05-14"), revenus: 448, inscriptions: 490 },
  { date: new Date("2024-05-15"), revenus: 473, inscriptions: 380 },
  { date: new Date("2024-05-16"), revenus: 338, inscriptions: 400 },
  { date: new Date("2024-05-17"), revenus: 499, inscriptions: 420 },
  { date: new Date("2024-05-18"), revenus: 315, inscriptions: 350 },
  { date: new Date("2024-05-19"), revenus: 235, inscriptions: 180 },
  { date: new Date("2024-05-20"), revenus: 177, inscriptions: 230 },
  { date: new Date("2024-05-21"), revenus: 82, inscriptions: 140 },
  { date: new Date("2024-05-22"), revenus: 81, inscriptions: 120 },
  { date: new Date("2024-05-23"), revenus: 252, inscriptions: 290 },
  { date: new Date("2024-05-24"), revenus: 294, inscriptions: 220 },
  { date: new Date("2024-05-25"), revenus: 201, inscriptions: 250 },
  { date: new Date("2024-05-26"), revenus: 213, inscriptions: 170 },
  { date: new Date("2024-05-27"), revenus: 420, inscriptions: 460 },
  { date: new Date("2024-05-28"), revenus: 233, inscriptions: 190 },
  { date: new Date("2024-05-29"), revenus: 78, inscriptions: 130 },
  { date: new Date("2024-05-30"), revenus: 340, inscriptions: 280 },
  { date: new Date("2024-05-31"), revenus: 178, inscriptions: 230 },
  { date: new Date("2024-06-01"), revenus: 178, inscriptions: 200 },
  { date: new Date("2024-06-02"), revenus: 470, inscriptions: 410 },
  { date: new Date("2024-06-03"), revenus: 103, inscriptions: 160 },
  { date: new Date("2024-06-04"), revenus: 439, inscriptions: 380 },
  { date: new Date("2024-06-05"), revenus: 88, inscriptions: 140 },
  { date: new Date("2024-06-06"), revenus: 294, inscriptions: 250 },
  { date: new Date("2024-06-07"), revenus: 323, inscriptions: 370 },
  { date: new Date("2024-06-08"), revenus: 385, inscriptions: 320 },
  { date: new Date("2024-06-09"), revenus: 438, inscriptions: 480 },
  { date: new Date("2024-06-10"), revenus: 155, inscriptions: 200 },
  { date: new Date("2024-06-11"), revenus: 92, inscriptions: 150 },
  { date: new Date("2024-06-12"), revenus: 492, inscriptions: 420 },
  { date: new Date("2024-06-13"), revenus: 81, inscriptions: 130 },
  { date: new Date("2024-06-14"), revenus: 426, inscriptions: 380 },
  { date: new Date("2024-06-15"), revenus: 307, inscriptions: 350 },
  { date: new Date("2024-06-16"), revenus: 371, inscriptions: 310 },
  { date: new Date("2024-06-17"), revenus: 475, inscriptions: 520 },
  { date: new Date("2024-06-18"), revenus: 107, inscriptions: 170 },
  { date: new Date("2024-06-19"), revenus: 341, inscriptions: 290 },
  { date: new Date("2024-06-20"), revenus: 408, inscriptions: 450 },
  { date: new Date("2024-06-21"), revenus: 169, inscriptions: 210 },
  { date: new Date("2024-06-22"), revenus: 317, inscriptions: 270 },
  { date: new Date("2024-06-23"), revenus: 480, inscriptions: 530 },
  { date: new Date("2024-06-24"), revenus: 132, inscriptions: 180 },
  { date: new Date("2024-06-25"), revenus: 141, inscriptions: 190 },
  { date: new Date("2024-06-26"), revenus: 434, inscriptions: 380 },
  { date: new Date("2024-06-27"), revenus: 448, inscriptions: 490 },
  { date: new Date("2024-06-28"), revenus: 149, inscriptions: 200 },
  { date: new Date("2024-06-29"), revenus: 103, inscriptions: 160 },
  { date: new Date("2024-06-30"), revenus: 446, inscriptions: 400 },
];
type ChartData = (typeof chartData)[number];

const chartConfig = {
  inscriptions: {
    label: "Inscriptions",
    color: "var(--chart-2)",
  },
  revenus: {
    label: "Revenus",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const svgDefs = `
  <linearGradient id="fillRevenus" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-chart-1)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-chart-1)"
      stop-opacity="0.1"
    />
  </linearGradient>
  <linearGradient id="fillInscriptions" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="var(--color-chart-2)"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="var(--color-chart-2)"
      stop-opacity="0.1"
    />
  </linearGradient>
`;

const timeRange = ref("90d");
const filterRange = computed(() => {
  return chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange.value === "30d") {
      daysToSubtract = 30;
    } else if (timeRange.value === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });
});

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
      <!-- Chart -->
      <Card class="rounded-2xl lg:col-span-2 flex flex-col">
        <CardHeader
          class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"
        >
          <div class="grid flex-1 gap-1">
            <CardTitle>Évolution des inscriptions</CardTitle>
            <CardDescription>
              Comparaison inscriptions et revenus (derniers mois)
            </CardDescription>
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
              :cursor="false"
            >
              <VisXYContainer
                :data="filterRange"
                :svg-defs="svgDefs"
                :margin="{ left: 0, right: 0 }"
                :y-domain="[0, undefined]"
              >
                <VisArea
                  :x="(d: ChartData) => d.date"
                  :y="[
                    (d: ChartData) => d.inscriptions,
                    (d: ChartData) => d.revenus,
                  ]"
                  :color="
                    (d: ChartData, i: number) =>
                      ['url(#fillInscriptions)', 'url(#fillRevenus)'][i]
                  "
                  :opacity="0.6"
                />
                <VisLine
                  :x="(d: ChartData) => d.date"
                  :y="[
                    (d: ChartData) => d.inscriptions,
                    (d: ChartData) => d.revenus,
                  ]"
                  :color="
                    (d: ChartData, i: number) =>
                      [
                        chartConfig.inscriptions.color,
                        chartConfig.revenus.color,
                      ][i]
                  "
                  :line-width="2"
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
                  :tick-format="(d: number) => d"
                />
                <ChartTooltip />
                <ChartCrosshair
                  :x="(d: ChartData) => d.date"
                  :template="
                    componentToString(chartConfig, ChartTooltipContent, {
                      labelFormatter: (d) => {
                        return new Date(d).toLocaleDateString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      },
                    })
                  "
                  :color="
                    (d: ChartData, i: number) =>
                      [
                        chartConfig.inscriptions.color,
                        chartConfig.revenus.color,
                      ][i]
                  "
                />
              </VisXYContainer>

              <ChartLegendContent />
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
