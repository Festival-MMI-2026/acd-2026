<script setup lang="ts">
import { authClient } from "@/lib/auth-client";
import { toast } from "vue-sonner";
import UserEditDialog from "@/components/users/UserEditDialog.vue";
import UserDeleteDialog from "@/components/users/UserDeleteDialog.vue";
import UserDetailsSheet from "@/components/users/UserDetailsSheet.vue";

definePageMeta({
  layout: "admin",
});

const users = ref<any[]>([]);
const isLoading = ref(true);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showDetailsSheet = ref(false);
const selectedUser = ref<any>(null);

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch<{ items: unknown[]; total: number }>(
      "/api/users",
      { query: { pageSize: 200 } },
    );
    users.value = data?.items || [];
  } catch (err) {
    console.error(err);
    toast.error("Impossible de charger les utilisateurs");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});

const handleRowClick = (user: any, event: MouseEvent) => {
  // Prevent opening sheet if clicking on actions/buttons
  const target = event.target as HTMLElement;
  if (target.closest("button") || target.closest("[role='menuitem']")) return;

  selectedUser.value = user;
  showDetailsSheet.value = true;
};

const handleEditUser = (user: any) => {
  selectedUser.value = user;
  showEditDialog.value = true;
};

const openDeleteDialog = (user: any) => {
  selectedUser.value = user;
  showDeleteDialog.value = true;
};

const handleBanUser = async (userId: string) => {
  try {
    await authClient.admin.banUser({
      userId,
      banReason: "Banni par l'administrateur",
    });
    toast.success("Utilisateur banni avec succès");
    fetchUsers();
  } catch (err) {
    toast.error("Erreur lors du bannissement");
  }
};

const handleUnbanUser = async (userId: string) => {
  try {
    await authClient.admin.unbanUser({
      userId,
    });
    toast.success("Utilisateur débanni avec succès");
    fetchUsers();
  } catch (err) {
    toast.error("Erreur lors du débannissement");
  }
};

const handleSuccess = () => {
  fetchUsers();
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p class="text-muted-foreground">
          Gérez les utilisateurs de la plateforme
        </p>
      </div>
      <Button @click="fetchUsers" variant="outline" size="sm">
        <Icon
          name="lucide:refresh-cw"
          class="h-4 w-4"
          :class="{ 'animate-spin': isLoading }"
        />
        Actualiser
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Liste des utilisateurs</CardTitle>
        <CardDescription>
          {{ users.length }} utilisateur(s) inscrit(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>IUT</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="6" class="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
              <TableRow v-else-if="users.length === 0">
                <TableCell colspan="6" class="h-24 text-center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
              <TableRow
                v-for="user in users"
                :key="user.id"
                @click="(e) => handleRowClick(user, e)"
                class="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        :src="user.image"
                        :fallback-src="avatarUrl(user.name || '')"
                        :alt="user.name"
                      />
                      <AvatarFallback class="text-2xl">{{
                        user.name?.charAt(0).toUpperCase()
                      }}</AvatarFallback>
                    </Avatar>
                    <div class="flex flex-col">
                      <span class="font-medium">
                        {{
                          user.name ||
                          (user.firstName || user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "Sans nom")
                        }}
                      </span>
                      <span class="text-xs text-muted-foreground">{{
                        user.email
                      }}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="text-xs">{{ user.iut || "-" }}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {{
                      user.role === "admin" ? "Administrateur" : "Utilisateur"
                    }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge v-if="user.banned" variant="destructive">Banni</Badge>
                  <Badge
                    v-else
                    variant="secondary"
                    class="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300"
                    >Actif</Badge
                  >
                </TableCell>
                <TableCell>
                  {{ new Date(user.createdAt).toLocaleDateString("fr-FR") }}
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0">
                        <span class="sr-only">Ouvrir menu</span>
                        <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        @click="navigator.clipboard.writeText(user.id)"
                      >
                        Copier ID
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="handleEditUser(user)">
                        <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        v-if="!user.banned"
                        @click="handleBanUser(user.id)"
                        class="text-orange-600 focus:text-orange-600"
                      >
                        <Icon name="lucide:ban" class="mr-2 h-4 w-4" />
                        Bannir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-else
                        @click="handleUnbanUser(user.id)"
                      >
                        <Icon name="lucide:check-circle" class="mr-2 h-4 w-4" />
                        Débannir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="openDeleteDialog(user)"
                        class="text-destructive focus:text-destructive"
                      >
                        <Icon name="lucide:trash" class="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <UserEditDialog
      :open="showEditDialog"
      @update:open="showEditDialog = $event"
      :user="selectedUser"
      @success="handleSuccess"
    />

    <UserDeleteDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
      :user-id="selectedUser?.id"
      :user-name="
        selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''
      "
      @success="handleSuccess"
    />

    <UserDetailsSheet
      :open="showDetailsSheet"
      @update:open="showDetailsSheet = $event"
      :user="selectedUser"
    />
  </div>
</template>
