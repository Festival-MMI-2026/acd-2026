<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const roles = ref([
  {
    id: 1,
    name: "Administrateur",
    slug: "admin",
    description: "Accès complet à toutes les fonctionnalités",
    users: 2,
    permissions: ["all"],
    color: "bg-red-500",
  },
  {
    id: 2,
    name: "Éditeur",
    slug: "editor",
    description: "Peut créer et modifier le contenu",
    users: 5,
    permissions: ["create", "edit", "view"],
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "Lecteur",
    slug: "viewer",
    description: "Accès en lecture seule",
    users: 12,
    permissions: ["view"],
    color: "bg-gray-500",
  },
]);

const allPermissions = [
  { key: "view", label: "Voir", icon: "lucide:eye" },
  { key: "create", label: "Créer", icon: "lucide:plus" },
  { key: "edit", label: "Modifier", icon: "lucide:pencil" },
  { key: "delete", label: "Supprimer", icon: "lucide:trash-2" },
  { key: "export", label: "Exporter", icon: "lucide:download" },
  { key: "admin", label: "Admin", icon: "lucide:shield" },
];
</script>

<template>
  <div class="max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Rôles & Permissions</h1>
        <p class="text-muted-foreground">Gestion des niveaux d'accès</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Nouveau rôle
      </Button>
    </div>

    <!-- Roles Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card v-for="role in roles" :key="role.id" class="rounded-2xl">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'h-10 w-10 rounded-xl flex items-center justify-center',
                  role.color + '/10',
                ]"
              >
                <Icon
                  name="lucide:shield"
                  :class="['h-5 w-5', role.color.replace('bg-', 'text-')]"
                />
              </div>
              <div>
                <CardTitle>{{ role.name }}</CardTitle>
                <CardDescription class="text-xs"
                  >{{ role.users }} utilisateurs</CardDescription
                >
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <Icon name="lucide:more-vertical" class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">{{ role.description }}</p>

          <div class="space-y-2">
            <p
              class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Permissions
            </p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="perm in allPermissions"
                :key="perm.key"
                :class="[
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
                  role.permissions.includes('all') ||
                  role.permissions.includes(perm.key)
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground/50',
                ]"
              >
                <Icon :name="perm.icon" class="h-3 w-3" />
                {{ perm.label }}
              </div>
            </div>
          </div>

          <Button variant="outline" class="w-full rounded-full" size="sm">
            <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Permissions Matrix -->
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>Matrice des permissions</CardTitle>
        <CardDescription
          >Vue d'ensemble des permissions par rôle</CardDescription
        >
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Permission</TableHead>
              <TableHead
                v-for="role in roles"
                :key="role.id"
                class="text-center"
                >{{ role.name }}</TableHead
              >
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="perm in allPermissions" :key="perm.key">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <Icon
                    :name="perm.icon"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  {{ perm.label }}
                </div>
              </TableCell>
              <TableCell
                v-for="role in roles"
                :key="role.id"
                class="text-center"
              >
                <Icon
                  :name="
                    role.permissions.includes('all') ||
                    role.permissions.includes(perm.key)
                      ? 'lucide:check'
                      : 'lucide:x'
                  "
                  :class="[
                    'h-4 w-4 mx-auto',
                    role.permissions.includes('all') ||
                    role.permissions.includes(perm.key)
                      ? 'text-green-500'
                      : 'text-muted-foreground/30',
                  ]"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
