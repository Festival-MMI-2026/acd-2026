type DateLike = string | Date | null | undefined;

function dateMs(d: DateLike): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

const MEAL_TYPE_ORDER: Record<string, number> = { LUNCH: 0, DINNER: 1 };

export function compareMealsByDate<
  T extends { date?: DateLike; mealType?: string | null },
>(a: T, b: T): number {
  const diff = dateMs(a.date) - dateMs(b.date);
  if (diff !== 0) return diff;
  return (
    (MEAL_TYPE_ORDER[a.mealType ?? ""] ?? 9) -
    (MEAL_TYPE_ORDER[b.mealType ?? ""] ?? 9)
  );
}

export function compareActivitiesByDate<
  T extends {
    date?: DateLike;
    startTime?: string | null;
    allDay?: boolean | null;
  },
>(a: T, b: T): number {
  const diff = dateMs(a.date) - dateMs(b.date);
  if (diff !== 0) return diff;
  if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
  return (a.startTime ?? "").localeCompare(b.startTime ?? "");
}

export function sortSelectedMealsByDate<T extends { mealId: string }>(
  selected: readonly T[],
  meals: readonly { id: string; date?: DateLike; mealType?: string | null }[],
): T[] {
  const byId = new Map(meals.map((m) => [m.id, m]));
  return [...selected].sort((a, b) =>
    compareMealsByDate(byId.get(a.mealId) ?? {}, byId.get(b.mealId) ?? {}),
  );
}

export function sortSelectedActivityIdsByDate(
  selectedIds: readonly string[],
  activities: readonly {
    id: string;
    date?: DateLike;
    startTime?: string | null;
    allDay?: boolean | null;
  }[],
): string[] {
  const byId = new Map(activities.map((a) => [a.id, a]));
  return [...selectedIds].sort((a, b) =>
    compareActivitiesByDate(byId.get(a) ?? {}, byId.get(b) ?? {}),
  );
}

export function sortRegistrationMealsByDate<
  T extends { meal?: { date?: DateLike; mealType?: string | null } | null },
>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    compareMealsByDate(a.meal ?? {}, b.meal ?? {}),
  );
}

export function sortRegistrationActivitiesByDate<
  T extends {
    activity?: {
      date?: DateLike;
      startTime?: string | null;
      allDay?: boolean | null;
    } | null;
  },
>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    compareActivitiesByDate(a.activity ?? {}, b.activity ?? {}),
  );
}
