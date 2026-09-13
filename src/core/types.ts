export type Category = "standardized" | "vehicle" | "embodied" | "everyday" | "landmark";
export type Variability = "low" | "medium" | "high";
export type Unit = "in" | "ft" | "yd" | "mi" | "cm" | "m" | "km";

export interface ReferenceObject {
  id: string;
  name: string;
  pluralName: string;
  category: Category;
  canonicalLength: number; // meters
  variability: Variability;
  minUsefulRatio: number;
  maxUsefulRatio: number;
  source: string;
  locale?: string;
  countable?: boolean;
  familiarity: number; // 0-1
}

export interface Comparison {
  reference: ReferenceObject;
  ratio: number;
  score: number;
}

export interface TranslationResult {
  meters: number;
  inputValue: number;
  inputUnit: Unit;
  comparisons: Comparison[];
}
