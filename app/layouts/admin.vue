<script setup lang="ts">
import { useSession, signOut } from "~/lib/auth-client";

const session = useSession();
const route = useRoute();

const navItems = [
  { title: "Dashboard", icon: "lucide:home", href: "/admin" },
  { title: "Programme", icon: "lucide:calendar", href: "/admin/programme" },
  { title: "Repas", icon: "lucide:utensils", href: "/admin/repas" },
  { title: "Activités", icon: "lucide:activity", href: "/admin/activites" },
  { title: "Inscriptions", icon: "lucide:ticket", href: "/admin/inscriptions" },
];

const bottomNavItems = [
  { title: "Paramètres", icon: "lucide:settings", href: "/admin/parametres" },
];

function isActive(href: string) {
  if (href === "/admin") return route.path === "/admin";
  return route.path === href || route.path.startsWith(href + "/");
}

async function handleSignOut() {
  await signOut();
  navigateTo("/");
}
</script>

<template>
  <div class="flex min-h-screen bg-muted/30">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-background flex flex-col">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <div
            class="h-8 w-8 rounded-xl bg-foreground flex items-center justify-center"
          >
            <Icon name="lucide:zap" class="h-4 w-4 text-background" />
          </div>
          <span class="font-semibold">ACD Admin</span>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
            isActive(item.href)
              ? 'bg-foreground text-background font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          ]"
        >
          <Icon :name="item.icon" class="h-4 w-4" />
          {{ item.title }}
        </NuxtLink>
      </nav>

      <!-- Bottom nav -->
      <div class="p-4 border-t space-y-1">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.href"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
            isActive(item.href)
              ? 'bg-foreground text-background font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          ]"
        >
          <Icon :name="item.icon" class="h-4 w-4" />
          {{ item.title }}
        </NuxtLink>

        <!-- User -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Avatar class="h-6 w-6">
                <AvatarImage :src="session.data?.user?.image || ''" />
                <AvatarFallback class="bg-foreground text-background text-xs">
                  {{ session.data?.user?.name?.charAt(0) || "A" }}
                </AvatarFallback>
              </Avatar>
              <span class="flex-1 text-left truncate">{{
                session.data?.user?.name || "Admin"
              }}</span>
              <Icon name="lucide:chevrons-up-down" class="h-4 w-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-56 rounded-xl">
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium">
                  {{ session.data?.user?.name }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ session.data?.user?.email }}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink to="/" class="cursor-pointer">
                <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
                Retour au site
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive cursor-pointer"
              @click="handleSignOut"
            >
              <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 border-b bg-background flex items-center px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">
                <Icon name="lucide:home" class="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <template v-if="route.path !== '/admin'">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage class="capitalize">
                  {{ route.path.split("/").pop() }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <!-- Content -->
      <main class="flex-1 p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
