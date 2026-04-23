import { describe, expect, it } from "vitest";
import {
  registrationCreateSchema,
  registrationUpdateSchema,
  userUpdateSchema,
  activitySchema,
} from "../../server/utils/validation";

describe("registrationCreateSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = registrationCreateSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      phone: "0612345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty first name", () => {
    const result = registrationCreateSchema.safeParse({
      firstName: "",
      lastName: "Dupont",
      phone: "0612345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone", () => {
    const result = registrationCreateSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts meals and activities arrays", () => {
    const result = registrationCreateSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      phone: "0612345678",
      meals: [{ mealId: "m1", starterOptionId: "s1" }],
      activities: ["a1", "a2"],
    });
    expect(result.success).toBe(true);
  });
});

describe("registrationUpdateSchema", () => {
  it("accepts partial update", () => {
    const result = registrationUpdateSchema.safeParse({ firstName: "Jean" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status values", () => {
    const result = registrationUpdateSchema.safeParse({ status: "UNKNOWN" });
    expect(result.success).toBe(false);
  });
});

describe("userUpdateSchema", () => {
  it("rejects non-email values", () => {
    const result = userUpdateSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("activitySchema", () => {
  it("rejects negative price", () => {
    const result = activitySchema.safeParse({
      name: "Conf",
      date: "2026-06-18",
      startTime: "10:00",
      endTime: "11:00",
      price: -5,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = activitySchema.safeParse({
      name: "Conf",
      date: "2026-06-18",
      startTime: "10:00",
      endTime: "11:00",
      price: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(15);
  });
});
