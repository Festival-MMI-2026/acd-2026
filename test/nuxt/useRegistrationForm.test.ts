import { describe, expect, it } from "vitest";
import { ref } from "vue";
import type { Activity, Meal } from "~/types/registration";

describe("useRegistrationForm", () => {
  const mealWithOptions: Meal = {
    id: "meal-1",
    name: "Déjeuner jour 1",
    date: "2026-06-18",
    mealType: "LUNCH",
    price: 15,
    options: [
      {
        id: "s1",
        name: "Salade",
        optionType: "STARTER",
        hasAllergens: false,
        allergens: [],
      },
      {
        id: "m1",
        name: "Poulet",
        optionType: "MAIN",
        hasAllergens: false,
        allergens: [],
      },
      {
        id: "d1",
        name: "Tarte",
        optionType: "DESSERT",
        hasAllergens: false,
        allergens: [],
      },
    ],
  };

  const mealNoOptions: Meal = {
    id: "meal-2",
    name: "Dîner",
    date: "2026-06-18",
    mealType: "DINNER",
    price: 20,
    options: [],
  };

  const activity: Activity = {
    id: "act-1",
    name: "Visite",
    date: "2026-06-19",
    price: 5,
  };

  it("computes total price from selected meals and activities", () => {
    const meals = ref<Meal[]>([mealWithOptions, mealNoOptions]);
    const activities = ref<Activity[]>([activity]);
    const form = useRegistrationForm(meals, activities);

    form.selectedMeals.value = [
      { mealId: "meal-1", starterOptionId: "s1", mainOptionId: "m1", dessertOptionId: "d1" },
      { mealId: "meal-2" },
    ];
    form.selectedActivities.value = ["act-1"];

    expect(form.totalPrice.value).toBe(40);
  });

  it("invalidates meals when required options are missing", () => {
    const meals = ref<Meal[]>([mealWithOptions]);
    const activities = ref<Activity[]>([]);
    const form = useRegistrationForm(meals, activities);

    form.selectedMeals.value = [{ mealId: "meal-1" }];
    expect(form.mealsValid.value).toBe(false);

    form.selectedMeals.value = [
      { mealId: "meal-1", starterOptionId: "s1", mainOptionId: "m1", dessertOptionId: "d1" },
    ];
    expect(form.mealsValid.value).toBe(true);
  });

  it("meals are invalid when selection is empty", () => {
    const meals = ref<Meal[]>([mealWithOptions]);
    const activities = ref<Activity[]>([]);
    const form = useRegistrationForm(meals, activities);
    expect(form.mealsValid.value).toBe(false);
  });

  it("activities require at least one selection", () => {
    const meals = ref<Meal[]>([]);
    const activities = ref<Activity[]>([activity]);
    const form = useRegistrationForm(meals, activities);

    expect(form.activitiesValid.value).toBe(false);
    form.selectedActivities.value = ["act-1"];
    expect(form.activitiesValid.value).toBe(true);
  });

  it("hydrate populates selections from registration data", () => {
    const meals = ref<Meal[]>([mealWithOptions]);
    const activities = ref<Activity[]>([activity]);
    const form = useRegistrationForm(meals, activities);

    form.hydrate(
      [{ mealId: "meal-1", starterOptionId: "s1", mainOptionId: "m1", dessertOptionId: "d1" }],
      ["act-1"],
    );

    expect(form.selectedMeals.value).toHaveLength(1);
    expect(form.selectedActivities.value).toEqual(["act-1"]);
  });
});
