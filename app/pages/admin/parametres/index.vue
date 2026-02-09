<script setup lang="ts">
import { DatePicker } from "@/components/ui/date-picker";

definePageMeta({
  layout: "admin",
});

const settings = ref({
  siteName: "ACD MMI 2026",
  eventDate: new Date("2026-06-18") as Date | null,
  eventEndDate: new Date("2026-06-19") as Date | null,
  location: "IUT de Troyes",
  registrationOpen: true,
  maxParticipants: 200,
  earlyBirdPrice: 150,
  regularPrice: 180,
  latePrice: 200,
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p class="text-muted-foreground">Configuration générale du site</p>
      </div>
      <Button class="rounded-full">
        <Icon name="lucide:save" class="mr-2 h-4 w-4" />
        Sauvegarder
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Nom de l'événement</Label>
            <Input v-model="settings.siteName" class="rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label>Lieu</Label>
            <Input v-model="settings.location" class="rounded-xl" />
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
      </CardContent>
    </Card>

    <!-- Registration Settings -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:ticket" class="h-5 w-5 text-green-500" />
          </div>
          <div>
            <CardTitle>Inscriptions</CardTitle>
            <CardDescription>Paramètres des inscriptions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          class="flex items-center justify-between p-4 rounded-xl bg-muted/50"
        >
          <div>
            <p class="font-medium">Inscriptions ouvertes</p>
            <p class="text-sm text-muted-foreground">
              Autoriser les nouvelles inscriptions
            </p>
          </div>
          <Switch v-model="settings.registrationOpen" />
        </div>
        <div class="space-y-2">
          <Label>Nombre maximum de participants</Label>
          <Input
            type="number"
            v-model="settings.maxParticipants"
            class="rounded-xl"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Pricing Settings -->
    <Card class="rounded-2xl">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"
          >
            <Icon name="lucide:euro" class="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>Tarification</CardTitle>
            <CardDescription>Gestion des prix</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Tarif Early Bird (€)</Label>
            <Input
              type="number"
              v-model="settings.earlyBirdPrice"
              class="rounded-xl"
            />
            <p class="text-xs text-muted-foreground">Jusqu'au 31 mars</p>
          </div>
          <div class="space-y-2">
            <Label>Tarif Normal (€)</Label>
            <Input
              type="number"
              v-model="settings.regularPrice"
              class="rounded-xl"
            />
            <p class="text-xs text-muted-foreground">Jusqu'au 31 mai</p>
          </div>
          <div class="space-y-2">
            <Label>Tarif Tardif (€)</Label>
            <Input
              type="number"
              v-model="settings.latePrice"
              class="rounded-xl"
            />
            <p class="text-xs text-muted-foreground">À partir du 1er juin</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Danger Zone -->
    <Card class="rounded-2xl border-destructive/50">
      <CardHeader>
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"
          >
            <Icon
              name="lucide:alert-triangle"
              class="h-5 w-5 text-destructive"
            />
          </div>
          <div>
            <CardTitle class="text-destructive">Zone de danger</CardTitle>
            <CardDescription>Actions irréversibles</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          class="flex items-center justify-between p-4 rounded-xl bg-destructive/5"
        >
          <div>
            <p class="font-medium">Réinitialiser toutes les inscriptions</p>
            <p class="text-sm text-muted-foreground">
              Supprimer toutes les inscriptions existantes
            </p>
          </div>
          <Button variant="destructive" size="sm" class="rounded-full">
            Réinitialiser
          </Button>
        </div>
        <div
          class="flex items-center justify-between p-4 rounded-xl bg-destructive/5"
        >
          <div>
            <p class="font-medium">Supprimer toutes les données</p>
            <p class="text-sm text-muted-foreground">
              Effacer complètement la base de données
            </p>
          </div>
          <Button variant="destructive" size="sm" class="rounded-full">
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
