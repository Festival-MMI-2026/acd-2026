import { z } from "zod";
import type { H3Event } from "h3";

export { z };

export const phoneSchema = z
  .string()
  .trim()
  .min(6, "Numéro de téléphone invalide")
  .max(32, "Numéro de téléphone invalide");

export const emailSchema = z.email("Email invalide").max(255);

export const priceSchema = z
  .number()
  .nonnegative("Le prix doit être positif ou nul")
  .max(10_000, "Prix trop élevé");

export const selectedMealSchema = z.object({
  mealId: z.string().min(1),
  starterOptionId: z.string().optional().nullable(),
  mainOptionId: z.string().optional().nullable(),
  dessertOptionId: z.string().optional().nullable(),
});

export const registrationCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: phoneSchema,
  iutId: z.string().optional().nullable(),
  allergens: z.string().max(500).optional().nullable(),
  isMotorized: z.boolean().optional(),
  meals: z.array(selectedMealSchema).default([]),
  activities: z.array(z.string().min(1)).default([]),
});

export const registrationUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  allergens: z.string().max(500).optional().nullable(),
  isMotorized: z.boolean().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  meals: z.array(selectedMealSchema).optional(),
  activities: z.array(z.string().min(1)).optional(),
});

export const activitySchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  date: z.string().or(z.date()),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  maxParticipants: z.coerce.number().int().positive().optional().nullable(),
  price: z.coerce.number().nonnegative().max(10_000).optional().default(0),
});

export const mealSchema = z.object({
  name: z.string().trim().min(1).max(255),
  date: z.string().or(z.date()),
  mealType: z.enum(["LUNCH", "DINNER"]),
  price: z.coerce.number().nonnegative().max(10_000),
});

export const orderStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "CASH", "FREE"]).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: emailSchema.optional(),
  tel: phoneSchema.optional(),
  iut: z.string().max(100).optional(),
});

export async function readValidated<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.output<T>> {
  const body = await readBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: { errors: result.error.issues },
    });
  }
  return result.data;
}
