<script setup lang="ts">
import { useSession, signOut } from "~/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const session = useSession();
const route = useRoute();

const navItems = [
  { title: "Dashboard", icon: "lucide:home", href: "/admin" },
  { title: "Programme", icon: "lucide:calendar", href: "/admin/programme" },
  { title: "Repas", icon: "lucide:utensils", href: "/admin/repas" },
  { title: "Activités", icon: "lucide:activity", href: "/admin/activites" },
  { title: "Inscriptions", icon: "lucide:ticket", href: "/admin/inscriptions" },
];

const navItemsAdmin = [
  { title: "Utilisateurs", icon: "lucide:users", href: "/admin/utilisateurs" },
  { title: "Rôles", icon: "lucide:shield", href: "/admin/roles" },
  { title: "Logs", icon: "lucide:file-text", href: "/admin/logs" },
  { title: "Emails", icon: "lucide:mail", href: "/admin/emails" },
  { title: "Export", icon: "lucide:download", href: "/admin/export" },
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
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <!-- Header -->
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <NuxtLink to="/admin" class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <img
                    src="/LightLogoACD.svg"
                    alt="ACD Logo"
                    class="h-5 dark:hidden"
                  />
                  <img
                    src="/DarkLogoACD.svg"
                    alt="ACD Logo"
                    class="h-5 hidden dark:block"
                  />
                </div>
                <span class="text-lg font-extrabold text-primary">ACD</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <!-- Content -->
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navItems" :key="item.href">
                <SidebarMenuButton
                  as-child
                  :tooltip="item.title"
                  :data-active="isActive(item.href)"
                >
                  <NuxtLink :to="item.href">
                    <Icon :name="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navItemsAdmin" :key="item.href">
                <SidebarMenuButton
                  as-child
                  :tooltip="item.title"
                  :data-active="isActive(item.href)"
                >
                  <NuxtLink :to="item.href">
                    <Icon :name="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <!-- Footer -->
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem v-for="item in bottomNavItems" :key="item.href">
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :data-active="isActive(item.href)"
            >
              <NuxtLink :to="item.href">
                <Icon :name="item.icon" class="h-4 w-4" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <!-- User Menu -->
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton size="lg" tooltip="Mon compte">
                  <Avatar class="h-6 w-6 shrink-0">
                    <AvatarImage :src="session.data?.user?.image || ''" />
                    <AvatarFallback
                      class="bg-foreground text-background text-xs"
                    >
                      {{ session.data?.user?.name?.charAt(0) || "A" }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="flex-1 text-left truncate">{{
                    session.data?.user?.name || "Admin"
                  }}</span>
                  <Icon
                    name="lucide:chevrons-up-down"
                    class="h-4 w-4 shrink-0"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                class="w-56 rounded-xl"
              >
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <!-- Main content -->
    <SidebarInset>
      <!-- Header -->
      <header class="h-16 border-b bg-background flex items-center gap-4 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" class="h-4" />
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
    </SidebarInset>
  </SidebarProvider>
</template>
