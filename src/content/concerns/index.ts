import type { Concern } from "@/lib/content/types";
import { acne } from "./acne";
import { unwantedHair } from "./unwanted-hair";
import { underEyeConcerns } from "./under-eye-concerns";
import { pigmentation } from "./pigmentation";
import { hairLoss } from "./hair-loss";
import { wrinklesAndFineLines } from "./wrinkles-and-fine-lines";
import { bodyFat } from "./body-fat";

export const allConcerns: Concern[] = [
  acne,
  unwantedHair,
  underEyeConcerns,
  pigmentation,
  hairLoss,
  wrinklesAndFineLines,
  bodyFat,
];
