<script setup lang="ts">
import { useSession } from "~/lib/auth-client";

definePageMeta({ layout: false });

const session = useSession();
const { data: settings } = await useFetch("/api/settings");

watchEffect(() => {
  if (session.isPending) return; // still loading

  const isAdmin = session.data?.user?.role === "admin";
  const isMaintenance = settings.value?.maintenanceMode ?? false;

  if (isAdmin) {
    navigateTo("/admin");
  } else if (isMaintenance) {
    navigateTo("/maintenance");
  } else {
    navigateTo("/");
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
</template>
