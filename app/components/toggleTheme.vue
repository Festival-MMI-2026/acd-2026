<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
  <div class="inline-flex items-center rounded-full border bg-background p-1">
    <ClientOnly>
      <button
        @click="colorMode.preference = 'system'"
        class="rounded-full px-1 py-1 transition-all hover:bg-muted flex items-center justify-center"
        :class="{
          'bg-muted text-foreground': colorMode.preference === 'system',
          'text-muted-foreground': colorMode.preference !== 'system',
        }"
        aria-label="System Theme"
      >
        <Icon name="lucide:monitor" class="h-4 w-4" />
      </button>
      <button
        @click="colorMode.preference = 'light'"
        class="rounded-full px-1 py-1 transition-all hover:bg-muted flex items-center justify-center"
        :class="{
          'bg-muted text-foreground': colorMode.preference === 'light',
          'text-muted-foreground': colorMode.preference !== 'light',
        }"
        aria-label="Light Theme"
      >
        <Icon name="lucide:sun" class="h-4 w-4" />
      </button>
      <button
        @click="colorMode.preference = 'dark'"
        class="rounded-full px-1 py-1 transition-all hover:bg-muted flex items-center justify-center"
        :class="{
          'bg-muted text-foreground': colorMode.preference === 'dark',
          'text-muted-foreground': colorMode.preference !== 'dark',
        }"
        aria-label="Dark Theme"
      >
        <Icon name="lucide:moon" class="h-4 w-4" />
      </button>
      <template #fallback>
        <div class="w-[88px] h-6"></div>
      </template>
    </ClientOnly>
  </div>
</template>
