import type { Article } from "@/lib/content/types";
import { whatIsAcne } from "./concerns/acne/what-is-acne";
import { whatIsBotox } from "./treatments/botox/what-is-botox";
import { whatAreDermalFillers } from "./treatments/dermal-fillers/what-is-dermal-fillers";
import { vsBotox } from "./treatments/dermal-fillers/vs-botox";
import { howAestheticClinicPricingWorksInTheUae } from "./guides/how-aesthetic-clinic-pricing-works-in-the-uae";
import { whatIsLaserHairRemoval } from "./treatments/laser-hair-removal/what-is-laser-hair-removal";

export const allArticles: Article[] = [whatIsAcne, whatIsBotox, whatAreDermalFillers, vsBotox, howAestheticClinicPricingWorksInTheUae, whatIsLaserHairRemoval];
