<script setup lang="ts">
import { signOut, useSession } from "~/lib/auth-client";
import { PersonIcon, ExitIcon } from "@radix-icons/vue";

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
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-lg">
          <img src="/LightLogoACD.svg" alt="ACD Logo" class="h-5 dark:hidden" />
          <img
            src="/DarkLogoACD.svg"
            alt="ACD Logo"
            class="h-5 hidden dark:block"
          />
          <span class="text-lg font-extrabold text-primary">ACD</span>
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
            <NavigationMenuItem v-if="session.data">
              <NavigationMenuLink as-child>
                <NuxtLink to="/admin">Admin</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <ToggleTheme />

        <!-- Not logged in -->
        <template v-if="!session.data">
          <Button variant="secondary" class="rounded-full" as-child>
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
      </div>
    </div>
  </header>
</template>
