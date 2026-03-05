<script setup lang="ts">
import { QrcodeStream } from "vue-qrcode-reader";
import type { DetectedBarcode } from "barcode-detector/pure";
import { toast } from "vue-sonner";

definePageMeta({ layout: "admin" });

// ── Registrations ──────────────────────────────────────────────────
const { data: registrations, refresh: refreshList } = await useFetch<any[]>(
  "/api/registrations",
);

const confirmedRegistrations = computed(() =>
  (registrations.value || []).filter((r) => r.status === "CONFIRMED"),
);

const stats = computed(() => {
  const total = confirmedRegistrations.value.length;
  const present = confirmedRegistrations.value.filter((r) => r.checkedIn).length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, percentage };
});

// ── Result state ───────────────────────────────────────────────────
const result = ref<any>(null);
const resultError = ref<string | null>(null);
const isChecking = ref(false);
const lastScannedId = ref<string | null>(null);

// ── Camera ─────────────────────────────────────────────────────────
const scanning = ref(false);
const cameraReady = ref(false);
const cameraError = ref<string | null>(null);
const cameras = ref<MediaDeviceInfo[]>([]);
const currentCameraIndex = ref(0);
const currentConstraints = ref<MediaTrackConstraints>({
  facingMode: { ideal: "environment" },
});

function startScanner() {
  cameraError.value = null;
  cameraReady.value = false;
  scanning.value = true;
}

function stopScanner() {
  scanning.value = false;
  cameraReady.value = false;
  cameras.value = [];
  currentCameraIndex.value = 0;
  currentConstraints.value = { facingMode: { ideal: "environment" } };
}

async function onCameraOn() {
  cameraReady.value = true;
  if (cameras.value.length === 0) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameras.value = devices.filter((d) => d.kind === "videoinput");
    } catch { /* ignore */ }
  }
}

function onCameraOff() {
  cameraReady.value = false;
}

function onCameraError(err: Error) {
  scanning.value = false;
  cameraReady.value = false;
  if (err.name === "NotAllowedError") {
    cameraError.value = "Accès refusé. Autorisez l'accès à la caméra dans les paramètres.";
  } else if (err.constructor.name === "StreamApiNotSupportedError") {
    cameraError.value = "Navigateur non supporté. Utilisez Chrome ou Safari.";
  } else if (err.constructor.name === "InsecureContextError") {
    cameraError.value = "HTTPS requis pour accéder à la caméra.";
  } else {
    cameraError.value = `Impossible d'accéder à la caméra (${err.name}).`;
  }
}

async function onDetect(codes: DetectedBarcode[]) {
  if (codes.length === 0) return;
  const value = codes[0].rawValue;
  if (!value || value === lastScannedId.value) return;
  lastScannedId.value = value;
  await handleQrCode(value);
}

function switchCamera() {
  if (cameras.value.length <= 1) return;
  currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length;
  const camera = cameras.value[currentCameraIndex.value];
  if (camera) {
    currentConstraints.value = { deviceId: { exact: camera.deviceId } };
    cameraReady.value = false;
    lastScannedId.value = null;
  }
}

// ── QR / Checkin logic ─────────────────────────────────────────────
async function handleQrCode(value: string) {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = value.match(uuidRegex);
  const id = match ? match[0] : value;
  result.value = null;
  resultError.value = null;
  try {
    result.value = await $fetch<any>(`/api/registrations/${id}`);
  } catch {
    resultError.value = "QR invalide ou inscription introuvable";
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
    toast.success(`${result.value.firstName} ${result.value.lastName} — Présence confirmée`);
    refreshList();
    setTimeout(resetScan, 2500);
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
    resetScan();
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

// ── Manual search ──────────────────────────────────────────────────
const showManualDialog = ref(false);
const manualInput = ref("");
const isManualSearching = ref(false);

async function manualSearch() {
  const val = manualInput.value.trim();
  if (!val) return;
  isManualSearching.value = true;
  await handleQrCode(val);
  isManualSearching.value = false;
  showManualDialog.value = false;
  manualInput.value = "";
}

function formatCheckinDate(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const sheetOpen = computed(() => !!(result.value || resultError.value));
</script>

<template>
  <div class="-m-8 flex flex-col bg-black" style="height: calc(100vh - 3rem)">

    <!-- ── Header ── -->
    <div class="shrink-0 flex items-center justify-between px-5 h-14 bg-background border-b">
      <div>
        <h2 class="text-sm font-semibold leading-none tracking-tight text-foreground">
          Check-in
        </h2>
        <div class="flex items-center gap-2 mt-1.5">
          <div class="h-1 w-24 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-700"
              :style="{ width: `${stats.percentage}%` }"
            />
          </div>
          <span class="text-xs text-muted-foreground tabular-nums">
            {{ stats.present }} / {{ stats.total }} présents
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full"
        title="Saisie manuelle"
        @click="showManualDialog = true"
      >
        <Icon name="lucide:keyboard" class="h-4 w-4" />
      </Button>
    </div>

    <!-- ── Scanner ── -->
    <div class="relative flex-1 overflow-hidden">
      <ClientOnly>

        <!-- Active scanner -->
        <QrcodeStream
          v-if="scanning"
          :constraints="currentConstraints"
          :formats="['qr_code']"
          style="position: absolute; inset: 0; width: 100%; height: 100%"
          @detect="onDetect"
          @error="onCameraError"
          @camera-on="onCameraOn"
          @camera-off="onCameraOff"
        >
          <!-- Loading -->
          <div v-if="!cameraReady" class="absolute inset-0 flex items-center justify-center bg-black">
            <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-white/30" />
          </div>

          <!-- Scan overlay -->
          <template v-else>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-5">
              <div class="relative w-56 h-56">
                <div class="absolute top-0 left-0 w-9 h-9 border-t-[3px] border-l-[3px] border-white/90 rounded-tl-lg" />
                <div class="absolute top-0 right-0 w-9 h-9 border-t-[3px] border-r-[3px] border-white/90 rounded-tr-lg" />
                <div class="absolute bottom-0 left-0 w-9 h-9 border-b-[3px] border-l-[3px] border-white/90 rounded-bl-lg" />
                <div class="absolute bottom-0 right-0 w-9 h-9 border-b-[3px] border-r-[3px] border-white/90 rounded-br-lg" />
                <div class="absolute inset-x-0 h-px bg-white/60 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
              <p class="text-xs text-white/40 tracking-widest uppercase">Pointez vers un QR code</p>
            </div>

            <!-- Camera controls (bottom overlay) -->
            <div class="absolute bottom-6 inset-x-0 flex items-center justify-center gap-3">
              <Button
                v-if="cameras.length > 1"
                variant="outline"
                size="icon"
                class="rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                title="Changer de caméra"
                @click="switchCamera"
              >
                <Icon name="lucide:switch-camera" class="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                title="Arrêter le scanner"
                @click="stopScanner"
              >
                <Icon name="lucide:square" class="h-4 w-4" />
              </Button>
            </div>
          </template>
        </QrcodeStream>

        <!-- Idle state -->
        <div
          v-if="!scanning && !cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-8"
        >
          <div class="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon name="lucide:scan-qr-code" class="h-12 w-12 text-white/20" />
          </div>
          <div class="text-center space-y-1.5">
            <p class="text-sm font-medium text-white/50">Scanner inactif</p>
            <p class="text-xs text-white/25">Appuyez sur le bouton pour démarrer</p>
          </div>
          <Button class="rounded-full px-8" @click="startScanner">
            <Icon name="lucide:camera" class="h-4 w-4" />
            Démarrer le scanner
          </Button>
        </div>

        <!-- Error state -->
        <div
          v-if="cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-5 px-10 text-center"
        >
          <div class="h-14 w-14 rounded-full bg-destructive/15 border border-destructive/20 flex items-center justify-center">
            <Icon name="lucide:camera-off" class="h-7 w-7 text-destructive" />
          </div>
          <p class="text-sm text-white/50 leading-relaxed">{{ cameraError }}</p>
          <Button variant="outline" class="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white" @click="startScanner">
            <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            Réessayer
          </Button>
        </div>

        <template #fallback>
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-white/30" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- ── Backdrop ── -->
    <Transition name="fade">
      <div
        v-if="sheetOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        @click="resetScan"
      />
    </Transition>

    <!-- ── Bottom sheet ── -->
    <Transition name="sheet">
      <div
        v-if="sheetOpen"
        class="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-xl"
        style="padding-bottom: max(env(safe-area-inset-bottom), 1.5rem)"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-9 h-1 rounded-full bg-border" />
        </div>

        <!-- QR invalide -->
        <div v-if="resultError" class="px-5 py-4 flex flex-col items-center gap-4 text-center">
          <div class="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon name="lucide:scan-line" class="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p class="text-base font-semibold text-foreground">QR invalide</p>
            <p class="text-sm text-muted-foreground mt-0.5">Ce QR code n'est pas reconnu</p>
          </div>
          <Button variant="outline" class="rounded-full w-full" @click="resetScan">
            <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            Scanner un autre QR code
          </Button>
        </div>

        <!-- Déjà checké -->
        <div v-else-if="result && result.checkedIn" class="px-5 py-4 space-y-4">
          <div class="flex items-center gap-3">
            <Avatar class="h-14 w-14 shrink-0">
              <AvatarImage :src="avatarUrl(`${result.firstName} ${result.lastName}`)" />
              <AvatarFallback class="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-base font-semibold">
                {{ result.firstName?.charAt(0) }}{{ result.lastName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-base font-semibold text-foreground truncate">
                {{ result.firstName }} {{ result.lastName }}
              </p>
              <p class="text-sm text-muted-foreground truncate">{{ result.email }}</p>
              <Badge class="mt-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 text-xs">
                <Icon name="lucide:clock" class="h-3 w-3 mr-1" />
                Déjà enregistré
                <span v-if="result.checkedInAt" class="ml-1 font-normal">
                  · {{ formatCheckinDate(result.checkedInAt) }}
                </span>
              </Badge>
            </div>
            <Button variant="ghost" size="icon" class="rounded-full shrink-0 text-muted-foreground" @click="resetScan">
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <div class="flex gap-2">
            <Button
              variant="outline"
              class="flex-1 rounded-full"
              :disabled="isChecking"
              @click="undoCheckin"
            >
              <Icon v-if="isChecking" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:rotate-ccw" class="h-4 w-4" />
              Annuler
            </Button>
            <Button variant="outline" class="flex-1 rounded-full" @click="resetScan">
              Continuer
            </Button>
          </div>
        </div>

        <!-- Valide — à confirmer -->
        <div v-else-if="result" class="px-5 py-4 space-y-4">
          <div class="flex items-center gap-3">
            <Avatar class="h-14 w-14 shrink-0">
              <AvatarImage :src="avatarUrl(`${result.firstName} ${result.lastName}`)" />
              <AvatarFallback class="bg-primary/10 text-primary text-base font-semibold">
                {{ result.firstName?.charAt(0) }}{{ result.lastName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-base font-semibold text-foreground truncate">
                {{ result.firstName }} {{ result.lastName }}
              </p>
              <p class="text-sm text-muted-foreground truncate">{{ result.email }}</p>
              <Badge class="mt-1 rounded-full bg-primary/10 text-primary border-0 text-xs">
                <Icon name="lucide:check-circle" class="h-3 w-3 mr-1" />
                Inscription confirmée
              </Badge>
            </div>
            <Button variant="ghost" size="icon" class="rounded-full shrink-0 text-muted-foreground" @click="resetScan">
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <Button
            class="w-full rounded-full h-12 text-sm font-semibold"
            :disabled="isChecking"
            @click="confirmCheckin"
          >
            <Icon v-if="isChecking" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="lucide:check" class="h-4 w-4" />
            {{ isChecking ? "Enregistrement…" : "Confirmer la présence" }}
          </Button>
        </div>
      </div>
    </Transition>

    <!-- ── Manual entry dialog ── -->
    <Dialog v-model:open="showManualDialog">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <DialogTitle class="text-base">Saisie manuelle</DialogTitle>
        </DialogHeader>
        <div class="flex gap-2 pt-1">
          <Input
            v-model="manualInput"
            placeholder="ID d'inscription…"
            class="flex-1 font-mono text-xs rounded-full"
            @keyup.enter="manualSearch"
          />
          <Button
            variant="outline"
            size="icon"
            class="rounded-full shrink-0"
            :disabled="!manualInput.trim() || isManualSearching"
            @click="manualSearch"
          >
            <Icon v-if="isManualSearching" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="lucide:search" class="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>

<style scoped>
@keyframes scan {
  0%   { top: 0; }
  50%  { top: calc(100% - 1px); }
  100% { top: 0; }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
