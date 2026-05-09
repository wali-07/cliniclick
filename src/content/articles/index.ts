import type { Article } from "@/lib/content/types";
import { whatIsAcne } from "./concerns/acne/what-is-acne";
import { whatIsBotox } from "./treatments/botox/what-is-botox";

export const allArticles: Article[] = [whatIsAcne, whatIsBotox];
