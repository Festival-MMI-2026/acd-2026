<script setup lang="ts">
import { toast } from "vue-sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

definePageMeta({
  layout: "admin",
});

const { data: content, refresh } = await useFetch("/api/access-content");

const form = ref({
  pageTitle: "",
  pageSubtitle: "",
  locationTitle: "",
  locationName: "",
  locationAddress1: "",
  locationAddress2: "",
  locationMapUrl: "",
  trainTitle: "",
  trainStation: "",
  trainDuration: "",
  trainAccessTitle: "",
  trainAccessLine: "",
  trainAccessTime: "",
  carTitle: "",
  carParking: "",
  carAccess: "",
  mapLatitude: 48.2682678,
  mapLongitude: 4.079772,
  mapTooltipTitle: "",
  mapTooltipSubtitle: "",
});

const saving = ref(false);

watchEffect(() => {
  if (content.value) {
    form.value = {
      pageTitle: content.value.pageTitle,
      pageSubtitle: content.value.pageSubtitle,
      locationTitle: content.value.locationTitle,
      locationName: content.value.locationName,
      locationAddress1: content.value.locationAddress1,
      locationAddress2: content.value.locationAddress2,
      locationMapUrl: content.value.locationMapUrl,
      trainTitle: content.value.trainTitle,
      trainStation: content.value.trainStation,
      trainDuration: content.value.trainDuration,
      trainAccessTitle: content.value.trainAccessTitle,
      trainAccessLine: content.value.trainAccessLine,
      trainAccessTime: content.value.trainAccessTime,
      carTitle: content.value.carTitle,
      carParking: content.value.carParking,
      carAccess: content.value.carAccess,
      mapLatitude: content.value.mapLatitude,
      mapLongitude: content.value.mapLongitude,
      mapTooltipTitle: content.value.mapTooltipTitle,
      mapTooltipSubtitle: content.value.mapTooltipSubtitle,
    };
  }
});

async function save() {
  saving.value = true;
  try {
    await $fetch("/api/access-content", {
      method: "PUT",
      body: form.value,
    });
    await refresh();
    toast.success("Contenu sauvegardé avec succès");
  } catch (e) {
    toast.error("Impossible de sauvegarder les modifications");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Page Accès</h1>
        <p class="text-muted-foreground">
          Modifier les informations de la page Accès & Transports
        </p>
      </div>
      <Button class="rounded-full" :disabled="saving" @click="save">
        <Icon
          :name="saving ? 'lucide:loader-2' : 'lucide:save'"
          :class="['mr-2 h-4 w-4', saving && 'animate-spin']"
        />
        {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs default-value="header" class="w-full">
      <TabsList class="w-full justify-start rounded-xl h-auto p-1 flex-wrap">
        <TabsTrigger
          value="header"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:heading" class="h-4 w-4" />
          En-tête
        </TabsTrigger>
        <TabsTrigger
          value="location"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:map-pin" class="h-4 w-4" />
          Lieu
        </TabsTrigger>
        <TabsTrigger
          value="train"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:train" class="h-4 w-4" />
          Train
        </TabsTrigger>
        <TabsTrigger
          value="car"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:car" class="h-4 w-4" />
          Voiture
        </TabsTrigger>
        <TabsTrigger
          value="map"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:map" class="h-4 w-4" />
          Carte
        </TabsTrigger>
      </TabsList>

      <!-- ==================== HEADER ==================== -->
      <TabsContent value="header" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Icon name="lucide:heading" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>En-tête de la page</CardTitle>
                <CardDescription>
                  Le titre et la description affichés en haut de la page Accès
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre</Label>
              <Input
                v-model="form.pageTitle"
                class="rounded-xl text-lg"
                placeholder="Accès & Transports"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Sous-titre</Label>
              <Textarea
                v-model="form.pageSubtitle"
                class="rounded-xl resize-none"
                rows="2"
                placeholder="Toutes les informations pour vous rendre..."
              />
            </div>
          </CardContent>
        </Card>

        <!-- Preview -->
        <Card class="rounded-2xl border-dashed">
          <CardHeader class="pb-3">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:eye" class="h-4 w-4" />
              <span class="text-sm font-medium">Aperçu</span>
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-center space-y-2 py-6">
              <h2 class="text-2xl font-bold tracking-tight">
                {{ form.pageTitle || "Titre..." }}
              </h2>
              <p class="text-sm text-muted-foreground max-w-md mx-auto">
                {{ form.pageSubtitle || "Sous-titre..." }}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== LOCATION ==================== -->
      <TabsContent value="location" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:map-pin" class="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Carte « Le lieu »</CardTitle>
                <CardDescription>
                  Informations sur le lieu de l'événement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre de la carte</Label>
              <Input
                v-model="form.locationTitle"
                class="rounded-xl"
                placeholder="Le lieu"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Nom du lieu</Label>
              <Input
                v-model="form.locationName"
                class="rounded-xl"
                placeholder="IUT de Troyes"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium">Adresse ligne 1</Label>
                <Input
                  v-model="form.locationAddress1"
                  class="rounded-xl"
                  placeholder="9 Rue de Québec"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium">Adresse ligne 2</Label>
                <Input
                  v-model="form.locationAddress2"
                  class="rounded-xl"
                  placeholder="10000 Troyes"
                />
              </div>
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">
                <Icon name="lucide:external-link" class="h-3 w-3 inline mr-1" />
                URL Google Maps
              </Label>
              <Input
                v-model="form.locationMapUrl"
                class="rounded-xl"
                placeholder="https://www.google.com/maps/dir/..."
              />
              <p class="text-xs text-muted-foreground">
                Lien utilisé pour le bouton « Itinéraire Google Maps »
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== TRAIN ==================== -->
      <TabsContent value="train" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:train" class="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle>Carte « Venir en train »</CardTitle>
                <CardDescription>
                  Informations sur l'accès en train
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre de la carte</Label>
              <Input
                v-model="form.trainTitle"
                class="rounded-xl"
                placeholder="Venir en train"
              />
            </div>
            <Separator />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium">Nom de la gare</Label>
                <Input
                  v-model="form.trainStation"
                  class="rounded-xl"
                  placeholder="Gare de Troyes"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium">Durée du trajet</Label>
                <Input
                  v-model="form.trainDuration"
                  class="rounded-xl"
                  placeholder="À 1h30 de Paris-Est (TER Grand Est)"
                />
              </div>
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre accès local</Label>
              <Input
                v-model="form.trainAccessTitle"
                class="rounded-xl"
                placeholder="Accès depuis la gare"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Ligne de bus</Label>
              <Input
                v-model="form.trainAccessLine"
                class="rounded-xl"
                placeholder="Bus Ligne 6..."
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Temps de trajet</Label>
              <Input
                v-model="form.trainAccessTime"
                class="rounded-xl"
                placeholder="Environ 15 minutes de trajet."
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== CAR ==================== -->
      <TabsContent value="car" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:car" class="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Carte « Venir en voiture »</CardTitle>
                <CardDescription>
                  Informations sur l'accès en voiture
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre de la carte</Label>
              <Input
                v-model="form.carTitle"
                class="rounded-xl"
                placeholder="Venir en voiture"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Parking</Label>
              <Textarea
                v-model="form.carParking"
                class="rounded-xl resize-none"
                rows="2"
                placeholder="Parking gratuit disponible..."
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Accès routier</Label>
              <Input
                v-model="form.carAccess"
                class="rounded-xl"
                placeholder="Accès facile depuis l'A5 et l'A26."
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== MAP ==================== -->
      <TabsContent value="map" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:map" class="h-5 w-5 text-red-500" />
              </div>
              <div>
                <CardTitle>Carte interactive</CardTitle>
                <CardDescription>
                  Position du marqueur et texte de l'info-bulle
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium">
                  <Icon name="lucide:navigation" class="h-3 w-3 inline mr-1" />
                  Latitude
                </Label>
                <Input
                  v-model.number="form.mapLatitude"
                  type="number"
                  step="0.0000001"
                  class="rounded-xl"
                  placeholder="48.2682678"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium">
                  <Icon name="lucide:navigation" class="h-3 w-3 inline mr-1" />
                  Longitude
                </Label>
                <Input
                  v-model.number="form.mapLongitude"
                  type="number"
                  step="0.0000001"
                  class="rounded-xl"
                  placeholder="4.079772"
                />
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Coordonnées GPS du marqueur affiché sur la carte. Vous pouvez les
              trouver sur Google Maps.
            </p>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre</Label>
              <Input
                v-model="form.mapTooltipTitle"
                class="rounded-xl"
                placeholder="IUT de Troyes"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Sous-titre</Label>
              <Input
                v-model="form.mapTooltipSubtitle"
                class="rounded-xl"
                placeholder="Lieu de l'ACD MMI 2026"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Preview -->
        <Card class="rounded-2xl border-dashed">
          <CardHeader class="pb-3">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:eye" class="h-4 w-4" />
              <span class="text-sm font-medium">Aperçu de l'info-bulle</span>
            </div>
          </CardHeader>
          <CardContent>
            <div
              class="inline-block mx-auto bg-white text-black rounded-lg shadow-lg px-4 py-2 text-center"
            >
              <p class="font-bold text-sm">
                {{ form.mapTooltipTitle || "Titre..." }}
              </p>
              <p class="text-xs">
                {{ form.mapTooltipSubtitle || "Sous-titre..." }}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
