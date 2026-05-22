<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  compareMealsByDate,
  compareActivitiesByDate,
} from "~/utils/sortRegistrationItems";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();

interface Order {
  id: string;
  orderNumber: string;
  amount: number | string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  registration: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    totalPrice: number | string;
    status: string;
    meals?: any[];
    activities?: any[];
  };
}

const { data: order, refresh } = await useFetch<Order>(
  `/api/orders/${route.params.id}`,
);

const isLoading = ref(false);
const downloadingInvoice = ref(false);
const previewOpen = ref(false);
const iframeLoading = ref(false);

async function downloadInvoice() {
  if (!order.value?.registration) return;
  downloadingInvoice.value = true;
  try {
    const response = await $fetch(
      `/api/registrations/${order.value.registration.id}/invoice`,
      { responseType: "blob" },
    );
    const url = window.URL.createObjectURL(response as unknown as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Facture_${order.value.orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Facture téléchargée");
  } catch (error) {
    console.error(error);
    toast.error("Impossible de générer la facture");
  } finally {
    downloadingInvoice.value = false;
  }
}

async function updatePaymentStatus(status: string, method?: string) {
  if (!order.value) return;

  isLoading.value = true;
  try {
    await $fetch(`/api/orders/${order.value.id}/status`, {
      method: "PATCH",
      body: {
        paymentStatus: status,
        paymentMethod: method,
      },
    });
    toast.success("Statut mis à jour");
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour");
  } finally {
    isLoading.value = false;
  }
}

function copyToClipboard(text: string) {
  if (import.meta.client) {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  }
}

const paymentStatusColors: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  REFUNDED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const paymentStatusLabels: Record<string, string> = {
  PAID: "Payé",
  PENDING: "En attente",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

const paymentMethodLabels: Record<string, string> = {
  CARD: "Carte bancaire",
  TRANSFER: "Virement",
  CASH: "Espèces",
  FREE: "Gratuit",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const invoiceItems = computed(() => {
  if (!order.value?.registration) return [];

  const items: { name: string; price: number }[] = [];

  const sortedMeals = [...(order.value.registration.meals ?? [])].sort(
    (a, b) =>
      compareMealsByDate(
        { date: a.meal?.date, mealType: a.meal?.mealType },
        { date: b.meal?.date, mealType: b.meal?.mealType },
      ),
  );
  for (const m of sortedMeals) {
    items.push({
      name: m.meal?.name || "Repas",
      price: Number(m.meal?.price || 0),
    });
  }

  const sortedActivities = [...(order.value.registration.activities ?? [])].sort(
    (a, b) =>
      compareActivitiesByDate(
        {
          date: a.activity?.date,
          startTime: a.activity?.startTime,
          allDay: a.activity?.allDay,
        },
        {
          date: b.activity?.date,
          startTime: b.activity?.startTime,
          allDay: b.activity?.allDay,
        },
      ),
  );
  for (const a of sortedActivities) {
    items.push({
      name: a.activity?.name || "Activité",
      price: Number(a.activity?.price || 0),
    });
  }

  return items;
});

const { data: appSettings } = await useFetch("/api/settings");

// TVA extraite du total (les prix sont TTC) — taux configurable dans les paramètres
const vat = computed(() =>
  computeVat(
    invoiceItems.value.reduce((acc, i) => acc + i.price, 0),
    Number(appSettings.value?.vatRate) || 0,
  ),
);

const showDeleteDialog = ref(false);
const isDeleting = ref(false);

async function deleteOrder() {
  if (!order.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/orders/${order.value.id}`, { method: "DELETE" });
    toast.success("Paiement supprimé");
    router.push("/admin/orders");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la suppression");
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
  }
}
</script>

<template>
  <div v-if="order" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="router.push('/admin/orders')"
        >
          <Icon name="lucide:arrow-left" class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold">
            Paiement {{ "N°" + order.orderNumber }}
          </h1>
          <p class="text-muted-foreground">{{ order.registration.email }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge
          :class="[
            'rounded-full px-3 py-1',
            paymentStatusColors[order.paymentStatus],
          ]"
        >
          {{ paymentStatusLabels[order.paymentStatus] }}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Supprimer le paiement"
          @click="showDeleteDialog = true"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content - Invoice -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Invoice Details -->
        <div>
          <div class="pb-0 p-6">
            <h2 class="text-lg font-semibold">Facture</h2>
          </div>
          <div class="space-y-4 p-6">
            <!-- Invoice Info -->
            <div class="grid gap-3 text-sm">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">N° Paiement</span>
                <div class="flex items-center gap-2">
                  <code class="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                    {{ order.orderNumber }}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click="copyToClipboard(order.orderNumber)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Date</span>
                <span>{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Statut paiement</span>
                <Badge
                  :class="[
                    'rounded-full',
                    paymentStatusColors[order.paymentStatus],
                  ]"
                >
                  {{ paymentStatusLabels[order.paymentStatus] }}
                </Badge>
              </div>
              <div
                v-if="order.paymentMethod"
                class="flex justify-between py-2 border-b"
              >
                <span class="text-muted-foreground">Méthode</span>
                <span>{{
                  paymentMethodLabels[order.paymentMethod] ||
                  order.paymentMethod
                }}</span>
              </div>
              <div
                v-if="order.paidAt"
                class="flex justify-between py-2 border-b"
              >
                <span class="text-muted-foreground">Payé le</span>
                <span>{{ formatDate(order.paidAt) }}</span>
              </div>
            </div>

            <!-- Line Items -->
            <div class="space-y-3 mt-12">
              <h4 class="font-medium text-md text-muted-foreground">
                Éléments
              </h4>

              <div
                v-for="(item, index) in invoiceItems"
                :key="index"
                class="flex justify-between py-2"
              >
                <span>{{ item.name }}</span>
                <span class="font-medium">{{ item.price.toFixed(2) }} €</span>
              </div>

              <div
                v-if="invoiceItems.length === 0"
                class="py-4 text-center text-muted-foreground text-sm"
              >
                Aucun élément
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Totals -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sous-total HT</span>
                <span>{{ vat.ht.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">TVA ({{ vat.rate }}%)</span>
                <span>{{ vat.tva.toFixed(2) }} €</span>
              </div>
              <Separator />
              <div class="flex justify-between text-lg font-bold pt-2">
                <span>Total TTC</span>
                <span>{{ vat.ttc.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Customer Details -->
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-14 w-14">
                <AvatarImage :src="avatarUrl(`${order.registration.firstName} ${order.registration.lastName}`)" />
                <AvatarFallback class="bg-muted text-foreground text-lg">
                  {{ order.registration.firstName?.charAt(0)
                  }}{{ order.registration.lastName?.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-semibold">
                  {{ order.registration.firstName }}
                  {{ order.registration.lastName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ order.registration.email }}
                </p>
              </div>
            </div>

            <Separator />

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Téléphone</p>
                <p class="font-medium">{{ order.registration.phone || "—" }}</p>
              </div>
            </div>

            <Button
              class="w-full rounded-full"
              as="a"
              :href="`mailto:${order.registration.email}`"
            >
              <Icon name="lucide:mail" class="h-4 w-4" />
              Envoyer un email
            </Button>

            <Button
              variant="outline"
              class="w-full rounded-full"
              @click="
                router.push(`/admin/inscriptions/${order.registration.id}`)
              "
            >
              <Icon name="lucide:user" class="h-4 w-4" />
              Voir l'inscription
            </Button>
          </CardContent>
        </Card>

        <!-- Payment Status -->
        <Card class="gap-2">
          <CardHeader>
            <CardTitle class="text-base">Paiement</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Select
              :model-value="order.paymentStatus"
              :disabled="isLoading"
              @update:model-value="updatePaymentStatus($event as string)"
            >
              <SelectTrigger class="w-full rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payé</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
                <SelectItem value="REFUNDED">Remboursé</SelectItem>
              </SelectContent>
            </Select>

            <div v-if="order.paymentStatus === 'PENDING'" class="space-y-2">
              <p class="text-sm text-muted-foreground">
                Marquer comme payé par :
              </p>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="rounded-full"
                  :disabled="isLoading"
                  @click="updatePaymentStatus('PAID', 'CARD')"
                >
                  Carte
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="rounded-full"
                  :disabled="isLoading"
                  @click="updatePaymentStatus('PAID', 'TRANSFER')"
                >
                  Virement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="rounded-full"
                  :disabled="isLoading"
                  @click="updatePaymentStatus('PAID', 'CASH')"
                >
                  Espèces
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="rounded-full"
                  :disabled="isLoading"
                  @click="updatePaymentStatus('PAID', 'FREE')"
                >
                  Gratuit
                </Button>
              </div>
            </div>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              @click="previewOpen = true"
            >
              <Icon name="lucide:eye" class="h-4 w-4" />
              Prévisualiser la facture
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              :disabled="downloadingInvoice"
              @click="downloadInvoice"
            >
              <Icon
                v-if="downloadingInvoice"
                name="lucide:loader-2"
                class="h-4 w-4 animate-spin"
              />
              <Icon v-else name="lucide:download" class="h-4 w-4" />
              {{ downloadingInvoice ? "Génération..." : "Télécharger la facture" }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-24">
    <Icon
      name="lucide:loader-2"
      class="h-8 w-8 animate-spin text-muted-foreground"
    />
  </div>

  <!-- Invoice Preview Dialog -->
  <Dialog v-model:open="previewOpen" @update:open="(v) => { if (v) iframeLoading = true }">
    <DialogContent class="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Facture — {{ order?.orderNumber }}</DialogTitle>
      </DialogHeader>
      <div class="flex-1 relative">
        <div
          v-if="iframeLoading"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-10"
        >
          <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
          <p class="text-sm text-muted-foreground">Génération de la facture…</p>
        </div>
        <iframe
          v-if="order && previewOpen"
          :src="`/api/registrations/${order.registration.id}/invoice`"
          class="w-full h-full rounded-b-lg"
          type="application/pdf"
          @load="iframeLoading = false"
        />
      </div>
    </DialogContent>
  </Dialog>

  <AlertDialog
    :open="showDeleteDialog"
    @update:open="showDeleteDialog = $event"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. Le paiement
          <span class="font-medium">N°{{ order?.orderNumber }}</span>
          sera supprimé définitivement. L'inscription correspondante restera
          intacte mais ne sera plus liée à un paiement.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">Annuler</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          :disabled="isDeleting"
          @click="deleteOrder"
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
</template>
