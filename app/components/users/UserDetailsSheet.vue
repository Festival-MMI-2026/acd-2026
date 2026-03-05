<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const props = defineProps<{
  open: boolean;
  user: any;
}>();

const emit = defineEmits(["update:open"]);
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="w-[400px] sm:w-[540px] px-4">
      <SheetHeader>
        <SheetTitle>Détails de l'utilisateur</SheetTitle>
        <SheetDescription>
          Informations complètes sur cet utilisateur.
        </SheetDescription>
      </SheetHeader>

      <div v-if="user" class="mt-6 flex flex-col gap-6">
        <!-- Header Profile -->
        <div class="flex flex-col items-center gap-4 py-4 border-b">
          <Avatar class="h-24 w-24">
            <AvatarImage :src="user.image" :fallback-src="avatarUrl(user.name || '')" :alt="user.name" />
            <AvatarFallback class="text-2xl">{{
              user.name?.charAt(0).toUpperCase()
            }}</AvatarFallback>
          </Avatar>
          <div class="text-center">
            <h3 class="text-xl font-semibold">{{ user.name }}</h3>
            <p class="text-muted-foreground">{{ user.email }}</p>
          </div>
          <div class="flex gap-2">
            <Badge variant="outline">
              {{ user.role === "admin" ? "Administrateur" : "Utilisateur" }}
            </Badge>
            <Badge v-if="user.banned" variant="destructive">Banni</Badge>
            <Badge
              v-else
              variant="secondary"
              class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              >Actif</Badge
            >
          </div>
        </div>

        <!-- Details List -->
        <div class="space-y-4">
          <h4
            class="font-semibold text-sm text-muted-foreground uppercase tracking-wider"
          >
            Informations
          </h4>

          <dl class="grid grid-cols-1 gap-4 text-sm">
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">ID</span>
                <span
                  class="col-span-3 text-xs font-mono text-muted-foreground"
                  >{{ user.id }}</span
                >
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Prénom</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  user.firstName
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Nom</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  user.lastName
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Email</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  user.email
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Téléphone</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  user.tel || "-"
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">IUT</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  user.iut || "Non renseigné"
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Date d'inscription</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}</span>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <span class="text-sm font-medium">Dernière mise à jour</span>
                <span class="col-span-3 text-xs text-muted-foreground">{{
                  new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}</span>
              </div>
            </div>
          </dl>
        </div>

        <!-- Ban Info if banned -->
        <div
          v-if="user.banned"
          class="bg-destructive/10 p-4 rounded-md border border-destructive/20"
        >
          <h4
            class="font-semibold text-destructive mb-2 flex items-center gap-2"
          >
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            Information de bannissement
          </h4>
          <p class="text-sm">
            Raison : {{ user.banReason || "Aucune raison spécifiée" }}
          </p>
          <p v-if="user.banExpires" class="text-sm mt-1">
            Expire le :
            {{ new Date(user.banExpires).toLocaleDateString("fr-FR") }}
          </p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
