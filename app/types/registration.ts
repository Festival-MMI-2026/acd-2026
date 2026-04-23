export interface SelectedMeal {
  mealId: string;
  starterOptionId?: string;
  mainOptionId?: string;
  dessertOptionId?: string;
}

export interface MealOption {
  id: string;
  name: string;
  optionType: "STARTER" | "MAIN" | "DESSERT";
  hasAllergens: boolean;
  allergens: string[];
}

export interface Meal {
  id: string;
  name: string;
  date: string;
  mealType: "LUNCH" | "DINNER";
  price: number | string;
  options?: MealOption[];
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  capacity?: number;
  maxParticipants?: number;
  location?: string;
  price?: number | string;
}

export interface Iut {
  id: string;
  name: string;
  city?: string | null;
}

export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iutId?: string | null;
  allergens?: string | null;
  isMotorized: boolean;
  totalPrice: number | string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  meals?: RegistrationMealItem[];
  activities?: RegistrationActivityItem[];
  order?: Order | null;
}

export interface RegistrationMealItem {
  id: string;
  mealId: string;
  meal?: Meal;
  starterOptionId?: string | null;
  mainOptionId?: string | null;
  dessertOptionId?: string | null;
  starterOption?: MealOption | null;
  mainOption?: MealOption | null;
  dessertOption?: MealOption | null;
}

export interface RegistrationActivityItem {
  id: string;
  activityId: string;
  activity?: Activity;
}

export interface Order {
  id: string;
  orderNumber: string;
  amount: number | string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod?: "CARD" | "TRANSFER" | "CASH" | "FREE" | null;
  notes?: string | null;
  paidAt?: string | null;
}
