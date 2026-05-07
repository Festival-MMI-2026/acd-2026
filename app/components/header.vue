<script setup lang="ts">
import { signOut, useSession } from "~/lib/auth-client";
import { PersonIcon, ExitIcon } from "@radix-icons/vue";
import { useWindowScroll } from "@vueuse/core";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { TriangleAlertIcon } from "lucide-vue-next";

const session = useSession();
const router = useRouter();
const route = useRoute();

const { y } = useWindowScroll();
const isHidden = ref(false);
const lastScrollY = ref(0);
const threshold = 100;

watch(y, (currentY) => {
  // Always show at the very top
  if (currentY <= threshold) {
    isHidden.value = false;
    lastScrollY.value = currentY;
    return;
  }

  // Determine direction
  if (currentY > lastScrollY.value) {
    // Scrolling down
    isHidden.value = true;
  } else {
    // Scrolling up
    isHidden.value = false;
  }
  lastScrollY.value = currentY;
});

async function handleSignOut() {
  await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/auth/signin");
      },
    },
  });
}

const { data: siteSettings } = useFetch("/api/settings");

const badgeText = computed(() => {
  return (
    siteSettings.value?.headerBadgeText || `Édition ${new Date().getFullYear()}`
  );
});

const isProfileIncomplete = computed(() => {
  if (!session.value.data?.user) return false;
  const user = session.value.data.user as any;
  return !user.tel || !user.iut;
});
</script>

<template>
  <!-- Header Container -->
  <div
    class="sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out"
    :class="{ '-translate-y-full': isHidden }"
  >
    <header class="w-full bg-background">
      <div
        class="container flex h-16 w-full max-w-screen-xl items-center justify-between px-6 mx-auto"
      >
        <!-- Logo (left) -->
        <div class="flex items-center gap-8">
          <NuxtLink
            to="/"
            class="flex items-center flex-row gap-2 font-semibold text-lg"
          >
            <div class="flex items-center gap-2">
              <NuxtImg
                src="/logo.svg"
                alt="ACD Logo"
                class="h-14 dark:hidden"
                loading="eager"
                height="56"
              />
              <NuxtImg
                src="/logo.svg"
                alt="ACD Logo"
                class="h-14 hidden dark:block dark:grayscale dark:invert dark:contrast-200"
                loading="eager"
                height="56"
              />
            </div>
            <ClientOnly>
              <Badge
                variant="outline"
                class="hidden md:flex rounded-full text-xs"
              >
                <div class="relative flex h-2 w-2">
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 bg-primary"
                  ></span>
                </div>
                {{ badgeText }}</Badge
              >
            </ClientOnly>
          </NuxtLink>

          <!-- Navigation (center-left) -->
          <ClientOnly>
            <NavigationMenu
              aria-label="Navigation principale"
              class="hidden md:flex"
            >
              <NavigationMenuList class="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink as-child>
                    <NuxtLink
                      to="/programme"
                      class="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full"
                      :class="[
                        route.path === '/programme'
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                      ]"
                    >
                      Programme
                    </NuxtLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink as-child>
                    <NuxtLink
                      to="/inscription"
                      class="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full"
                      :class="[
                        route.path === '/inscription'
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                      ]"
                    >
                      Inscription
                    </NuxtLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink as-child>
                    <NuxtLink
                      to="/acces"
                      class="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full"
                      :class="[
                        route.path === '/acces'
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                      ]"
                    >
                      Accès
                    </NuxtLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink as-child>
                    <NuxtLink
                      to="/hotels"
                      class="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full"
                      :class="[
                        route.path === '/hotels'
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                      ]"
                    >
                      Hébergement
                    </NuxtLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <template #fallback>
              <div class="hidden md:flex gap-6 items-center">
                <div class="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div class="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div class="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div class="h-4 w-20 bg-muted animate-pulse rounded"></div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <ClientOnly>
            <!-- Not logged in -->
            <template v-if="!session.data">
              <Button
                variant="secondary"
                class="rounded-full hidden sm:inline-flex"
                as-child
              >
                <NuxtLink to="/auth/signin">Se connecter</NuxtLink>
              </Button>
              <Button
                variant="default"
                class="rounded-full hidden sm:inline-flex"
                as-child
              >
                <NuxtLink to="/auth/signup">S'inscrire</NuxtLink>
              </Button>
            </template>

            <!-- Logged in -->
            <template v-else>
              <Button
                v-if="session.data.user?.role === 'admin'"
                variant="secondary"
                size="sm"
                class="rounded-full hidden md:inline-flex"
                as-child
              >
                <NuxtLink to="/admin">Dashboard</NuxtLink>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="rounded-full">
                    <Avatar class="h-8 w-8">
                      <AvatarImage
                        :src="session.data.user?.image"
                        :fallback-src="avatarUrl(session.data.user?.name || '')"
                        :alt="session.data.user?.name || 'User'"
                      />
                      <AvatarFallback
                        class="bg-primary text-primary-foreground text-sm"
                      >
                        {{
                          session.data.user?.name?.charAt(0).toUpperCase() ||
                          "U"
                        }}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48 rounded-md">
                  <DropdownMenuLabel class="font-normal">
                    <div class="flex flex-col space-y-1">
                      <p class="text-sm font-medium">
                        {{ session.data.user?.name }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{ session.data.user?.email }}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem as-child>
                    <NuxtLink to="/profil" class="flex items-center">
                      <PersonIcon class="h-4 w-4" />
                      <span>Mon profil</span>
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    @click="handleSignOut"
                    class="text-destructive focus:text-destructive"
                  >
                    <ExitIcon class="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </template>
            <template #fallback>
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-24 rounded-full bg-muted animate-pulse hidden sm:block"
                ></div>
                <div
                  class="h-9 w-24 rounded-full bg-muted animate-pulse hidden sm:block"
                ></div>
              </div>
            </template>
          </ClientOnly>

          <!-- Mobile Menu -->
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden">
                <Icon name="lucide:menu" class="h-5 w-5" />
                <span class="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="flex flex-col justify-between">
              <div class="space-y-8">
                <SheetHeader class="m-0">
                  <SheetTitle class="text-left flex items-center">
                    <NuxtImg
                      src="/logo.svg"
                      alt="ACD Logo"
                      class="h-14 dark:hidden"
                      loading="lazy"
                      height="56"
                    />
                    <NuxtImg
                      src="/logo.svg"
                      alt="ACD Logo"
                      class="h-14 hidden dark:block dark:grayscale dark:contrast-1"
                      loading="lazy"
                      height="56"
                    />
                  </SheetTitle>
                  <SheetDescription class="text-left sr-only">
                    Menu de navigation principal
                  </SheetDescription>
                </SheetHeader>
                <Separator />
                <div class="flex flex-col gap-4 px-4 text-sm">
                  <SheetClose as-child>
                    <NuxtLink to="/programme">Programme</NuxtLink>
                  </SheetClose>
                  <SheetClose as-child>
                    <NuxtLink to="/inscription">Inscription</NuxtLink>
                  </SheetClose>
                  <SheetClose as-child>
                    <NuxtLink to="/acces">Accès</NuxtLink>
                  </SheetClose>
                  <SheetClose as-child>
                    <NuxtLink to="/hotels">Hébergement</NuxtLink>
                  </SheetClose>
                  <SheetClose
                    v-if="session.data?.user?.role === 'admin'"
                    as-child
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full justify-start"
                      as-child
                    >
                      <NuxtLink to="/admin">
                        <Icon
                          name="lucide:layout-dashboard"
                          class="mr-2 h-4 w-4"
                        />
                        Dashboard
                      </NuxtLink>
                    </Button>
                  </SheetClose>
                </div>
              </div>

              <div class="space-y-4 px-4 pb-8">
                <template v-if="!session.data">
                  <SheetClose as-child>
                    <Button
                      variant="outline"
                      size="lg"
                      class="w-full rounded-full"
                      as-child
                    >
                      <NuxtLink to="/auth/signin">Se connecter</NuxtLink>
                    </Button>
                  </SheetClose>
                  <SheetClose as-child>
                    <Button size="lg" class="w-full rounded-full" as-child>
                      <NuxtLink to="/auth/signup">S'inscrire</NuxtLink>
                    </Button>
                  </SheetClose>
                </template>
                <template v-else>
                  <SheetClose as-child>
                    <Button
                      variant="outline"
                      size="lg"
                      class="w-full rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      @click="handleSignOut"
                    >
                      <ExitIcon class="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </SheetClose>
                </template>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <div
      v-if="isProfileIncomplete"
      class="relative w-full overflow-hidden border-y border-primary/40 bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/12 to-transparent"
      />
      <div class="container relative mx-auto px-4 sm:px-6 py-3">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <span
              class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/35 backdrop-blur-sm"
            >
              <TriangleAlertIcon class="h-4 w-4" :stroke-width="2.25" />
            </span>
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-semibold tracking-tight">
                Votre profil est incomplet
              </span>
              <span class="text-xs opacity-85">
                Ajouter votre numéro de téléphone et votre IUT pour finaliser
                votre compte.
              </span>
            </div>
          </div>
          <Button size="sm" variant="secondary" as-child>
            <NuxtLink to="/profil">
              Compléter mon profil
              <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-alert__shimmer {
  transform: translateX(-100%);
  animation: profile-alert-shimmer 3.5s ease-in-out infinite;
}

@keyframes profile-alert-shimmer {
  0% {
    transform: translateX(-100%);
  }
  60%,
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-alert__shimmer {
    animation: none;
  }
}
</style>
