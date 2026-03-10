<script setup lang="ts">
import { useSession } from "~/lib/auth-client";
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
import {
  CollapsibleRoot as Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "reka-ui";

const session = useSession();
const route = useRoute();
const { version } = useAppConfig();

const navItems = [
  { title: "Dashboard", icon: "lucide:home", href: "/admin" },
  { title: "Programme", icon: "lucide:calendar", href: "/admin/programme" },
  { title: "Repas", icon: "lucide:utensils", href: "/admin/repas" },
  { title: "Activités", icon: "lucide:activity", href: "/admin/activites" },
  { title: "Inscriptions", icon: "lucide:ticket", href: "/admin/inscriptions" },
  { title: "Paiements", icon: "lucide:receipt", href: "/admin/orders" },
  { title: "Hôtels", icon: "lucide:hotel", href: "/admin/hotels" },
];

const checkinContent = [
  { title: "Check-in", icon: "lucide:scan-qr-code", href: "/admin/checkin" },
  {
    title: "Liste des participants",
    icon: "lucide:users",
    href: "/admin/checkin/list",
  },
];

const navItemsContent = [
  {
    title: "Page d'accueil",
    icon: "lucide:file-text",
    href: "/admin/contenu/accueil",
  },
  {
    title: "Page d'accès",
    icon: "lucide:map-pin",
    href: "/admin/contenu/acces",
  },
  {
    title: "Page programme",
    icon: "lucide:calendar",
    href: "/admin/contenu/programme",
  },
  {
    title: "Page inscription",
    icon: "lucide:clipboard-list",
    href: "/admin/contenu/inscription",
  },
  {
    title: "Page hôtels",
    icon: "lucide:building-2",
    href: "/admin/contenu/hotels",
  },
];

const navItemsAdmin = [
  { title: "Utilisateurs", icon: "lucide:users", href: "/admin/users" },
  { title: "Liste IUT", icon: "lucide:building-2", href: "/admin/iuts" },
  {
    title: "Journal d'activité",
    icon: "lucide:scroll-text",
    href: "/admin/journal",
  },
  { title: "Export", icon: "lucide:download", href: "/admin/export" },
];

const bottomNavItems = [
  { title: "Paramètres", icon: "lucide:settings", href: "/admin/parametres" },
];

const allNavHrefs = [
  ...navItems,
  ...checkinContent,
  ...navItemsContent,
  ...navItemsAdmin,
  ...bottomNavItems,
].map((i) => i.href);

function isActive(href: string) {
  if (href === "/admin") return route.path === "/admin";
  if (route.path === href) return true;
  if (!route.path.startsWith(href + "/")) return false;
  // Don't activate a parent item if a more specific child nav item matches
  return !allNavHrefs.some(
    (h) => h !== href && h.startsWith(href + "/") && route.path.startsWith(h),
  );
}

const searchOpen = ref(false);
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="floating" collapsible="icon">
      <!-- Header -->
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <NuxtLink to="/admin" class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <img
                    src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                    alt="ACD Logo"
                    class="h-14 dark:hidden"
                  />
                  <img
                    src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg"
                    alt="ACD Logo"
                    class="h-14 hidden dark:block dark:grayscale dark:invert dark:contrast-200"
                  />
                </div>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <!-- Content -->
      <SidebarContent>
        <!-- Navigation -->
        <Collapsible default-open class="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel as-child>
              <CollapsibleTrigger class="flex w-full items-center">
                Navigation
                <Icon
                  name="lucide:chevron-down"
                  class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <!-- Check-in -->
        <Collapsible default-open class="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel as-child>
              <CollapsibleTrigger class="flex w-full items-center">
                Check-in
                <Icon
                  name="lucide:chevron-down"
                  class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem
                    v-for="item in checkinContent"
                    :key="item.href"
                  >
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <!-- Contenu -->
        <Collapsible default-open class="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel as-child>
              <CollapsibleTrigger class="flex w-full items-center">
                Contenu
                <Icon
                  name="lucide:chevron-down"
                  class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem
                    v-for="item in navItemsContent"
                    :key="item.href"
                  >
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <!-- Administration -->
        <Collapsible default-open class="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel as-child>
              <CollapsibleTrigger class="flex w-full items-center">
                Administration
                <Icon
                  name="lucide:chevron-down"
                  class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem
                    v-for="item in navItemsAdmin"
                    :key="item.href"
                  >
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
            </CollapsibleContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent>
              <div class="px-3 py-1">
                <span class="text-[10px] text-muted-foreground"
                  >Version {{ version }}</span
                >
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
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
                    <AvatarImage
                      :src="session.data?.user?.image"
                      :fallback-src="avatarUrl(session.data?.user?.name || '')"
                    />
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
                class="w-56 rounded-md"
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
                  <NuxtLink to="/profil" class="cursor-pointer">
                    <Icon name="lucide:user" class="h-4 w-4" />
                    Voir mon compte
                  </NuxtLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SidebarMenuButton
              as-child
              tooltip="Retour au site"
              class="text-xs w-full text-center flex items-center justify-center"
            >
              <NuxtLink to="/">
                <Icon name="lucide:arrow-left" class="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    <!-- Main content -->
    <SidebarInset>
      <!-- Header -->
      <header
        class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4 flex-1">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">
                  <Icon name="lucide:home" class="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <template
                v-for="(segment, index) in route.path
                  .split('/')
                  .filter((s) => s && s !== 'admin')"
                :key="index"
              >
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    v-if="
                      index <
                      route.path.split('/').filter((s) => s && s !== 'admin')
                        .length -
                        1
                    "
                    :href="`/admin/${route.path
                      .split('/')
                      .filter((s) => s && s !== 'admin')
                      .slice(0, index + 1)
                      .join('/')}`"
                    class="capitalize"
                  >
                    {{ segment }}
                  </BreadcrumbLink>
                  <BreadcrumbPage
                    v-else
                    class="capitalize truncate max-w-[200px]"
                  >
                    {{ segment }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <!-- Right side: Search -->
        <div class="flex items-center gap-2 px-4">
          <Button
            variant="outline"
            size="sm"
            class="hidden md:flex items-center gap-2 text-muted-foreground h-8 w-56 justify-start rounded-lg px-3"
            @click="searchOpen = true"
          >
            <Icon name="lucide:search" class="h-3.5 w-3.5" />
            <span class="text-xs">Rechercher…</span>
            <KbdGroup class="ml-auto">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="md:hidden h-8 w-8"
            @click="searchOpen = true"
          >
            <Icon name="lucide:search" class="h-4 w-4" />
          </Button>
        </div>
      </header>

      <!-- Search Dialog -->
      <AdminSearch v-model:open="searchOpen" />

      <!-- Content -->
      <div class="flex flex-1 flex-col gap-4 p-8 overflow-auto">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
