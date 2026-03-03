<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  layout: "admin",
});

// ── Scanner state ──────────────────────────────────────────────────
const videoRef = ref<HTMLVideoElement | null>(null);
const scanning = ref(false);
const cameraError = ref<string | null>(null);
const lastScannedId = ref<string | null>(null);

// ── Result state ───────────────────────────────────────────────────
const result = ref<any>(null);
const resultError = ref<string | null>(null);
const isChecking = ref(false);

// ── Registrations (confirmed only for the list) ─────────────────────
const { data: registrations, refresh: refreshList } = await useFetch<any[]>(
  "/api/registrations",
);

const confirmedRegistrations = computed(() =>
  (registrations.value || []).filter((r) => r.status === "CONFIRMED"),
);

const stats = computed(() => ({
  total: confirmedRegistrations.value.length,
  present: confirmedRegistrations.value.filter((r) => r.checkedIn).length,
}));

// ── List search ─────────────────────────────────────────────────────
const listSearch = ref("");
const filteredList = computed(() => {
  const q = listSearch.value.toLowerCase().trim();
  if (!q) return confirmedRegistrations.value;
  return confirmedRegistrations.value.filter(
    (r) =>
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q),
  );
});

function selectFromList(reg: any) {
  result.value = { ...reg };
  resultError.value = null;
  lastScannedId.value = reg.id;
}

// ── Camera ────────────────────────────────────────────────────────
let animFrameId: number | null = null;
let detector: any = null;
let stream: MediaStream | null = null;

async function startScanner() {
  cameraError.value = null;
  result.value = null;
  resultError.value = null;
  lastScannedId.value = null;

  if (!("BarcodeDetector" in window)) {
    cameraError.value =
      "Votre navigateur ne supporte pas le scanner QR. Utilisez Chrome ou Safari sur mobile.";
    return;
  }

  try {
    // @ts-ignore
    detector = new BarcodeDetector({ formats: ["qr_code"] });

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    if (!videoRef.value) return;
    videoRef.value.srcObject = stream;
    await videoRef.value.play();
    scanning.value = true;
    scanFrame();
  } catch (err: any) {
    cameraError.value =
      err.name === "NotAllowedError"
        ? "Accès à la caméra refusé. Autorisez l'accès dans les paramètres de votre navigateur."
        : "Impossible d'accéder à la caméra.";
  }
}

function stopScanner() {
  scanning.value = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
}

async function scanFrame() {
  if (!scanning.value || !videoRef.value || !detector) return;

  try {
    const barcodes = await detector.detect(videoRef.value);
    if (barcodes.length > 0) {
      const value: string = barcodes[0].rawValue;
      if (value && value !== lastScannedId.value) {
        lastScannedId.value = value;
        await handleQrCode(value);
      }
    }
  } catch (_) {
    // Ignore detection errors silently
  }

  animFrameId = requestAnimationFrame(scanFrame);
}

async function handleQrCode(value: string) {
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = value.match(uuidRegex);
  const id = match ? match[0] : value;

  result.value = null;
  resultError.value = null;

  try {
    const reg = await $fetch<any>(`/api/registrations/${id}`);
    result.value = reg;
  } catch {
    resultError.value = `QR invalide ou inscription introuvable (${id.slice(0, 8)}…)`;
  }
}

async function confirmCheckin() {
  if (!result.value) return;
  isChecking.value = true;
  try {
    await $fetch(`/api/registrations/${result.value.id}/checkin`, {
      method: "PATCH",
      body: { checkedIn: true },
    });
    result.value.checkedIn = true;
    result.value.checkedInAt = new Date().toISOString();
    toast.success(
      `${result.value.firstName} ${result.value.lastName} — Présence confirmée ✓`,
    );
    refreshList();
    setTimeout(resetScan, 3000);
  } catch {
    toast.error("Erreur lors du check-in");
  } finally {
    isChecking.value = false;
  }
}

async function undoCheckin() {
  if (!result.value) return;
  isChecking.value = true;
  try {
    await $fetch(`/api/registrations/${result.value.id}/checkin`, {
      method: "PATCH",
      body: { checkedIn: false },
    });
    result.value.checkedIn = false;
    result.value.checkedInAt = null;
    toast.success("Check-in annulé");
    refreshList();
  } catch {
    toast.error("Erreur lors de l'annulation");
  } finally {
    isChecking.value = false;
  }
}

function resetScan() {
  result.value = null;
  resultError.value = null;
  lastScannedId.value = null;
}

// ── Manual search ───────────────────────────────────────────────────
const manualInput = ref("");
const isManualSearching = ref(false);

async function manualSearch() {
  const val = manualInput.value.trim();
  if (!val) return;
  isManualSearching.value = true;
  await handleQrCode(val);
  isManualSearching.value = false;
}

// Cleanup on unmount
onUnmounted(() => {
  stopScanner();
});

function formatDate(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Check-in</h1>
        <p class="text-muted-foreground">Scanner les QR codes des participants</p>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-2xl font-bold tabular-nums">
            {{ stats.present }}
            <span class="text-muted-foreground text-base font-normal">/ {{ stats.total }}</span>
          </p>
          <p class="text-xs text-muted-foreground">inscrits confirmés présents</p>
        </div>
        <div class="relative h-12 w-12">
          <svg class="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" stroke-width="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="hsl(var(--primary))" stroke-width="3"
              stroke-dasharray="100" stroke-linecap="round"
              :stroke-dashoffset="stats.total ? 100 - (stats.present / stats.total) * 100 : 100"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Col 1 : Scanner + Saisie manuelle -->
      <div class="space-y-4">
        <Card class="rounded-2xl overflow-hidden">
          <ClientOnly>
            <div class="relative bg-black aspect-square">
              <video ref="videoRef" class="w-full h-full object-cover" muted playsinline />

              <!-- Scan overlay -->
              <div v-if="scanning" class="absolute inset-0 flex items-center justify-center">
                <div class="relative w-56 h-56">
                  <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" />
                  <div class="absolute inset-x-0 top-0 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>

              <!-- Idle -->
              <div v-if="!scanning && !cameraError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
                <Icon name="lucide:scan-qr-code" class="h-16 w-16 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">Caméra inactive</p>
              </div>

              <!-- Error -->
              <div v-if="cameraError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-destructive/10 p-6 text-center">
                <Icon name="lucide:camera-off" class="h-12 w-12 text-destructive" />
                <p class="text-sm text-destructive">{{ cameraError }}</p>
              </div>
            </div>

            <template #fallback>
              <div class="aspect-square bg-muted flex items-center justify-center">
                <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </template>
          </ClientOnly>

          <CardContent class="p-4">
            <div class="flex gap-2">
              <Button v-if="!scanning" class="flex-1 rounded-full" @click="startScanner">
                <Icon name="lucide:camera" class="h-4 w-4" />
                Démarrer le scanner
              </Button>
              <Button v-else variant="outline" class="flex-1 rounded-full" @click="stopScanner">
                <Icon name="lucide:square" class="h-4 w-4" />
                Arrêter
              </Button>
              <Button
                v-if="result || resultError"
                variant="ghost"
                size="icon"
                class="rounded-full"
                @click="resetScan"
                title="Nouveau scan"
              >
                <Icon name="lucide:refresh-cw" class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Saisie manuelle -->
        <Card class="rounded-xl">
          <CardContent class="p-4 space-y-3">
            <p class="text-sm font-medium flex items-center gap-1.5">
              <Icon name="lucide:keyboard" class="h-4 w-4 text-muted-foreground" />
              Saisie manuelle
            </p>
            <div class="flex gap-2">
              <Input
                v-model="manualInput"
                placeholder="ID d'inscription…"
                class="flex-1 font-mono text-xs rounded-full"
                @keyup.enter="manualSearch"
              />
              <Button
                size="sm"
                class="rounded-full"
                :disabled="!manualInput.trim() || isManualSearching"
                @click="manualSearch"
              >
                <Icon v-if="isManualSearching" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                <Icon v-else name="lucide:search" class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Col 2 : Résultat du scan -->
      <div>
        <!-- Error -->
        <Card v-if="resultError" class="rounded-2xl border-destructive/40 bg-destructive/5">
          <CardContent class="p-6 flex flex-col items-center gap-3 text-center">
            <div class="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <Icon name="lucide:x-circle" class="h-7 w-7 text-destructive" />
            </div>
            <p class="font-semibold text-destructive">QR invalide</p>
            <p class="text-sm text-muted-foreground">{{ resultError }}</p>
            <Button variant="outline" size="sm" class="rounded-full" @click="resetScan">
              Réessayer
            </Button>
          </CardContent>
        </Card>

        <!-- Already checked in -->
        <Card v-else-if="result && result.checkedIn" class="rounded-2xl border-amber-500/40 bg-amber-500/5">
          <CardContent class="p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Icon name="lucide:alert-circle" class="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p class="font-bold text-lg">{{ result.firstName }} {{ result.lastName }}</p>
                <p class="text-sm text-muted-foreground">{{ result.email }}</p>
              </div>
            </div>

            <div class="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Icon name="lucide:clock" class="h-4 w-4 shrink-0" />
              Déjà enregistré{{ result.checkedInAt ? " le " + formatDate(result.checkedInAt) : "" }}
            </div>

            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                class="rounded-full flex-1"
                :disabled="isChecking"
                @click="undoCheckin"
              >
                <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
                Annuler le check-in
              </Button>
              <Button variant="ghost" size="sm" class="rounded-full" @click="resetScan">
                <Icon name="lucide:refresh-cw" class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Valid — not yet checked in -->
        <Card v-else-if="result" class="rounded-2xl border-green-500/40 bg-green-500/5">
          <CardContent class="p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Icon name="lucide:user-check" class="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="font-bold text-lg">{{ result.firstName }} {{ result.lastName }}</p>
                <p class="text-sm text-muted-foreground">{{ result.email }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-lg bg-muted/60 p-3">
                <p class="text-muted-foreground text-xs mb-0.5">Statut</p>
                <p class="font-medium">
                  {{ result.status === "CONFIRMED" ? "Confirmé" : result.status === "PENDING" ? "En attente" : "Annulé" }}
                </p>
              </div>
              <div class="rounded-lg bg-muted/60 p-3">
                <p class="text-muted-foreground text-xs mb-0.5">Total</p>
                <p class="font-medium">{{ Number(result.totalPrice).toFixed(2) }} €</p>
              </div>
              <div class="rounded-lg bg-muted/60 p-3 col-span-2">
                <p class="text-muted-foreground text-xs mb-0.5">Activités</p>
                <p class="font-medium">
                  {{ result.activities?.length ? result.activities.map((a: any) => a.activity?.name).join(", ") : "Aucune" }}
                </p>
              </div>
            </div>

            <Button
              class="w-full rounded-full h-12 text-base"
              :disabled="isChecking"
              @click="confirmCheckin"
            >
              <Icon v-if="isChecking" name="lucide:loader-2" class="h-5 w-5 animate-spin" />
              <Icon v-else name="lucide:check-circle" class="h-5 w-5" />
              {{ isChecking ? "Enregistrement..." : "Confirmer la présence" }}
            </Button>
          </CardContent>
        </Card>

        <!-- Empty state -->
        <div v-else class="h-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Icon name="lucide:qr-code" class="h-16 w-16 mb-4 opacity-20" />
          <p class="text-sm">Scannez ou sélectionnez un participant</p>
        </div>
      </div>

      <!-- Col 3 : Liste des inscrits confirmés -->
      <Card class="rounded-xl flex flex-col">
        <CardHeader class="pb-3 shrink-0">
          <CardTitle class="text-base">Inscrits confirmés</CardTitle>
          <Input
            v-model="listSearch"
            placeholder="Rechercher…"
            class="mt-2 rounded-full text-sm"
          />
        </CardHeader>
        <CardContent class="p-2 overflow-y-auto flex-1" style="max-height: 520px">
          <div
            v-for="reg in filteredList"
            :key="reg.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-muted/60"
            :class="result?.id === reg.id ? 'bg-muted' : ''"
            @click="selectFromList(reg)"
          >
            <Avatar class="h-8 w-8 shrink-0">
              <AvatarFallback class="bg-muted text-foreground text-xs">
                {{ reg.firstName?.charAt(0) }}{{ reg.lastName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ reg.firstName }} {{ reg.lastName }}
              </p>
              <p class="text-xs text-muted-foreground truncate">{{ reg.email }}</p>
            </div>
            <div class="shrink-0">
              <span
                v-if="reg.checkedIn"
                class="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"
              >
                <Icon name="lucide:check-circle" class="h-3.5 w-3.5" />
              </span>
              <span v-else class="inline-flex items-center gap-1 text-xs text-muted-foreground/40">
                <Icon name="lucide:circle" class="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div v-if="filteredList.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            Aucun inscrit trouvé
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style>
@keyframes scan {
  0%   { top: 0; }
  50%  { top: calc(100% - 2px); }
  100% { top: 0; }
}
</style>
