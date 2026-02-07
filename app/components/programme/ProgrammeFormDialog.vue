<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { toast } from "vue-sonner";

interface EventData {
  id?: string;
  title: string;
  description?: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  location?: string | null;
}

const props = defineProps<{
  open: boolean;
  event?: EventData | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const isLoading = ref(false);
const isEditMode = computed(() => !!props.event?.id);
const datePickerOpen = ref(false);

// Form state
const formData = ref({
  title: "",
  description: "",
  date: today(getLocalTimeZone()) as DateValue,
  startTime: "",
  endTime: "",
  location: "",
});

// Convert JS Date to CalendarDate
function toCalendarDate(date: Date | string): DateValue {
  const d = new Date(date);
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// Reset form when dialog opens/closes or event changes
watch(
  () => [props.open, props.event],
  () => {
    if (props.open && props.event) {
      formData.value = {
        title: props.event.title,
        description: props.event.description || "",
        date: toCalendarDate(props.event.date),
        startTime: props.event.startTime,
        endTime: props.event.endTime,
        location: props.event.location || "",
      };
    } else if (props.open && !props.event) {
      formData.value = {
        title: "",
        description: "",
        date: today(getLocalTimeZone()),
        startTime: "",
        endTime: "",
        location: "",
      };
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  // Validate
  if (
    !formData.value.title ||
    !formData.value.date ||
    !formData.value.startTime ||
    !formData.value.endTime
  ) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  isLoading.value = true;

  try {
    // Send date as YYYY-MM-DD string to avoid timezone shift
    const d = formData.value.date;
    const dateStr = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

    if (isEditMode.value && props.event?.id) {
      await $fetch(`/api/events/${props.event.id}`, {
        method: "PUT",
        body: {
          title: formData.value.title,
          description: formData.value.description || null,
          date: dateStr,
          startTime: formData.value.startTime,
          endTime: formData.value.endTime,
          location: formData.value.location || null,
        },
      });
      toast.success("Événement modifié avec succès");
    } else {
      await $fetch("/api/events", {
        method: "POST",
        body: {
          title: formData.value.title,
          description: formData.value.description || null,
          date: dateStr,
          startTime: formData.value.startTime,
          endTime: formData.value.endTime,
          location: formData.value.location || null,
        },
      });
      toast.success("Événement créé avec succès");
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
          {{ isEditMode ? "Modifier l'événement" : "Nouvel événement" }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditMode
              ? "Modifiez les informations de l'événement"
              : "Ajoutez un nouvel événement au programme"
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="title">Titre *</Label>
          <Input
            id="title"
            v-model="formData.title"
            placeholder="Conférence d'ouverture"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Description de l'événement..."
            rows="3"
          />
        </div>

        <!-- Date and Time pickers -->
        <div class="flex gap-4">
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
                        formData.date = value;
                        datePickerOpen = false;
                      }
                    }
                  "
                />
              </PopoverContent>
            </Popover>
          </div>

          <div class="flex flex-col gap-2">
            <Label for="startTime" class="px-1">Début *</Label>
            <Input
              id="startTime"
              v-model="formData.startTime"
              type="time"
              required
              class="w-28 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="endTime" class="px-1">Fin *</Label>
            <Input
              id="endTime"
              v-model="formData.endTime"
              type="time"
              required
              class="w-28 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="location">Lieu</Label>
          <Input
            id="location"
            v-model="formData.location"
            placeholder="Amphithéâtre A"
          />
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
