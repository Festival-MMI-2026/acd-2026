<script setup lang="ts">
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "vue-sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

definePageMeta({
  layout: "admin",
});

const { data: dbSettings, refresh } = await useFetch("/api/settings");

const settings = ref({
  siteName: "ACD MMI 2026",
  eventDate: new Date("2026-06-18") as Date | null,
  eventEndDate: new Date("2026-06-19") as Date | null,
  location: "IUT de Troyes",
  locationAddress: "9 Rue de Québec, 10000 Troyes",
  registrationOpen: true,
  maxParticipants: 200,
  earlyBirdPrice: 150,
  regularPrice: 180,
  latePrice: 200,
  headerBadgeText: "",
  maintenanceMode: false,
  showProgramme: true,
  showInscription: true,
  showAcces: true,
  showHotels: true,
  notificationEmails: [] as string[],
  sendInvoicePdf: true,
  vatRate: 0,
});

const newEmail = ref("");
const emailError = ref("");

function addEmail() {
  const email = newEmail.value.trim().toLowerCase();
  if (!email) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Adresse email invalide";
    return;
  }
  if (settings.value.notificationEmails.includes(email)) {
    emailError.value = "Cette adresse est déjà ajoutée";
    return;
  }
  settings.value.notificationEmails.push(email);
  newEmail.value = "";
  emailError.value = "";
}

function removeEmail(index: number) {
  settings.value.notificationEmails.splice(index, 1);
}

const saving = ref(false);

watchEffect(() => {
  if (dbSettings.value) {
    if (dbSettings.value.siteName)
      settings.value.siteName = dbSettings.value.siteName;
    if (dbSettings.value.eventDate)
      settings.value.eventDate = new Date(dbSettings.value.eventDate);
    if (dbSettings.value.eventEndDate)
      settings.value.eventEndDate = new Date(dbSettings.value.eventEndDate);
    if (dbSettings.value.location)
      settings.value.location = dbSettings.value.location;
    if (dbSettings.value.locationAddress)
      settings.value.locationAddress = dbSettings.value.locationAddress;
    settings.value.headerBadgeText = dbSettings.value.headerBadgeText ?? "";
    settings.value.maintenanceMode = dbSettings.value.maintenanceMode;
    settings.value.showProgramme = dbSettings.value.showProgramme;
    settings.value.showInscription = dbSettings.value.showInscription;
    settings.value.showAcces = dbSettings.value.showAcces;
    settings.value.showHotels = dbSettings.value.showHotels;
    settings.value.notificationEmails =
      dbSettings.value.notificationEmails ?? [];
    settings.value.sendInvoicePdf =
      dbSettings.value.sendInvoicePdf ?? true;
    settings.value.vatRate = dbSettings.value.vatRate ?? 0;
  }
});

async function save() {
  saving.value = true;
  try {
    await $fetch("/api/settings", {
      method: "PUT",
      body: {
        siteName: settings.value.siteName,
        eventDate: settings.value.eventDate,
        eventEndDate: settings.value.eventEndDate,
        location: settings.value.location,
        locationAddress: settings.value.locationAddress,
        headerBadgeText: settings.value.headerBadgeText,
        maintenanceMode: settings.value.maintenanceMode,
        showProgramme: settings.value.showProgramme,
        showInscription: settings.value.showInscription,
        showAcces: settings.value.showAcces,
        showHotels: settings.value.showHotels,
        notificationEmails: settings.value.notificationEmails,
        sendInvoicePdf: settings.value.sendInvoicePdf,
        vatRate: settings.value.vatRate,
      },
    });
    await refresh();
    toast.success("Paramètres sauvegardés avec succès");
  } catch (e) {
    toast.error("Impossible de sauvegarder les paramètres");
  } finally {
    saving.value = false;
  }
}

// --- Clear data ---
const clearOptions = ref([
  {
    key: "programme",
    label: "Programme",
    description: "Tous les événements du programme",
    icon: "lucide:calendar",
    checked: false,
  },
  {
    key: "meals",
    label: "Repas",
    description: "Tous les repas et leurs options",
    icon: "lucide:utensils",
    checked: false,
  },
  {
    key: "activities",
    label: "Activités",
    description: "Toutes les activités",
    icon: "lucide:activity",
    checked: false,
  },
  {
    key: "registrations",
    label: "Inscriptions & Paiements",
    description: "Toutes les inscriptions, commandes et paiements",
    icon: "lucide:users",
    checked: false,
  },
  {
    key: "orders",
    label: "Paiements uniquement",
    description: "Uniquement les commandes / paiements",
    icon: "lucide:credit-card",
    checked: false,
  },
  {
    key: "hotels",
    label: "Hôtels",
    description: "Tous les hôtels partenaires",
    icon: "lucide:building-2",
    checked: false,
  },
  {
    key: "iuts",
    label: "IUTs",
    description: "Tous les IUTs répertoriés",
    icon: "lucide:graduation-cap",
    checked: false,
  },
]);

const showClearDialog = ref(false);
const clearing = ref(false);

const selectedClearTables = computed(() =>
  clearOptions.value.filter((o) => o.checked).map((o) => o.key),
);

const hasSelection = computed(() => selectedClearTables.value.length > 0);

async function executeClear() {
  clearing.value = true;
  try {
    await $fetch("/api/settings/clear-data", {
      method: "DELETE",
      body: { tables: selectedClearTables.value },
    });
    clearOptions.value.forEach((o) => (o.checked = false));
    showClearDialog.value = false;
    toast.success("Données supprimées avec succès");
  } catch (e) {
    toast.error("Erreur lors de la suppression des données");
  } finally {
    clearing.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p class="text-muted-foreground">Configuration générale du site</p>
      </div>
      <Button class="rounded-full" :disabled="saving" @click="save">
        <Icon
          :name="saving ? 'lucide:loader-2' : 'lucide:save'"
          :class="['mr-2 h-4 w-4', saving && 'animate-spin']"
        />
        {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
      </Button>
    </div>

    <!-- General Settings -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:settings" class="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Paramètres généraux</CardTitle>
            <CardDescription
              >Informations de base de l'événement</CardDescription
            >
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Nom de l'événement</Label>
            <Input v-model="settings.siteName" class="rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label>Lieu (nom)</Label>
            <Input v-model="settings.location" class="rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label>Adresse du lieu</Label>
            <Input
              v-model="settings.locationAddress"
              class="rounded-xl"
              placeholder="ex: 9 Rue de Québec, 10000 Troyes"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Date de début</Label>
            <DatePicker
              v-model="settings.eventDate"
              placeholder="Sélectionner la date de début"
            />
          </div>
          <div class="space-y-2">
            <Label>Date de fin</Label>
            <DatePicker
              v-model="settings.eventEndDate"
              placeholder="Sélectionner la date de fin"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Texte du badge header</Label>
          <Input
            v-model="settings.headerBadgeText"
            class="rounded-xl"
            placeholder="Édition 2026"
          />
          <p class="text-xs text-muted-foreground">
            Texte affiché dans le badge à côté du logo dans le header
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Facturation -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:percent" class="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle>Facturation</CardTitle>
            <CardDescription>Taux de TVA appliqué aux factures</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Taux de TVA (%)</Label>
            <Input
              v-model.number="settings.vatRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              class="rounded-xl"
              placeholder="0"
            />
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          Les prix sont saisis TTC (TVA incluse). Ce taux sert uniquement à
          afficher le détail de la TVA sur les factures ; il ne modifie pas le
          montant payé. Laisser à 0 pour ne pas afficher de TVA.
        </p>
      </CardContent>
    </Card>

    <!-- Maintenance Mode -->
    <Card
      :class="[
        'rounded-2xl transition-colors',
        settings.maintenanceMode ? 'border-orange-500/40 bg-orange-500/5' : '',
      ]"
    >
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            :class="[
              'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
              settings.maintenanceMode
                ? 'bg-orange-500/20'
                : 'bg-muted/50',
            ]"
          >
            <Icon
              name="lucide:wrench"
              :class="[
                'h-5 w-5 transition-colors',
                settings.maintenanceMode
                  ? 'text-orange-500'
                  : 'text-muted-foreground',
              ]"
            />
          </div>
          <div class="flex-1">
            <CardTitle>Mode maintenance</CardTitle>
            <CardDescription>
              Le site public est inaccessible, seul l'admin reste disponible
            </CardDescription>
          </div>
          <Switch v-model="settings.maintenanceMode" @update:model-value="save" />
        </div>
      </CardHeader>
      <CardContent v-if="settings.maintenanceMode">
        <div
          class="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-500/10 rounded-xl px-4 py-3"
        >
          <Icon name="lucide:triangle-alert" class="h-4 w-4 shrink-0" />
          Le site est actuellement en maintenance. Les visiteurs voient la page
          de maintenance.
        </div>
      </CardContent>
    </Card>

    <!-- Page Visibility -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:eye" class="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <CardTitle>Visibilité des pages</CardTitle>
            <CardDescription
              >Masquer ou afficher les pages publiques du site</CardDescription
            >
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Programme</ItemTitle>
            <ItemDescription> Afficher la page Programme </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch v-model="settings.showProgramme" />
          </ItemActions>
        </Item>

        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Inscription</ItemTitle>
            <ItemDescription> Afficher la page Inscription </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch v-model="settings.showInscription" />
          </ItemActions>
        </Item>

        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Accès</ItemTitle>
            <ItemDescription>
              Afficher la page Accès & Transports
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch v-model="settings.showAcces" />
          </ItemActions>
        </Item>

        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Hébergement</ItemTitle>
            <ItemDescription> Afficher la page Hébergement </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch v-model="settings.showHotels" />
          </ItemActions>
        </Item>
      </CardContent>
    </Card>

    <!-- Notification Emails -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:mail" class="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>Notifications d'inscription</CardTitle>
            <CardDescription
              >Adresses email qui recevront une notification à chaque nouvelle
              inscription</CardDescription
            >
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Send invoice PDF toggle -->
        <div class="flex items-start justify-between gap-4 rounded-xl border bg-muted/30 px-4 py-3">
          <div class="space-y-0.5">
            <Label for="sendInvoicePdf" class="text-sm font-medium cursor-pointer">
              Envoyer la facture PDF par email
            </Label>
            <p class="text-xs text-muted-foreground">
              Si activé, la facture PDF est jointe à l'email de confirmation envoyé à l'inscrit
            </p>
          </div>
          <Switch
            id="sendInvoicePdf"
            v-model="settings.sendInvoicePdf"
            @update:model-value="save"
          />
        </div>

        <div class="flex gap-2">
          <div class="flex-1 space-y-1">
            <Input
              v-model="newEmail"
              class="rounded-xl"
              type="email"
              placeholder="exemple@email.com"
              @keydown.enter.prevent="addEmail"
            />
            <p v-if="emailError" class="text-xs text-destructive">
              {{ emailError }}
            </p>
          </div>
          <Button
            variant="outline"
            class="rounded-xl shrink-0"
            @click="addEmail"
          >
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>

        <div
          v-if="settings.notificationEmails.length === 0"
          class="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-xl"
        >
          Aucune adresse configurée. Les notifications d'inscription ne seront
          pas envoyées.
        </div>

        <div v-else class="space-y-2">
          <Item
            v-for="(email, index) in settings.notificationEmails"
            :key="email"
            variant="outline"
          >
            <ItemContent>
              <ItemTitle class="font-mono text-sm">{{ email }}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-muted-foreground hover:text-destructive"
                @click="removeEmail(index)"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </Button>
            </ItemActions>
          </Item>
        </div>
      </CardContent>
    </Card>

    <!-- Danger Zone -->
    <Card class="rounded-2xl border-destructive/20">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"
          >
            <Icon name="lucide:trash-2" class="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle>Purger les données</CardTitle>
            <CardDescription>
              Sélectionnez les données à supprimer définitivement
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="option in clearOptions"
            :key="option.key"
            :class="[
              'group relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200',
              option.checked
                ? 'border-destructive bg-destructive/5 shadow-sm'
                : 'border-border hover:border-destructive/40 hover:bg-muted/30',
            ]"
            @click="option.checked = !option.checked"
          >
            <div class="flex items-center justify-between">
              <div
                :class="[
                  'h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
                  option.checked
                    ? 'bg-destructive/15'
                    : 'bg-muted/50 group-hover:bg-destructive/10',
                ]"
              >
                <Icon
                  :name="option.icon"
                  :class="[
                    'h-4 w-4 transition-colors',
                    option.checked
                      ? 'text-destructive'
                      : 'text-muted-foreground group-hover:text-destructive/70',
                  ]"
                />
              </div>
              <Checkbox
                :model-value="option.checked"
                @update:model-value="option.checked = !!$event"
                @click.stop
              />
            </div>
            <div>
              <p
                :class="[
                  'font-medium text-sm',
                  option.checked && 'text-destructive',
                ]"
              >
                {{ option.label }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ option.description }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter
        class="border-t bg-muted/20 flex items-center justify-between gap-4 rounded-b-2xl"
      >
        <p class="text-xs text-muted-foreground">
          <template v-if="hasSelection">
            {{ selectedClearTables.length }} catégorie{{
              selectedClearTables.length > 1 ? "s" : ""
            }}
            sélectionnée{{ selectedClearTables.length > 1 ? "s" : "" }}
          </template>
          <template v-else> Aucune sélection </template>
        </p>
        <Button
          variant="destructive"
          size="sm"
          class="rounded-full"
          :disabled="!hasSelection"
          @click="showClearDialog = true"
        >
          <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>

    <!-- Confirm clear dialog -->
    <AlertDialog
      :open="showClearDialog"
      @update:open="showClearDialog = $event"
    >
      <AlertDialogContent class="rounded-2xl">
        <AlertDialogHeader>
          <div
            class="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2"
          >
            <Icon
              name="lucide:alert-triangle"
              class="h-6 w-6 text-destructive"
            />
          </div>
          <AlertDialogTitle class="text-center">
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription class="text-center">
            Cette action est irréversible. Les données suivantes seront
            définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="space-y-2 py-2">
          <div
            v-for="option in clearOptions.filter((o) => o.checked)"
            :key="option.key"
            class="flex items-center gap-3 p-3 rounded-xl bg-destructive/5"
          >
            <div
              class="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"
            >
              <Icon :name="option.icon" class="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p class="text-sm font-medium">{{ option.label }}</p>
              <p class="text-xs text-muted-foreground">
                {{ option.description }}
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter class="gap-2 sm:gap-2">
          <AlertDialogCancel
            class="rounded-full flex-1"
            @click="showClearDialog = false"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            class="rounded-full flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="clearing"
            @click="executeClear"
          >
            <Icon
              v-if="clearing"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ clearing ? "Suppression..." : "Supprimer" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
