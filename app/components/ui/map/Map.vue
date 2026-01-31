<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LControlZoom } from "@vue-leaflet/vue-leaflet";
import type { LatLngExpression } from "leaflet";

const props = withDefaults(
  defineProps<{
    center?: LatLngExpression;
    zoom?: number;
    height?: string;
    class?: string;
  }>(),
  {
    center: () => [48.3, 4.08] as LatLngExpression,
    zoom: 13,
    height: "400px",
  },
);

const isDark = computed(() => {
  if (typeof window !== "undefined") {
    return document.documentElement.classList.contains("dark");
  }
  return false;
});

// Light and dark tile layers
const lightTileUrl =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const darkTileUrl =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const tileUrl = computed(() => (isDark.value ? darkTileUrl : lightTileUrl));
</script>

<template>
  <ClientOnly>
    <div
      :class="['rounded-2xl overflow-hidden border bg-card', props.class]"
      :style="{ height: props.height }"
    >
      <LMap
        :zoom="props.zoom"
        :center="props.center"
        :use-global-leaflet="false"
        :zoom-control="false"
        class="h-full w-full"
      >
        <LTileLayer
          :url="tileUrl"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          layer-type="base"
          name="CartoDB"
        />
        <LControlZoom position="bottomright" />
        <slot />
      </LMap>
    </div>
    <template #fallback>
      <div
        :class="[
          'rounded-2xl overflow-hidden border bg-muted animate-pulse flex items-center justify-center',
          props.class,
        ]"
        :style="{ height: props.height }"
      >
        <Icon name="lucide:map" class="h-8 w-8 text-muted-foreground" />
      </div>
    </template>
  </ClientOnly>
</template>

<style>
.leaflet-control-zoom {
  border: none !important;
  border-radius: 0.75rem !important;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
}

.leaflet-control-zoom a {
  background: hsl(var(--background)) !important;
  color: hsl(var(--foreground)) !important;
  border: none !important;
  width: 32px !important;
  height: 32px !important;
  line-height: 32px !important;
  font-size: 16px !important;
}

.leaflet-control-zoom a:hover {
  background: hsl(var(--muted)) !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 0.75rem !important;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
  background: hsl(var(--popover)) !important;
  color: hsl(var(--popover-foreground)) !important;
}

.leaflet-popup-tip {
  background: hsl(var(--popover)) !important;
}

.leaflet-popup-close-button {
  color: hsl(var(--muted-foreground)) !important;
}
</style>
