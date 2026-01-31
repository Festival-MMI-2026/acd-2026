<script setup lang="ts">
import { LMarker, LPopup, LIcon } from "@vue-leaflet/vue-leaflet";
import type { LatLngExpression, PointExpression } from "leaflet";

const props = withDefaults(
  defineProps<{
    position: LatLngExpression;
    title?: string;
    iconUrl?: string;
  }>(),
  {},
);

// Default custom icon
const iconSize: PointExpression = [32, 32];
const iconAnchor: PointExpression = [16, 32];
const popupAnchor: PointExpression = [0, -32];
</script>

<template>
  <ClientOnly>
    <LMarker :lat-lng="props.position">
      <LIcon
        v-if="props.iconUrl"
        :icon-url="props.iconUrl"
        :icon-size="iconSize"
        :icon-anchor="iconAnchor"
        :popup-anchor="popupAnchor"
      />
      <LPopup v-if="$slots.default || props.title">
        <div class="py-1 px-1">
          <p v-if="props.title" class="font-semibold text-sm">
            {{ props.title }}
          </p>
          <slot />
        </div>
      </LPopup>
    </LMarker>
  </ClientOnly>
</template>
