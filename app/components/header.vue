<script setup lang="ts">
import { signOut, useSession } from "~/lib/auth-client";
import { PersonIcon, ExitIcon } from "@radix-icons/vue";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

const session = useSession();
const router = useRouter();

async function handleSignOut() {
  await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/auth/signin");
      },
    },
  });
}
</script>

<template>
  <!-- Header -->
  <header class="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
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
            <span class="text-lg font-extrabold text-primary">ACD</span>
          </div>
          <Badge variant="outline" class="rounded-full text-xs">
            <div class="relative flex h-2 w-2">
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"
              ></span>
            </div>
            Édition {{ new Date().getFullYear() }}</Badge
          >
        </NuxtLink>

        <!-- Navigation (center-left) -->
        <NavigationMenu class="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink to="/programme">Programme</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink to="/inscription">Inscription</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink to="/acces">Accès</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-3">
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
            <NuxtLink to="/inscription">S'inscrire</NuxtLink>
          </Button>
        </template>

        <!-- Logged in -->
        <template v-else>
          <Button
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
                    :src="session.data.user?.image || ''"
                    :alt="session.data.user?.name || 'User'"
                  />
                  <AvatarFallback
                    class="bg-primary text-primary-foreground text-sm"
                  >
                    {{
                      session.data.user?.name?.charAt(0).toUpperCase() || "U"
                    }}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56 rounded-xl">
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
              <DropdownMenuItem as-child class="rounded-lg">
                <NuxtLink to="/profile" class="flex items-center">
                  <PersonIcon class="mr-2 h-4 w-4" />
                  <span>Mon profil</span>
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                @click="handleSignOut"
                class="text-destructive focus:text-destructive rounded-lg"
              >
                <ExitIcon class="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>

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
              <SheetHeader>
                <SheetTitle class="text-left flex items-center gap-2">
                  <img
                    src="/LightLogoACD.svg"
                    alt="ACD Logo"
                    class="h-6 dark:hidden"
                  />
                  <img
                    src="/DarkLogoACD.svg"
                    alt="ACD Logo"
                    class="h-6 hidden dark:block"
                  />
                  <span class="font-bold text-xl">ACD MMI</span>
                </SheetTitle>
                <SheetDescription class="text-left sr-only">
                  Menu de navigation principal
                </SheetDescription>
              </SheetHeader>
              <Separator />
              <div class="flex flex-col gap-4 px-4">
                <SheetClose as-child>
                  <NuxtLink to="/programme">Programme</NuxtLink>
                </SheetClose>
                <SheetClose as-child>
                  <NuxtLink to="/inscription">Inscription</NuxtLink>
                </SheetClose>
                <SheetClose as-child>
                  <NuxtLink to="/acces">Accès</NuxtLink>
                </SheetClose>
                <SheetClose v-if="session.data" as-child>
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
</template>
