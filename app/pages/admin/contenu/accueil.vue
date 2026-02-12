<script setup lang="ts">
import { toast } from "vue-sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

definePageMeta({
  layout: "admin",
});

interface TabItem {
  key: string;
  label: string;
  title: string;
  description: string;
  stat: string;
  image: string;
}

interface CardItem {
  title: string;
  description: string;
  features: string[];
}

interface LogoItem {
  src: string;
  alt: string;
}

const { data: content, refresh } = await useFetch("/api/home-content");

const form = ref({
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  tabs: [] as TabItem[],
  gradientCards: [] as CardItem[],
  logos: [] as LogoItem[],
  contextTitle: "",
  contextText: "",
  ctaTitle: "",
  ctaText: "",
});

const saving = ref(false);

watchEffect(() => {
  if (content.value) {
    form.value = {
      heroBadge: content.value.heroBadge,
      heroTitle: content.value.heroTitle,
      heroSubtitle: content.value.heroSubtitle,
      heroImage: content.value.heroImage,
      tabs: (content.value.tabs as unknown as TabItem[]) || [],
      gradientCards:
        (content.value.gradientCards as unknown as CardItem[]) || [],
      logos: (content.value.logos as unknown as LogoItem[]) || [],
      contextTitle: content.value.contextTitle,
      contextText: content.value.contextText,
      ctaTitle: content.value.ctaTitle,
      ctaText: content.value.ctaText,
    };
  }
});

async function save() {
  saving.value = true;
  try {
    await $fetch("/api/home-content", {
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

const tabIcons: Record<string, string> = {
  partage: "lucide:handshake",
  travail: "lucide:briefcase",
  decouverte: "lucide:compass",
};

const cardIcons = ["lucide:book-open", "lucide:users", "lucide:shield-check"];

function addLogo() {
  form.value.logos.push({ src: "", alt: "" });
}

function removeLogo(index: number) {
  form.value.logos.splice(index, 1);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Contenu de l'accueil</h1>
        <p class="text-muted-foreground">
          Modifier les textes et images affichés sur la page d'accueil
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

    <!-- Tabs Navigation -->
    <Tabs default-value="hero" class="w-full">
      <TabsList class="w-full justify-start rounded-xl h-auto p-1 flex-wrap">
        <TabsTrigger
          value="hero"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:sparkles" class="h-4 w-4" />
          Hero
        </TabsTrigger>
        <TabsTrigger
          value="tabs"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:layout-list" class="h-4 w-4" />
          Onglets
        </TabsTrigger>
        <TabsTrigger
          value="cards"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:layout-grid" class="h-4 w-4" />
          Cartes
        </TabsTrigger>
        <TabsTrigger
          value="context"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:text" class="h-4 w-4" />
          Contexte
        </TabsTrigger>
        <TabsTrigger
          value="logos"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:image" class="h-4 w-4" />
          Logos
        </TabsTrigger>
        <TabsTrigger
          value="cta"
          class="rounded-lg gap-2 data-[state=active]:shadow-sm"
        >
          <Icon name="lucide:megaphone" class="h-4 w-4" />
          CTA
        </TabsTrigger>
      </TabsList>

      <!-- ==================== HERO TAB ==================== -->
      <TabsContent value="hero" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Icon name="lucide:sparkles" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Section Hero</CardTitle>
                <CardDescription>
                  Le titre principal, le badge et le sous-titre affichés en haut
                  de la page
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Badge (date & lieu)</Label>
              <Input
                v-model="form.heroBadge"
                class="rounded-xl"
                placeholder="15–17 Juin 2026 · IUT de Troyes"
              />
              <p class="text-xs text-muted-foreground">
                Affiché dans le petit badge en haut de la page
              </p>
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre principal</Label>
              <Input
                v-model="form.heroTitle"
                class="rounded-xl text-lg"
                placeholder="Assemblée des Chefs de Départements MMI"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Sous-titre</Label>
              <Textarea
                v-model="form.heroSubtitle"
                class="rounded-xl resize-none"
                rows="3"
                placeholder="L'IUT de Troyes accueille l'ACD MMI 2026..."
              />
            </div>
            <Separator />
            <!-- Hero Image -->
            <div class="space-y-2">
              <Label class="text-sm font-medium">
                <Icon name="lucide:image" class="h-3 w-3 inline mr-1" />
                Image de fond
              </Label>
              <Input
                v-model="form.heroImage"
                class="rounded-xl"
                placeholder="https://... ou /image.png"
              />
              <div
                v-if="form.heroImage"
                class="relative mt-2 rounded-xl overflow-hidden border h-32"
              >
                <img
                  :src="form.heroImage"
                  alt="Aperçu"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                />
                <span
                  class="absolute bottom-2 left-3 text-xs text-white/80 font-medium"
                >
                  Aperçu de l'image de fond
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Live Preview -->
        <Card class="rounded-2xl border-dashed">
          <CardHeader class="pb-3">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:eye" class="h-4 w-4" />
              <span class="text-sm font-medium">Aperçu</span>
            </div>
          </CardHeader>
          <CardContent>
            <div
              class="relative text-center space-y-3 py-6 rounded-xl overflow-hidden"
            >
              <div v-if="form.heroImage" class="absolute inset-0 -z-10">
                <img
                  :src="form.heroImage"
                  alt=""
                  class="w-full h-full object-cover opacity-10"
                />
              </div>
              <Badge variant="outline" class="rounded-full py-1 px-3 text-xs">
                {{ form.heroBadge || "Badge..." }}
              </Badge>
              <h2 class="text-2xl font-bold tracking-tight">
                {{ form.heroTitle || "Titre..." }}
              </h2>
              <p class="text-sm text-muted-foreground max-w-md mx-auto">
                {{ form.heroSubtitle || "Sous-titre..." }}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== TABS TAB ==================== -->
      <TabsContent value="tabs" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:layout-list" class="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Onglets interactifs</CardTitle>
                <CardDescription>
                  Les 3 onglets Partage / Travail / Découverte avec leurs images
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="(tab, index) in form.tabs"
              :key="tab.key"
              class="rounded-xl border bg-card p-5 space-y-4"
            >
              <!-- Tab header -->
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"
                >
                  <Icon
                    :name="tabIcons[tab.key] || 'lucide:tab'"
                    class="h-4 w-4"
                  />
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ tab.label }}</p>
                  <p class="text-xs text-muted-foreground">
                    Onglet {{ index + 1 }}/{{ form.tabs.length }}
                  </p>
                </div>
              </div>

              <Separator />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm">Titre</Label>
                  <Input
                    v-model="form.tabs[index]!.title"
                    class="rounded-xl"
                    placeholder="Titre de l'onglet"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm">Statistique</Label>
                  <Input
                    v-model="form.tabs[index]!.stat"
                    class="rounded-xl"
                    placeholder="50+ Chefs de départements"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-sm">Description</Label>
                <Textarea
                  v-model="form.tabs[index]!.description"
                  class="rounded-xl resize-none"
                  rows="2"
                  placeholder="Description de l'onglet..."
                />
              </div>

              <!-- Tab Image -->
              <Separator />
              <div class="space-y-2">
                <Label class="text-sm font-medium">
                  <Icon name="lucide:image" class="h-3 w-3 inline mr-1" />
                  Image
                </Label>
                <Input
                  v-model="form.tabs[index]!.image"
                  class="rounded-xl"
                  placeholder="https://... ou /image.png"
                />
                <div
                  v-if="tab.image"
                  class="relative mt-2 rounded-xl overflow-hidden border h-28"
                >
                  <img
                    :src="tab.image"
                    alt="Aperçu"
                    class="w-full h-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                  />
                  <span
                    class="absolute bottom-2 left-3 text-xs text-white/80 font-medium"
                  >
                    {{ tab.label }}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== CARDS TAB ==================== -->
      <TabsContent value="cards" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"
              >
                <Icon
                  name="lucide:layout-grid"
                  class="h-5 w-5 text-emerald-500"
                />
              </div>
              <div>
                <CardTitle>Cartes « Temps forts »</CardTitle>
                <CardDescription>
                  Les 3 cartes avec icônes et points clés
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="(card, index) in form.gradientCards"
              :key="index"
              class="rounded-xl border bg-card p-5 space-y-4"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"
                >
                  <Icon
                    :name="cardIcons[index] || 'lucide:star'"
                    class="h-4 w-4"
                  />
                </div>
                <div>
                  <p class="font-semibold text-sm">Carte {{ index + 1 }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ card.title || "Sans titre" }}
                  </p>
                </div>
              </div>

              <Separator />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm">Titre</Label>
                  <Input
                    v-model="form.gradientCards[index]!.title"
                    class="rounded-xl"
                    placeholder="Nouveaux Programmes"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm">Description</Label>
                  <Input
                    v-model="form.gradientCards[index]!.description"
                    class="rounded-xl"
                    placeholder="Adaptation au BUT"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label class="text-sm">Points clés</Label>
                <div class="space-y-2">
                  <div
                    v-for="(feature, fIndex) in card.features"
                    :key="fIndex"
                    class="flex items-center gap-2"
                  >
                    <div
                      class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <span class="text-xs font-semibold text-primary">{{
                        fIndex + 1
                      }}</span>
                    </div>
                    <Input
                      :model-value="feature"
                      @update:model-value="
                        form.gradientCards[index]!.features[fIndex] =
                          $event as string
                      "
                      class="rounded-xl"
                      placeholder="Point clé..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== LOGOS TAB ==================== -->
      <TabsContent value="logos" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center"
                >
                  <Icon name="lucide:image" class="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Logos partenaires</CardTitle>
                  <CardDescription>
                    Les logos affichés en bas de la section Hero
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                class="rounded-lg gap-2"
                @click="addLogo"
              >
                <Icon name="lucide:plus" class="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="(logo, index) in form.logos"
              :key="index"
              class="rounded-xl border bg-card p-5 space-y-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="h-9 w-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="logo.src"
                      :src="logo.src"
                      :alt="logo.alt"
                      class="h-6 w-6 object-contain"
                    />
                    <Icon
                      v-else
                      name="lucide:image"
                      class="h-4 w-4 text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p class="font-semibold text-sm">
                      {{ logo.alt || "Logo " + (index + 1) }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Logo {{ index + 1 }}/{{ form.logos.length }}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground hover:text-destructive"
                  @click="removeLogo(index)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm">URL de l'image</Label>
                  <Input
                    v-model="form.logos[index]!.src"
                    class="rounded-xl"
                    placeholder="https://... ou /logo.png"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm">Texte alternatif</Label>
                  <Input
                    v-model="form.logos[index]!.alt"
                    class="rounded-xl"
                    placeholder="IUT de Troyes"
                  />
                </div>
              </div>

              <!-- Logo Preview -->
              <div
                v-if="logo.src"
                class="flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-dashed h-20"
              >
                <img
                  :src="logo.src"
                  :alt="logo.alt"
                  class="max-h-full max-w-[200px] object-contain"
                />
              </div>
            </div>

            <div
              v-if="form.logos.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              <Icon
                name="lucide:image-off"
                class="h-8 w-8 mx-auto mb-2 opacity-50"
              />
              <p class="text-sm">Aucun logo ajouté</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== CONTEXT TAB ==================== -->
      <TabsContent value="context" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:text" class="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Section Contexte</CardTitle>
                <CardDescription>
                  Le paragraphe de mise en contexte de l'édition
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre</Label>
              <Input
                v-model="form.contextTitle"
                class="rounded-xl"
                placeholder="Une édition tournée vers l'avenir"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Texte</Label>
              <Textarea
                v-model="form.contextText"
                class="rounded-xl resize-none"
                rows="5"
                placeholder="Les échanges porteront sur les nouveaux programmes..."
              />
              <p class="text-xs text-muted-foreground">
                Ce texte sera affiché en pleine largeur dans un bandeau gris
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Live Preview -->
        <Card class="rounded-2xl border-dashed">
          <CardHeader class="pb-3">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:eye" class="h-4 w-4" />
              <span class="text-sm font-medium">Aperçu</span>
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-center space-y-3 py-4 bg-muted/30 rounded-xl p-6">
              <h3 class="text-lg font-semibold">
                {{ form.contextTitle || "Titre..." }}
              </h3>
              <p class="text-sm text-muted-foreground max-w-lg mx-auto">
                {{ form.contextText || "Texte..." }}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ==================== CTA TAB ==================== -->
      <TabsContent value="cta" class="mt-6 space-y-4">
        <Card class="rounded-2xl">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center"
              >
                <Icon name="lucide:megaphone" class="h-5 w-5 text-red-500" />
              </div>
              <div>
                <CardTitle>Appel à l'action (CTA)</CardTitle>
                <CardDescription>
                  La section finale avec la carte sur fond de carte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Titre</Label>
              <Input
                v-model="form.ctaTitle"
                class="rounded-xl"
                placeholder="Rejoignez l'Assemblée"
              />
            </div>
            <Separator />
            <div class="space-y-2">
              <Label class="text-sm font-medium">Texte</Label>
              <Textarea
                v-model="form.ctaText"
                class="rounded-xl resize-none"
                rows="3"
                placeholder="Participez à la construction de l'avenir du BUT MMI..."
              />
            </div>
          </CardContent>
        </Card>

        <!-- Live Preview -->
        <Card class="rounded-2xl border-dashed">
          <CardHeader class="pb-3">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:eye" class="h-4 w-4" />
              <span class="text-sm font-medium">Aperçu</span>
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-center space-y-3 py-8 bg-primary rounded-xl px-6">
              <h3 class="text-lg font-bold text-primary-foreground">
                {{ form.ctaTitle || "Titre..." }}
              </h3>
              <p class="text-sm text-primary-foreground/80 max-w-md mx-auto">
                {{ form.ctaText || "Texte..." }}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
