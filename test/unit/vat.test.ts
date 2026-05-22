import { describe, expect, it } from "vitest";
import { computeVat } from "../../shared/utils/vat";

describe("computeVat", () => {
  it("returns no VAT when rate is 0 (current behavior)", () => {
    const r = computeVat(150, 0);
    expect(r.ht).toBeCloseTo(150, 2);
    expect(r.tva).toBeCloseTo(0, 2);
    expect(r.ttc).toBeCloseTo(150, 2);
    expect(r.rate).toBe(0);
  });

  it("extracts 10% VAT from a TTC total without changing the total", () => {
    const r = computeVat(110, 10);
    expect(r.ttc).toBeCloseTo(110, 2);
    expect(r.ht).toBeCloseTo(100, 2);
    expect(r.tva).toBeCloseTo(10, 2);
  });

  it("extracts 20% VAT from a TTC total", () => {
    const r = computeVat(120, 20);
    expect(r.ht).toBeCloseTo(100, 2);
    expect(r.tva).toBeCloseTo(20, 2);
  });

  it("supports decimal rates (5.5%)", () => {
    const r = computeVat(105.5, 5.5);
    expect(r.ht).toBeCloseTo(100, 2);
    expect(r.tva).toBeCloseTo(5.5, 2);
  });

  it("ht + tva always equals ttc", () => {
    const r = computeVat(237.42, 13);
    expect(r.ht + r.tva).toBeCloseTo(r.ttc, 6);
  });

  it("treats invalid / missing inputs as 0", () => {
    const r = computeVat(NaN as unknown as number, undefined as unknown as number);
    expect(r.ttc).toBe(0);
    expect(r.ht).toBe(0);
    expect(r.tva).toBe(0);
    expect(r.rate).toBe(0);
  });
});
