import { describe, expect, it } from "vitest";
import {
  extractValueAndUnit,
  normalizeText,
  tokenizeWithNgrams,
} from "./normalization";

describe("normalization", () => {
  it("normalizes phrases and number words", () => {
    const input = "Un Arm track two and load EQ8";
    const output = normalizeText(input);
    expect(output).toBe("unarm track 2 and load eq 8");
  });

  it("extracts value and unit", () => {
    const result = extractValueAndUnit("set cutoff to 1200 hz");
    expect(result).toEqual({ value: 1200, unit: "hz" });
  });

  it("builds ngrams for matching", () => {
    const tokens = tokenizeWithNgrams("load glue compressor", 3);
    expect(tokens).toEqual([
      "load",
      "glue",
      "compressor",
      "load glue",
      "glue compressor",
      "load glue compressor",
    ]);
  });
});
