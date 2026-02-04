<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const emailTemplates = ref([
  {
    id: 1,
    name: "Confirmation d'inscription",
    subject: "Votre inscription à l'ACD 2026",
    type: "transactional",
    lastEdited: "2026-02-01",
  },
  {
    id: 2,
    name: "Rappel événement",
    subject: "L'ACD 2026 approche !",
    type: "reminder",
    lastEdited: "2026-01-28",
  },
  {
    id: 3,
    name: "Bienvenue",
    subject: "Bienvenue à l'ACD 2026",
    type: "welcome",
    lastEdited: "2026-01-25",
  },
  {
    id: 4,
    name: "Annulation inscription",
    subject: "Annulation de votre inscription",
    type: "transactional",
    lastEdited: "2026-01-20",
  },
]);

const emailStats = ref({
  sent: 234,
  delivered: 228,
  opened: 187,
  clicked: 89,
});

const typeLabels: Record<string, string> = {
  transactional: "Transactionnel",
  reminder: "Rappel",
  welcome: "Bienvenue",
  newsletter: "Newsletter",
};

const typeColors: Record<string, string> = {
  transactional: "bg-blue-500/10 text-blue-500",
  reminder: "bg-orange-500/10 text-orange-500",
  welcome: "bg-green-500/10 text-green-500",
  newsletter: "bg-purple-500/10 text-purple-500",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Emails & Notifications
        </h1>
        <p class="text-muted-foreground">
          Gestion des templates et envois d'emails
        </p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Nouveau template
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <Icon name="lucide:send" class="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <p class="text-2xl font-bold">{{ emailStats.sent }}</p>
          <p class="text-sm text-muted-foreground">Envoyés</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <Icon
            name="lucide:check-circle"
            class="h-8 w-8 mx-auto text-green-500 mb-2"
          />
          <p class="text-2xl font-bold">{{ emailStats.delivered }}</p>
          <p class="text-sm text-muted-foreground">Délivrés</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <Icon
            name="lucide:mail-open"
            class="h-8 w-8 mx-auto text-orange-500 mb-2"
          />
          <p class="text-2xl font-bold">{{ emailStats.opened }}</p>
          <p class="text-sm text-muted-foreground">Ouverts</p>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6 text-center">
          <Icon
            name="lucide:mouse-pointer-click"
            class="h-8 w-8 mx-auto text-purple-500 mb-2"
          />
          <p class="text-2xl font-bold">{{ emailStats.clicked }}</p>
          <p class="text-sm text-muted-foreground">Cliqués</p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        class="rounded-2xl border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <CardContent class="pt-6 flex items-center gap-4">
          <div
            class="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:send" class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="font-medium">Envoyer une campagne</p>
            <p class="text-sm text-muted-foreground">
              Envoyez un email à tous les inscrits
            </p>
          </div>
        </CardContent>
      </Card>
      <Card
        class="rounded-2xl border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <CardContent class="pt-6 flex items-center gap-4">
          <div
            class="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:bell" class="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p class="font-medium">Envoyer un rappel</p>
            <p class="text-sm text-muted-foreground">
              Rappelez l'événement aux participants
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Templates -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Templates d'emails</CardTitle>
            <CardDescription>Gérez vos modèles d'emails</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Nom</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dernière modification</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="template in emailTemplates"
              :key="template.id"
              class="cursor-pointer"
            >
              <TableCell class="font-medium">{{ template.name }}</TableCell>
              <TableCell class="text-muted-foreground">{{
                template.subject
              }}</TableCell>
              <TableCell>
                <Badge :class="['rounded-full', typeColors[template.type]]">
                  {{ typeLabels[template.type] }}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{
                  new Date(template.lastEdited).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:eye" class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:send" class="h-4 w-4" />
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
