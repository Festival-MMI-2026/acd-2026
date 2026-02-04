<script setup lang="ts">
import { computed } from "vue";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  modelValue?: Date | null;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Sélectionner une date",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: Date | null];
}>();

// Convert Date to CalendarDate for internal use
const internalValue = computed({
  get: () => {
    if (!props.modelValue) return undefined;
    return new CalendarDate(
      props.modelValue.getFullYear(),
      props.modelValue.getMonth() + 1,
      props.modelValue.getDate(),
    );
  },
  set: (val: DateValue | undefined) => {
    if (!val) {
      emit("update:modelValue", null);
      return;
    }
    emit("update:modelValue", val.toDate(getLocalTimeZone()));
  },
});

const defaultPlaceholder = today(getLocalTimeZone());

const formattedDate = computed(() => {
  if (!props.modelValue) return null;
  return props.modelValue.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        :class="
          cn(
            'w-full justify-start text-left font-normal rounded-xl',
            !modelValue && 'text-muted-foreground',
            props.class,
          )
        "
      >
        <Icon name="lucide:calendar" class="mr-2 h-4 w-4" />
        {{ formattedDate || placeholder }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        v-model="internalValue"
        :initial-focus="true"
        :default-placeholder="defaultPlaceholder"
      />
    </PopoverContent>
  </Popover>
</template>
