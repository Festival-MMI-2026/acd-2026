<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

// Mock users data
const users = ref([
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@univ-troyes.fr",
    role: "admin",
    status: "active",
    lastLogin: "2026-02-04T10:30:00",
  },
  {
    id: 2,
    name: "Marie Martin",
    email: "marie.martin@iut-lyon.fr",
    role: "editor",
    status: "active",
    lastLogin: "2026-02-03T14:22:00",
  },
  {
    id: 3,
    name: "Pierre Bernard",
    email: "pierre.bernard@iut-paris.fr",
    role: "viewer",
    status: "active",
    lastLogin: "2026-02-01T09:15:00",
  },
  {
    id: 4,
    name: "Sophie Petit",
    email: "sophie.petit@iut-bordeaux.fr",
    role: "editor",
    status: "inactive",
    lastLogin: "2026-01-15T16:45:00",
  },
]);

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  editor: "Éditeur",
  viewer: "Lecteur",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-500/10 text-red-500",
  editor: "bg-blue-500/10 text-blue-500",
  viewer: "bg-gray-500/10 text-gray-500",
};
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p class="text-muted-foreground">Gestion des comptes utilisateurs</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
        Inviter un utilisateur
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <Icon name="lucide:users" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ users.length }}</p>
              <p class="text-xs text-muted-foreground">Utilisateurs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:shield" class="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">
                {{ users.filter((u) => u.role === "admin").length }}
              </p>
              <p class="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:check-circle" class="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">
                {{ users.filter((u) => u.status === "active").length }}
              </p>
              <p class="text-xs text-muted-foreground">Actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-2xl">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"
            >
              <Icon name="lucide:clock" class="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">
                {{ users.filter((u) => u.status === "inactive").length }}
              </p>
              <p class="text-xs text-muted-foreground">Inactifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Rechercher un utilisateur..."
          class="pl-9 rounded-full"
        />
      </div>
      <Button variant="outline" class="rounded-full"> Tous </Button>
      <Button variant="outline" class="rounded-full"> Admins </Button>
      <Button variant="outline" class="rounded-full"> Éditeurs </Button>
    </div>

    <!-- Users Table -->
    <Card class="rounded-2xl">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="user in users"
              :key="user.id"
              class="cursor-pointer"
            >
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="h-9 w-9">
                    <AvatarFallback
                      class="bg-foreground text-background text-sm"
                    >
                      {{
                        user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-medium">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :class="['rounded-full', roleColors[user.role]]">
                  {{ roleLabels[user.role] }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'h-2 w-2 rounded-full',
                      user.status === 'active' ? 'bg-green-500' : 'bg-gray-400',
                    ]"
                  />
                  <span class="text-sm">{{
                    user.status === "active" ? "Actif" : "Inactif"
                  }}</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{
                  new Date(user.lastLogin).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-destructive"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
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
