<script setup lang="ts">
import { toast } from "vue-sonner";
import IutImportDialog from "@/components/iuts/IutImportDialog.vue";

definePageMeta({
  layout: "admin",
});

interface Iut {
  id: string;
  name: string;
  city?: string | null;
  code?: string | null;
  createdAt: string;
}

const iuts = ref<Iut[]>([]);
const isLoading = ref(true);
const showImportDialog = ref(false);

const showDeleteDialog = ref(false);
const iutToDelete = ref<Iut | null>(null);
const isDeleting = ref(false);

const fetchIuts = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch<Iut[]>("/api/iuts");
    iuts.value = data || [];
  } catch (err) {
    console.error(err);
    toast.error("Impossible de charger les IUTs");
  } finally {
    isLoading.value = false;
  }
};

function confirmDelete(iut: Iut) {
  iutToDelete.value = iut;
  showDeleteDialog.value = true;
}

async function executeDelete() {
  if (!iutToDelete.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/iuts/${iutToDelete.value.id}`, { method: "DELETE" });
    toast.success("IUT supprimé");
    iuts.value = iuts.value.filter((i) => i.id !== iutToDelete.value!.id);
  } catch (err: any) {
    console.error(err);
    toast.error(err.statusMessage || "Erreur lors de la suppression");
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
    iutToDelete.value = null;
  }
}

onMounted(() => {
  fetchIuts();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Gestion des IUTs</h1>
        <p class="text-muted-foreground">
          Liste des IUTs disponibles pour les utilisateurs.
        </p>
      </div>
      <div class="flex gap-2">
        <Button @click="showImportDialog = true" variant="default" size="sm">
          <Icon name="lucide:upload" class="h-4 w-4" />
          Importer CSV
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Liste des IUTs</CardTitle>
        <CardDescription>
          {{ iuts.length }} établissement(s) répertorié(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Ajouté le</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="5" class="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
              <TableRow v-else-if="iuts.length === 0">
                <TableCell colspan="5" class="h-24 text-center">
                  Aucun IUT trouvé. Importez un fichier CSV.
                </TableCell>
              </TableRow>
              <TableRow v-for="iut in iuts" :key="iut.id">
                <TableCell>
                  <span class="font-medium">{{ iut.name }}</span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Icon
                      name="lucide:map-pin"
                      class="h-3 w-3 text-muted-foreground"
                    />
                    <span>{{ iut.city || "-" }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" class="font-mono text-xs">
                    {{ iut.code || "N/A" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  {{ new Date(iut.createdAt).toLocaleDateString("fr-FR") }}
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-muted-foreground hover:text-destructive"
                    @click="confirmDelete(iut)"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <IutImportDialog
      :open="showImportDialog"
      @update:open="showImportDialog = $event"
      @success="fetchIuts"
    />

    <AlertDialog
      :open="showDeleteDialog"
      @update:open="showDeleteDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet IUT ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L'IUT
            <span class="font-medium">"{{ iutToDelete?.name }}"</span>
            sera supprimé définitivement. Les inscriptions existantes qui y
            sont rattachées resteront mais perdront le lien.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">Annuler</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="isDeleting"
            @click="executeDelete"
          >
            <Icon
              v-if="isDeleting"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
