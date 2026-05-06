<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="input-group"
    role="group"
    :class="
      cn(
        'group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-full border shadow-xs transition-[color,box-shadow] outline-none',
        'h-9 min-w-0 has-[>textarea]:h-auto',

        // Strip nested input/textarea own background so the group's bg shows uniformly across addon + input
        '[&_input]:bg-transparent dark:[&_input]:bg-transparent',
        '[&_textarea]:bg-transparent dark:[&_textarea]:bg-transparent',
        // Also drop nested input border so the group's border is the only one visible
        '[&_input]:border-0 [&_textarea]:border-0',
        // And drop nested input own focus ring (the group already shows one)
        '[&_input]:shadow-none [&_input]:focus-visible:ring-0',
        '[&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0',

        // Variants based on alignment.
        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Focus state.
        'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',

        // Error state.
        'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
