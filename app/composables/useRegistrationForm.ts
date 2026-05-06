import type { Activity, Meal, SelectedMeal } from "~/types/registration";

export function useRegistrationForm(
  meals: Ref<Meal[] | null | undefined>,
  activities: Ref<Activity[] | null | undefined>,
) {
  const selectedMeals = ref<SelectedMeal[]>([]);
  const selectedActivities = ref<string[]>([]);

  function findMeal(id: string): Meal | undefined {
    return meals.value?.find((m) => m.id === id);
  }

  function findActivity(id: string): Activity | undefined {
    return activities.value?.find((a) => a.id === id);
  }

  function hasOptionType(
    meal: Meal,
    type: "STARTER" | "MAIN" | "CHEESE" | "DESSERT",
  ): boolean {
    return !!meal.options?.some((o) => o.optionType === type);
  }

  const totalPrice = computed(() => {
    let total = 0;
    for (const sm of selectedMeals.value) {
      const meal = findMeal(sm.mealId);
      if (meal) total += Number(meal.price) || 0;
    }
    for (const id of selectedActivities.value) {
      const act = findActivity(id);
      if (act) total += Number(act.price) || 0;
    }
    return total;
  });

  const mealsValid = computed(() => {
    if (selectedMeals.value.length === 0) return false;
    for (const sm of selectedMeals.value) {
      const meal = findMeal(sm.mealId);
      if (!meal) continue;
      if (hasOptionType(meal, "STARTER") && !sm.starterOptionId) return false;
      if (hasOptionType(meal, "MAIN") && !sm.mainOptionId) return false;
      if (hasOptionType(meal, "CHEESE") && !sm.cheeseOptionId) return false;
      if (hasOptionType(meal, "DESSERT") && !sm.dessertOptionId) return false;
    }
    return true;
  });

  const activitiesValid = computed(() => selectedActivities.value.length > 0);

  function reset() {
    selectedMeals.value = [];
    selectedActivities.value = [];
  }

  function hydrate(
    meals: SelectedMeal[] | undefined,
    activities: string[] | undefined,
  ) {
    selectedMeals.value = meals ? [...meals] : [];
    selectedActivities.value = activities ? [...activities] : [];
  }

  return {
    selectedMeals,
    selectedActivities,
    totalPrice,
    mealsValid,
    activitiesValid,
    findMeal,
    findActivity,
    reset,
    hydrate,
  };
}
