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
    isVegetarian: boolean;
    isVegan: boolean;
    noPork: boolean;
    noAlcohol: boolean;
  };
  showErrors?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: typeof props.modelValue];
}>();

const session = useSession();

// Fetch IUTs
const { data: iuts } = useLazyFetch<Iut[]>("/api/iuts");

// Pre-fill from session if available
onMounted(() => {
  const userData = session.value?.data?.user as any;
  if (userData) {
    emit("update:modelValue", {
      ...props.modelValue,
      firstName: userData.firstName || props.modelValue.firstName,
      lastName: userData.lastName || props.modelValue.lastName,
      email: userData.email || props.modelValue.email,
      phone: userData.tel || props.modelValue.phone,
    });
  }
});

// Le profil stocke l'IUT par nom, le formulaire attend un ID —
// on résout le match une fois la liste des IUTs chargée
watch(iuts, (loadedIuts) => {
  if (!loadedIuts?.length) return;
  const iutName = (session.value?.data?.user as any)?.iut;
  if (!iutName || props.modelValue.iutId) return;
  const match = loadedIuts.find((i) => i.name === iutName);
  if (match) updateField("iutId", match.id);
});

function updateField(field: keyof typeof props.modelValue, value: any) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}

const isMotorizedProxy = computed({
  get: () => props.modelValue.isMotorized,
  set: (val) => {
    updateField("isMotorized", val);
  },
});

const dietaryToggles = [
  { key: "isVegetarian", label: "Végétarien", icon: "lucide:leaf" },
  { key: "isVegan", label: "Vegan", icon: "lucide:sprout" },
  { key: "noPork", label: "Sans porc", icon: "lucide:ban" },
  { key: "noAlcohol", label: "Sans alcool", icon: "lucide:wine-off" },
] as const;

function toggleDietary(
  key: (typeof dietaryToggles)[number]["key"],
  val: boolean,
) {
  // Vegan implies vegetarian: keep mutually consistent without surprising the user
  updateField(key, val);
}
</script>

<template>
  <div class="space-y-5">
    <!-- Identité -->
    <div class="space-y-3">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
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
            :class="
              showErrors && !modelValue.firstName
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            "
          />
          <FieldError v-if="showErrors && !modelValue.firstName">
            Ce champ est obligatoire
          </FieldError>
        </Field>
        <Field>
          <FieldLabel for="lastName">Nom *</FieldLabel>
          <Input
            id="lastName"
            :model-value="modelValue.lastName"
            @update:model-value="updateField('lastName', String($event))"
            placeholder="Dupont"
            :class="
              showErrors && !modelValue.lastName
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            "
          />
          <FieldError v-if="showErrors && !modelValue.lastName">
            Ce champ est obligatoire
          </FieldError>
        </Field>
      </div>
    </div>

    <!-- Coordonnées -->
    <div class="space-y-3">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Coordonnées
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel for="email">Email *</FieldLabel>
          <InputGroup
            :class="
              showErrors && !modelValue.email
                ? 'border-destructive ring-destructive'
                : ''
            "
          >
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
            />
          </InputGroup>
          <FieldError v-if="showErrors && !modelValue.email">
            Ce champ est obligatoire
          </FieldError>
        </Field>
        <Field>
          <FieldLabel for="phone">Téléphone *</FieldLabel>
          <InputGroup
            :class="
              showErrors && !modelValue.phone
                ? 'border-destructive ring-destructive'
                : ''
            "
          >
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
            />
          </InputGroup>
          <FieldError v-if="showErrors && !modelValue.phone">
            Ce champ est obligatoire
          </FieldError>
        </Field>
      </div>
    </div>

    <!-- Établissement -->
    <div class="space-y-3">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Établissement
      </h3>
      <Field>
        <FieldLabel for="iut">IUT d'origine *</FieldLabel>
        <ClientOnly>
          <Select
            :model-value="modelValue.iutId"
            @update:model-value="updateField('iutId', $event)"
          >
            <SelectTrigger
              id="iut"
              :class="
                showErrors && !modelValue.iutId
                  ? 'border-destructive focus:ring-destructive'
                  : ''
              "
            >
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
        <FieldError v-if="showErrors && !modelValue.iutId">
          Veuillez sélectionner votre IUT
        </FieldError>
      </Field>
    </div>

    <!-- Informations complémentaires -->
    <div class="space-y-3">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Informations complémentaires
      </h3>

      <!-- Préférences alimentaires -->
      <Field>
        <FieldLabel>Préférences alimentaires</FieldLabel>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="t in dietaryToggles"
            :key="t.key"
            :for="`diet-${t.key}`"
            class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
          >
            <span class="flex items-center gap-2 text-sm font-medium">
              <Icon
                :name="t.icon"
                class="h-4 w-4 text-muted-foreground shrink-0"
              />
              {{ t.label }}
            </span>
            <Switch
              :id="`diet-${t.key}`"
              :model-value="modelValue[t.key]"
              @update:model-value="toggleDietary(t.key, $event)"
            />
          </label>
        </div>
        <FieldDescription> Cochez ce qui vous concerne </FieldDescription>
      </Field>

      <Field>
        <FieldLabel for="allergens">
          <span class="flex items-center gap-1.5">
            <Icon
              name="lucide:wheat"
              class="h-3.5 w-3.5 text-muted-foreground"
            />
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
        class="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div class="flex items-center gap-2.5">
          <Icon
            name="lucide:car"
            class="h-4 w-4 text-muted-foreground shrink-0"
          />
          <Label for="motorized" class="text-sm font-medium cursor-pointer">
            Êtes-vous motorisé ?
          </Label>
        </div>
        <Switch id="motorized" v-model="isMotorizedProxy" />
      </div>
    </div>
  </div>
</template>
