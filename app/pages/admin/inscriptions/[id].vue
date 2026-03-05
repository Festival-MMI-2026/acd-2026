<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  meals?: any[];
  activities?: any[];
}

const { data: registration, refresh } = await useFetch<Registration>(
  `/api/registrations/${route.params.id}`,
);

const isLoading = ref(false);
const isCheckingIn = ref(false);

async function toggleCheckin() {
  if (!registration.value) return;
  isCheckingIn.value = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}/checkin`, {
      method: "PATCH",
      body: { checkedIn: !registration.value.checkedIn },
    });
    toast.success(
      registration.value.checkedIn ? "Check-in annulé" : "Présence confirmée",
    );
    refresh();
  } catch {
    toast.error("Erreur lors du check-in");
  } finally {
    isCheckingIn.value = false;
  }
}

async function updateStatus(newStatus: string) {
  if (!registration.value) return;

  isLoading.value = true;
  try {
    await $fetch(`/api/registrations/${registration.value.id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    toast.success(`Statut mis à jour`);
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour");
  } finally {
    isLoading.value = false;
  }
}

const downloadingInvoice = ref(false);
const previewOpen = ref(false);

async function downloadInvoice() {
  if (!registration.value) return;
  downloadingInvoice.value = true;
  try {
    const response = await $fetch(
      `/api/registrations/${registration.value.id}/invoice`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(response as unknown as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Facture_${registration.value.id}.pdf`);
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

function copyToClipboard(text: string) {
  if (import.meta.client) {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  }
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Calculate totals for invoice
const invoiceDetails = computed(() => {
  if (!registration.value) return { meals: [], activities: [], subtotal: 0 };

  const meals =
    registration.value.meals?.map((m) => ({
      name: m.meal?.name || "Repas",
      price: Number(m.meal?.price || 0),
    })) || [];

  const activities =
    registration.value.activities?.map((a) => ({
      name: a.activity?.name || "Activité",
      price: Number(a.activity?.price || 0),
    })) || [];

  const subtotal =
    meals.reduce((acc, m) => acc + m.price, 0) +
    activities.reduce((acc, a) => acc + a.price, 0);

  return { meals, activities, subtotal };
});
</script>

<template>
  <div v-if="registration" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="router.push('/admin/inscriptions')"
        >
          <Icon name="lucide:arrow-left" class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold">Inscription</h1>
          <p class="text-muted-foreground">{{ registration.email }}</p>
        </div>
      </div>
      <Badge
        :class="['rounded-full px-3 py-1', statusColors[registration.status]]"
      >
        {{ statusLabels[registration.status] }}
      </Badge>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content - Invoice -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Invoice Details -->
        <div>
          <div class="pb-0 p-6">
            <h2 class="text-lg font-semibold">Détails de la facture</h2>
          </div>
          <div class="space-y-4 p-6">
            <!-- Invoice Info -->
            <div class="grid gap-3 text-sm">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">N° Inscription</span>
                <div class="flex items-center gap-2">
                  <code class="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                    {{ registration.id.slice(0, 12) }}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click="copyToClipboard(registration.id)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Date d'inscription</span>
                <span>{{ formatDate(registration.createdAt) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Statut</span>
                <Badge
                  :class="['rounded-full', statusColors[registration.status]]"
                >
                  {{ statusLabels[registration.status] }}
                </Badge>
              </div>
            </div>

            <!-- Line Items -->
            <div class="space-y-3 mt-12">
              <h4 class="font-medium text-md text-muted-foreground">
                Éléments facturés
              </h4>

              <!-- Meals -->
              <div
                v-for="(meal, index) in invoiceDetails.meals"
                :key="`meal-${index}`"
                class="flex justify-between py-2"
              >
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:utensils"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <span>{{ meal.name }}</span>
                </div>
                <span class="font-medium">{{ meal.price.toFixed(2) }} €</span>
              </div>

              <!-- Activities -->
              <div
                v-for="(activity, index) in invoiceDetails.activities"
                :key="`activity-${index}`"
                class="flex justify-between py-2"
              >
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:compass"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <span>{{ activity.name }}</span>
                </div>
                <span class="font-medium">
                  {{ activity.price.toFixed(2) }} €
                </span>
              </div>

              <!-- Empty state -->
              <div
                v-if="
                  invoiceDetails.meals.length === 0 &&
                  invoiceDetails.activities.length === 0
                "
                class="py-4 text-center text-muted-foreground text-sm"
              >
                Aucun élément facturé
              </div>
            </div>

            <Separator class="my-4" />

            <!-- Totals -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sous-total</span>
                <span>{{ invoiceDetails.subtotal.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">TVA (0%)</span>
                <span>—</span>
              </div>
              <Separator />
              <div class="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span>{{ Number(registration.totalPrice).toFixed(2) }} €</span>
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
            <CardTitle class="text-base">Participant</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-14 w-14">
                <AvatarImage :src="avatarUrl(`${registration.firstName} ${registration.lastName}`)" />
                <AvatarFallback class="bg-muted text-foreground text-lg">
                  {{ registration.firstName?.charAt(0)
                  }}{{ registration.lastName?.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-semibold">
                  {{ registration.firstName }} {{ registration.lastName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ registration.email }}
                </p>
              </div>
            </div>

            <Separator />

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Téléphone</p>
                <p class="font-medium">{{ registration.phone || "—" }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Inscrit le</p>
                <p class="font-medium">
                  {{ formatDate(registration.createdAt) }}
                </p>
              </div>
            </div>

            <Button
              class="w-full rounded-full"
              as="a"
              :href="`mailto:${registration.email}`"
            >
              <Icon name="lucide:mail" class="h-4 w-4" />
              Envoyer un email
            </Button>
          </CardContent>
        </Card>

        <!-- Actions -->
        <Card class="gap-2">
          <CardHeader>
            <CardTitle class="text-base">Statut</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Select
              :model-value="registration.status"
              :disabled="isLoading"
              @update:model-value="updateStatus($event as string)"
            >
              <SelectTrigger class="w-full rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
              </SelectContent>
            </Select>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              @click="previewOpen = true"
            >
              <Icon name="lucide:eye" class="mr-2 h-4 w-4" />
              Prévisualiser la facture
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="w-full rounded-full justify-start"
              @click="downloadInvoice"
              :disabled="downloadingInvoice"
            >
              <Icon
                v-if="downloadingInvoice"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              <Icon v-else name="lucide:download" class="mr-2 h-4 w-4" />
              {{
                downloadingInvoice ? "Génération..." : "Télécharger la facture"
              }}
            </Button>
          </CardContent>
        </Card>

        <!-- Check-in & QR Code -->
        <Card class="rounded-xl">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-base">Présence</CardTitle>
              <Badge
                :class="[
                  'rounded-full text-xs',
                  registration.checkedIn
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground',
                ]"
              >
                <Icon
                  :name="registration.checkedIn ? 'lucide:check-circle' : 'lucide:circle'"
                  class="h-3 w-3 mr-1"
                />
                {{ registration.checkedIn ? "Présent" : "Absent" }}
              </Badge>
            </div>
            <p
              v-if="registration.checkedIn && registration.checkedInAt"
              class="text-xs text-muted-foreground mt-1"
            >
              Enregistré le
              {{
                new Date(registration.checkedInAt).toLocaleString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- QR Code -->
            <div class="flex justify-center">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${registration.id}`"
                :alt="`QR code - ${registration.id}`"
                class="rounded-lg border bg-white p-2"
                width="160"
                height="160"
              />
            </div>
            <p class="text-xs text-center text-muted-foreground">
              Scannez ce code depuis la page
              <NuxtLink to="/admin/checkin" class="underline underline-offset-2">
                Check-in
              </NuxtLink>
            </p>
            <Button
              :variant="registration.checkedIn ? 'outline' : 'default'"
              size="sm"
              class="w-full rounded-full"
              :disabled="isCheckingIn"
              @click="toggleCheckin"
            >
              <Icon
                v-if="isCheckingIn"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              <Icon
                v-else-if="registration.checkedIn"
                name="lucide:rotate-ccw"
                class="mr-2 h-4 w-4"
              />
              <Icon
                v-else
                name="lucide:check-circle"
                class="mr-2 h-4 w-4"
              />
              {{
                isCheckingIn
                  ? "Enregistrement..."
                  : registration.checkedIn
                    ? "Annuler la présence"
                    : "Marquer comme présent"
              }}
            </Button>
          </CardContent>
        </Card>

        <!-- History -->
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <div class="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p class="font-medium">Inscription créée</p>
                  <p class="text-muted-foreground text-xs">
                    {{ formatDate(registration.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Loading / Not Found -->
  <div v-else class="flex items-center justify-center py-24">
    <Icon
      name="lucide:loader-2"
      class="h-8 w-8 animate-spin text-muted-foreground"
    />
  </div>

  <!-- Invoice Preview Dialog -->
  <Dialog v-model:open="previewOpen">
    <DialogContent class="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle> Facture — {{ registration?.id }} </DialogTitle>
      </DialogHeader>
      <iframe
        v-if="registration && previewOpen"
        :src="`/api/registrations/${registration.id}/invoice`"
        class="flex-1 w-full rounded-b-lg"
        type="application/pdf"
      />
    </DialogContent>
  </Dialog>
</template>
