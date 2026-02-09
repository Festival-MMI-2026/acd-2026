<script setup lang="ts">
import { useSession } from "~/lib/auth-client";

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
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Informations personnelles</h2>
      <p class="text-muted-foreground">
        Renseignez vos coordonnées pour l'inscription
      </p>
    </div>

    <div class="grid gap-4">
      <!-- Prénom / Nom -->
      <div class="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel for="firstName">Prénom</FieldLabel>
          <Input
            id="firstName"
            :model-value="modelValue.firstName"
            @update:model-value="updateField('firstName', String($event))"
            placeholder="Jean"
            required
          />
        </Field>
        <Field>
          <FieldLabel for="lastName">Nom</FieldLabel>
          <Input
            id="lastName"
            :model-value="modelValue.lastName"
            @update:model-value="updateField('lastName', String($event))"
            placeholder="Dupont"
            required
          />
        </Field>
      </div>

      <!-- Email -->
      <Field>
        <FieldLabel for="email">Email</FieldLabel>
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

      <!-- Téléphone -->
      <Field>
        <FieldLabel for="phone">Téléphone</FieldLabel>
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

      <!-- IUT Select -->
      <Field>
        <FieldLabel for="iut">IUT d'origine</FieldLabel>
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
      </Field>

      <!-- Allergènes -->
      <Field>
        <FieldLabel for="allergens">Allergies alimentaires</FieldLabel>
        <Textarea
          id="allergens"
          :model-value="modelValue.allergens"
          @update:model-value="updateField('allergens', String($event))"
          placeholder="Indiquez vos allergies alimentaires (ex: gluten, lactose, fruits à coque...)"
          rows="2"
        />
        <p class="text-sm text-muted-foreground mt-1">
          Laissez vide si vous n'avez pas d'allergies
        </p>
      </Field>

      <!-- Motorisé -->
      <div class="flex items-center justify-between rounded-lg border p-4">
        <div class="space-y-0.5">
          <Label for="motorized" class="text-base font-medium">
            Êtes-vous motorisé ?
          </Label>
          <p class="text-sm text-muted-foreground">
            Indiquez si vous disposez d'un véhicule pour vos déplacements
          </p>
        </div>
        <Switch
          id="motorized"
          :checked="modelValue.isMotorized"
          @update:checked="updateField('isMotorized', $event)"
        />
      </div>
    </div>
  </div>
</template>
