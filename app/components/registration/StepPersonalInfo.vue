<script setup lang="ts">
import { useSession } from "~/lib/auth-client";
import { Switch } from "~/components/ui/switch";

interface Iut {
  id: string;
  name: string;
  city?: string;
}

const props = defineProps<{
  modelValue: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    iutId: string;
    allergens: string;
    isMotorized: boolean;
  };
}>();

const emit = defineEmits<{
  "update:modelValue": [value: typeof props.modelValue];
}>();

const session = useSession();

// Fetch IUTs
const { data: iuts } = useLazyFetch<Iut[]>("/api/iuts");

// Pre-fill from session if available
onMounted(() => {
  console.log("StepPersonalInfo monté");
  const userData = session.value?.data?.user;
  if (userData) {
    const nameParts = (userData.name || "").split(" ");
    emit("update:modelValue", {
      ...props.modelValue,
      firstName: nameParts[0] || props.modelValue.firstName,
      lastName: nameParts.slice(1).join(" ") || props.modelValue.lastName,
      email: userData.email || props.modelValue.email,
    });
  }
});

function updateField(field: keyof typeof props.modelValue, value: any) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}

const isMotorizedProxy = computed({
  get: () => props.modelValue.isMotorized,
  set: (val) => {
    updateField("isMotorized", val);
    console.log("Statut motorisé modifié :", val);
  },
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <Icon name="lucide:user" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-bold tracking-tight">
            Informations personnelles
          </h2>
          <p class="text-sm text-muted-foreground">
            Renseignez vos coordonnées pour l'inscription
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Identité -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Identité
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel for="firstName">Prénom *</FieldLabel>
          <Input
            id="firstName"
            :model-value="modelValue.firstName"
            @update:model-value="updateField('firstName', String($event))"
            placeholder="Jean"
            required
          />
        </Field>
        <Field>
          <FieldLabel for="lastName">Nom *</FieldLabel>
          <Input
            id="lastName"
            :model-value="modelValue.lastName"
            @update:model-value="updateField('lastName', String($event))"
            placeholder="Dupont"
            required
          />
        </Field>
      </div>
    </div>

    <!-- Coordonnées -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Coordonnées
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel for="email">Email *</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:mail" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="email"
              type="email"
              :model-value="modelValue.email"
              @update:model-value="updateField('email', String($event))"
              placeholder="jean.dupont@univ-reims.fr"
              class="border-0 shadow-none focus-visible:ring-0"
              required
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel for="phone">Téléphone *</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="lucide:phone" class="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="phone"
              type="tel"
              :model-value="modelValue.phone"
              @update:model-value="updateField('phone', String($event))"
              placeholder="06 12 34 56 78"
              class="border-0 shadow-none focus-visible:ring-0"
              required
            />
          </InputGroup>
        </Field>
      </div>
    </div>

    <!-- Établissement -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Établissement
      </h3>
      <Field>
        <FieldLabel for="iut">IUT d'origine *</FieldLabel>
        <ClientOnly>
          <Select
            :model-value="modelValue.iutId"
            @update:model-value="updateField('iutId', $event)"
          >
            <SelectTrigger id="iut">
              <SelectValue placeholder="Sélectionnez votre IUT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="iut in iuts" :key="iut.id" :value="iut.id">
                {{ iut.name }}
                <span v-if="iut.city" class="text-muted-foreground">
                  - {{ iut.city }}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <template #fallback>
            <Skeleton class="h-10 w-full rounded-md" />
          </template>
        </ClientOnly>
      </Field>
    </div>

    <!-- Informations complémentaires -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Informations complémentaires
      </h3>

      <Field>
        <FieldLabel for="allergens">
          <span class="flex items-center gap-1.5">
            <Icon name="lucide:wheat" class="h-3.5 w-3.5 text-amber-500" />
            Allergies alimentaires
          </span>
        </FieldLabel>
        <Textarea
          id="allergens"
          :model-value="modelValue.allergens"
          @update:model-value="updateField('allergens', String($event))"
          placeholder="Indiquez vos allergies alimentaires (ex: gluten, lactose, fruits à coque...)"
          rows="2"
        />
        <FieldDescription>
          Laissez vide si vous n'avez pas d'allergies
        </FieldDescription>
      </Field>

      <!-- Motorisé -->
      <div
        class="flex items-center justify-between rounded-xl border bg-muted/30 p-5 transition-colors hover:bg-muted/50"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm"
          >
            <Icon name="lucide:car" class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="space-y-1">
            <Label for="motorized" class="text-sm font-medium">
              Êtes-vous motorisé ? *
            </Label>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Indiquez si vous disposez d'un véhicule pour vos déplacements
            </p>
          </div>
        </div>
        <Switch id="motorized" v-model="isMotorizedProxy" />
      </div>
    </div>
  </div>
</template>
