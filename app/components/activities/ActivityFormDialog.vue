<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { toast } from "vue-sonner";

interface ActivityData {
  id?: string;
  name: string;
  description?: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  maxParticipants?: number | null;
  price: number | string;
}

const props = defineProps<{
  open: boolean;
  activity?: ActivityData | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const isLoading = ref(false);
const isEditMode = computed(() => !!props.activity?.id);
const datePickerOpen = ref(false);

// Form state
const formData = ref({
  name: "",
  description: "",
  date: today(getLocalTimeZone()) as DateValue,
  startTime: "10:00",
  endTime: "12:00",
  allDay: false,
  maxParticipants: "",
  price: "0",
});

// Convert JS Date to CalendarDate
function toCalendarDate(date: Date | string): DateValue {
  const d = new Date(date);
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// Reset form when dialog opens/closes or activity changes
watch(
  () => [props.open, props.activity],
  () => {
    if (props.open && props.activity) {
      formData.value = {
        name: props.activity.name,
        description: props.activity.description || "",
        date: toCalendarDate(props.activity.date),
        startTime: props.activity.startTime || "10:00",
        endTime: props.activity.endTime || "12:00",
        allDay: !!props.activity.allDay,
        maxParticipants: props.activity.maxParticipants
          ? String(props.activity.maxParticipants)
          : "",
        price: String(props.activity.price),
      };
    } else if (props.open && !props.activity) {
      formData.value = {
        name: "",
        description: "",
        date: today(getLocalTimeZone()),
        startTime: "10:00",
        endTime: "12:00",
        allDay: false,
        maxParticipants: "",
        price: "0",
      };
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (
    !formData.value.name ||
    !formData.value.date ||
    (!formData.value.allDay &&
      (!formData.value.startTime || !formData.value.endTime))
  ) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  isLoading.value = true;

  try {
    const dateValue = formData.value.date.toDate(getLocalTimeZone());

    const payload = {
      name: formData.value.name,
      description: formData.value.description || null,
      date: dateValue,
      startTime: formData.value.allDay ? "" : formData.value.startTime,
      endTime: formData.value.allDay ? "" : formData.value.endTime,
      allDay: formData.value.allDay,
      maxParticipants: formData.value.maxParticipants
        ? parseInt(formData.value.maxParticipants)
        : null,
      price: parseFloat(formData.value.price) || 0,
    };

    if (isEditMode.value && props.activity?.id) {
      await $fetch(`/api/activities/${props.activity.id}`, {
        method: "PUT",
        body: payload,
      });
      toast.success("Activité modifiée avec succès");
    } else {
      await $fetch("/api/activities", {
        method: "POST",
        body: payload,
      });
      toast.success("Activité créée avec succès");
    }

    emit("success");
    emit("update:open", false);
  } catch (error) {
    console.error(error);
    toast.error("Une erreur est survenue");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {{ isEditMode ? "Modifier l'activité" : "Nouvelle activité" }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditMode
              ? "Modifiez les informations de l'activité"
              : "Ajoutez une nouvelle activité au programme"
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nom *</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Visite guidée..."
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Description de l'activité..."
            rows="3"
          />
        </div>

        <div class="flex gap-4">
          <!-- Date picker -->
          <div class="flex flex-col gap-2 flex-1">
            <Label class="px-1">Date *</Label>
            <Popover v-model:open="datePickerOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  class="w-full justify-between font-normal"
                >
                  {{
                    formData.date
                      ? formData.date
                          .toDate(getLocalTimeZone())
                          .toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                      : "Sélectionner"
                  }}
                  <Icon name="lucide:chevron-down" class="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  :model-value="formData.date"
                  @update:model-value="
                    (value) => {
                      if (value) {
                        formData.date = value as DateValue;
                        datePickerOpen = false;
                      }
                    }
                  "
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
          <Label for="allDay" class="text-sm font-medium cursor-pointer flex items-center gap-2">
            <Icon name="lucide:calendar-clock" class="h-4 w-4 text-muted-foreground" />
            Toute la journée
          </Label>
          <Switch id="allDay" v-model="formData.allDay" />
        </div>

        <div v-if="!formData.allDay" class="flex gap-4">
          <div class="flex flex-col gap-2 flex-1">
            <Label for="startTime">Début *</Label>
            <Input
              id="startTime"
              type="time"
              v-model="formData.startTime"
              required
            />
          </div>
          <div class="flex flex-col gap-2 flex-1">
            <Label for="endTime">Fin *</Label>
            <Input
              id="endTime"
              type="time"
              v-model="formData.endTime"
              required
            />
          </div>
        </div>

        <div class="flex gap-4">
          <div class="space-y-2 flex-1">
            <Label for="maxParticipants">Max participants</Label>
            <Input
              id="maxParticipants"
              v-model="formData.maxParticipants"
              type="number"
              min="1"
              placeholder="Illimité"
            />
          </div>
          <div class="space-y-2 flex-1">
            <Label for="price">Prix (€)</Label>
            <Input
              id="price"
              v-model="formData.price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
            :disabled="isLoading"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="isLoading">
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ isEditMode ? "Enregistrer" : "Créer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
