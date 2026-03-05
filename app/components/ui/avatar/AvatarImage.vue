<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref, watch } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  src?: string | null;
  fallbackSrc?: string;
  alt?: string;
  class?: HTMLAttributes["class"];
}>();

const currentSrc = ref(props.src || props.fallbackSrc);
const failed = ref(false);

watch(
  () => props.src,
  (val) => {
    currentSrc.value = val || props.fallbackSrc;
    failed.value = false;
  },
);

function onError() {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc;
  } else {
    failed.value = true;
  }
}
</script>

<template>
  <img
    v-if="currentSrc && !failed"
    data-slot="avatar-image"
    :src="currentSrc"
    :alt="alt ?? ''"
    :class="cn('absolute inset-0 z-10 size-full object-cover', props.class)"
    @error="onError"
  />
</template>
