<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

// Fetch registrations
const { data: registrations } = await useFetch("/api/registrations");

// Stats
const stats = computed(() => {
  const regs = registrations.value || [];
  return {
    total: regs.length,
    confirmed: regs.filter((r: any) => r.status === "CONFIRMED").length,
    pending: regs.filter((r: any) => r.status === "PENDING").length,
    cancelled: regs.filter((r: any) => r.status === "CANCELLED").length,
    revenue: regs.reduce(
      (acc: number, r: any) => acc + Number(r.totalPrice || 0),
      0,
    ),
  };
});

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500",
  PENDING: "bg-yellow-500/10 text-yellow-500",
  CANCELLED: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Inscriptions</h1>
        <p class="text-muted-foreground">
          Gestion des inscriptions à l'événement
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="rounded-full">
          <Icon name="lucide:download" class="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
        <Button class="rounded-full">
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          Nouvelle inscription
        </Button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <p class="text-3xl font-bold">{{ stats.total }}</p>
          <p class="text-sm text-muted-foreground">Total</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <p class="text-3xl font-bold text-green-500">{{ stats.confirmed }}</p>
          <p class="text-sm text-muted-foreground">Confirmés</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <p class="text-3xl font-bold text-yellow-500">{{ stats.pending }}</p>
          <p class="text-sm text-muted-foreground">En attente</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <p class="text-3xl font-bold text-red-500">{{ stats.cancelled }}</p>
          <p class="text-sm text-muted-foreground">Annulés</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <p class="text-3xl font-bold">{{ stats.revenue.toFixed(0) }} €</p>
          <p class="text-sm text-muted-foreground">Revenus</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Rechercher par nom, email..."
          class="pl-9 rounded-full"
        />
      </div>
      <Button variant="outline" class="rounded-full">
        <Icon name="lucide:filter" class="mr-2 h-4 w-4" />
        Filtrer
      </Button>
      <Button variant="outline" class="rounded-full"> Tous </Button>
      <Button variant="outline" class="rounded-full text-green-500">
        Confirmés
      </Button>
      <Button variant="outline" class="rounded-full text-yellow-500">
        En attente
      </Button>
    </div>

    <!-- Table -->
    <Card class="rounded-2xl">
      <CardContent class="p-0">
        <div
          v-if="!registrations || registrations.length === 0"
          class="text-center py-16"
        >
          <Icon
            name="lucide:inbox"
            class="h-16 w-16 mx-auto text-muted-foreground/30 mb-4"
          />
          <p class="text-lg font-medium">Aucune inscription</p>
          <p class="text-muted-foreground">Les inscriptions apparaîtront ici</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Participant</TableHead>
              <TableHead>IUT</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Montant</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="reg in registrations"
              :key="reg.id"
              class="cursor-pointer"
            >
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="h-9 w-9">
                    <AvatarFallback
                      class="bg-foreground text-background text-sm"
                    >
                      {{ reg.firstName?.charAt(0)
                      }}{{ reg.lastName?.charAt(0) }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-medium">
                      {{ reg.firstName }} {{ reg.lastName }}
                    </p>
                    <p class="text-xs text-muted-foreground">{{ reg.email }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">{{
                reg.iut || "-"
              }}</TableCell>
              <TableCell class="text-muted-foreground">
                {{
                  new Date(reg.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              </TableCell>
              <TableCell>
                <Badge
                  :class="[
                    'rounded-full',
                    statusColors[reg.status] || 'bg-muted',
                  ]"
                >
                  {{ statusLabels[reg.status] || reg.status }}
                </Badge>
              </TableCell>
              <TableCell class="text-right font-semibold"
                >{{ Number(reg.totalPrice).toFixed(2) }} €</TableCell
              >
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:eye" class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
