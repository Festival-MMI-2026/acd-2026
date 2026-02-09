<script setup lang="ts">
import { toast } from "vue-sonner";
import IutImportDialog from "@/components/iuts/IutImportDialog.vue";

definePageMeta({
  layout: "admin",
});

const iuts = ref<any[]>([]);
const isLoading = ref(true);
const showImportDialog = ref(false);

const fetchIuts = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch("/api/iuts");
    iuts.value = data || [];
  } catch (err) {
    console.error(err);
    toast.error("Impossible de charger les IUTs");
  } finally {
    isLoading.value = false;
  }
};

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
                <TableHead class="text-right">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="4" class="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
              <TableRow v-else-if="iuts.length === 0">
                <TableCell colspan="4" class="h-24 text-center">
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
                <TableCell
                  class="text-right font-mono text-xs text-muted-foreground"
                >
                  {{ iut.id.substring(0, 8) }}...
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
  </div>
</template>
