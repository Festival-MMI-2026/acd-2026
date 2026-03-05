<script setup lang="ts">
import { toast } from "vue-sonner";

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  meals?: any[];
  activities?: any[];
}

const props = defineProps<{
  open: boolean;
  registration: Registration | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  statusChange: [];
}>();

const isLoading = ref(false);

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

async function updateStatus(newStatus: string) {
  if (!props.registration) return;

  isLoading.value = true;
  try {
    await $fetch(`/api/registrations/${props.registration.id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    toast.success(`Statut mis à jour : ${statusLabels[newStatus]}`);
    emit("statusChange");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour du statut");
  } finally {
    isLoading.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function copyToClipboard(text: string) {
  if (import.meta.client) {
    navigator.clipboard.writeText(text);
    toast.success("ID copié dans le presse-papiers");
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-3">
          <Avatar class="h-10 w-10">
            <AvatarImage :src="avatarUrl(`${registration?.firstName} ${registration?.lastName}`)" />
            <AvatarFallback class="bg-foreground text-background">
              {{ registration?.firstName?.charAt(0)
              }}{{ registration?.lastName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div>
            <span
              >{{ registration?.firstName }} {{ registration?.lastName }}</span
            >
            <Badge
              :class="[
                'ml-2 rounded-full',
                statusColors[registration?.status || 'PENDING'],
              ]"
            >
              {{ statusLabels[registration?.status || "PENDING"] }}
            </Badge>
          </div>
        </SheetTitle>
        <SheetDescription>
          Inscription du {{ formatDate(registration?.createdAt || "") }}
        </SheetDescription>
      </SheetHeader>

      <div class="mt-6 space-y-6">
        <!-- Contact Information -->
        <div class="space-y-1">
          <h4 class="text-sm font-medium text-muted-foreground mb-3">
            Informations de contact
          </h4>
          <div class="grid gap-3 text-sm">
            <div class="flex items-start gap-8">
              <span class="text-muted-foreground w-20 shrink-0">Email</span>
              <a
                :href="`mailto:${registration?.email}`"
                class="text-primary hover:underline"
              >
                {{ registration?.email }}
              </a>
            </div>
            <div class="flex items-start gap-8">
              <span class="text-muted-foreground w-20 shrink-0">Téléphone</span>
              <a
                :href="`tel:${registration?.phone}`"
                class="text-primary hover:underline"
              >
                {{ registration?.phone }}
              </a>
            </div>
            <div class="flex items-start gap-8">
              <span class="text-muted-foreground w-20 shrink-0">ID</span>
              <div class="flex items-center gap-2">
                <code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {{ registration?.id?.slice(0, 12) }}...
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-6 w-6"
                  @click="copyToClipboard(registration?.id || '')"
                >
                  <Icon name="lucide:copy" class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Meals -->
        <div
          v-if="registration?.meals && registration.meals.length > 0"
          class="space-y-1"
        >
          <h4 class="text-sm font-medium text-muted-foreground mb-3">
            Repas ({{ registration.meals.length }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="regMeal in registration.meals"
              :key="regMeal.id"
              class="p-3 rounded-lg bg-muted/50 text-sm"
            >
              <p class="font-medium">{{ regMeal.meal?.name }}</p>
              <div class="text-muted-foreground mt-1 space-y-0.5">
                <p v-if="regMeal.starterOption">
                  Entrée : {{ regMeal.starterOption.name }}
                </p>
                <p v-if="regMeal.mainOption">
                  Plat : {{ regMeal.mainOption.name }}
                </p>
                <p v-if="regMeal.dessertOption">
                  Dessert : {{ regMeal.dessertOption.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities -->
        <div
          v-if="registration?.activities && registration.activities.length > 0"
          class="space-y-1"
        >
          <h4 class="text-sm font-medium text-muted-foreground mb-3">
            Activités ({{ registration.activities.length }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="regActivity in registration.activities"
              :key="regActivity.id"
              variant="secondary"
              class="rounded-full"
            >
              {{ regActivity.activity?.name }}
            </Badge>
          </div>
        </div>

        <Separator />

        <!-- Total Price -->
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Total</span>
          <span class="text-2xl font-bold">
            {{ Number(registration?.totalPrice || 0).toFixed(2) }} €
          </span>
        </div>

        <Separator />

        <!-- Status Actions -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">
            Changer le statut
          </h4>
          <div class="flex gap-2">
            <Button
              v-if="registration?.status !== 'CONFIRMED'"
              variant="outline"
              size="sm"
              class="flex-1 rounded-full text-green-500 hover:text-green-500 hover:bg-green-500/10"
              :disabled="isLoading"
              @click="updateStatus('CONFIRMED')"
            >
              <Icon name="lucide:check" class="mr-2 h-4 w-4" />
              Confirmer
            </Button>
            <Button
              v-if="registration?.status !== 'PENDING'"
              variant="outline"
              size="sm"
              class="flex-1 rounded-full text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10"
              :disabled="isLoading"
              @click="updateStatus('PENDING')"
            >
              <Icon name="lucide:clock" class="mr-2 h-4 w-4" />
              En attente
            </Button>
            <Button
              v-if="registration?.status !== 'CANCELLED'"
              variant="outline"
              size="sm"
              class="flex-1 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
              :disabled="isLoading"
              @click="updateStatus('CANCELLED')"
            >
              <Icon name="lucide:x" class="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </div>
        </div>
      </div>

      <SheetFooter class="mt-6">
        <Button
          variant="outline"
          class="w-full rounded-full"
          @click="emit('update:open', false)"
        >
          Fermer
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
