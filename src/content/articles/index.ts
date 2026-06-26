import type { Article } from "@/lib/content/types";
import { whatIsAcne } from "./concerns/acne/what-is-acne";
import { whatIsBodyFat } from "./concerns/body-fat/what-is-body-fat";
import { whatIsHairLoss } from "./concerns/hair-loss/what-is-hair-loss";
import { whatIsPigmentation } from "./concerns/pigmentation/what-is-pigmentation";
import { whatIsUnderEyeConcerns } from "./concerns/under-eye-concerns/what-is-under-eye-concerns";
import { whatIsUnwantedHair } from "./concerns/unwanted-hair/what-is-unwanted-hair";
import { whatIsWrinklesAndFineLines } from "./concerns/wrinkles-and-fine-lines/what-is-wrinkles-and-fine-lines";
import { whatIsBotox } from "./treatments/botox/what-is-botox";
import { whatAreDermalFillers } from "./treatments/dermal-fillers/what-is-dermal-fillers";
import { vsBotox } from "./treatments/dermal-fillers/vs-botox";
import { howAestheticClinicPricingWorksInTheUae } from "./guides/how-aesthetic-clinic-pricing-works-in-the-uae";
import { whatIsLaserHairRemoval } from "./treatments/laser-hair-removal/what-is-laser-hair-removal";
import { costOfLaserHairRemovalInDubai } from "./treatments/laser-hair-removal/cost-in-dubai";
import { howToVerifyClinicLicenseUae } from "./guides/dha-mohap-licensing-how-to-verify-your-clinic";
import { costOfBotoxInDubai } from "./treatments/botox/cost-of-botox-in-dubai";
import { acneScarsTreatment } from "./concerns/acne/acne-scars-treatment";
import { costOfDermalFillersInDubai } from "./treatments/dermal-fillers/cost-of-dermal-fillers-in-dubai";
import { laserHairRemovalDarkSkin } from "./treatments/laser-hair-removal/laser-hair-removal-dark-skin";
import { hairLossTreatments } from "./concerns/hair-loss/hair-loss-treatments";
import { whatIsMicroneedling } from "./treatments/microneedling/what-is-microneedling";
import { whatIsHydrafacial } from "./treatments/hydrafacial/what-is-hydrafacial";
import { whatIsPrp } from "./treatments/prp/what-is-prp";
import { whatIsChemicalPeels } from "./treatments/chemical-peels/what-is-chemical-peels";
import { whatIsCoolsculpting } from "./treatments/coolsculpting/what-is-coolsculpting";
import { costOfMicroneedlingInDubai } from "./treatments/microneedling/cost-of-microneedling-in-dubai";
import { costOfHydrafacialInDubai } from "./treatments/hydrafacial/cost-of-hydrafacial-in-dubai";
import { whatIsRosacea } from "./concerns/rosacea/what-is-rosacea";
import { darkCircles } from "./concerns/under-eye-concerns/dark-circles";

export const allArticles: Article[] = [
  whatIsAcne,
  whatIsBodyFat,
  whatIsHairLoss,
  whatIsPigmentation,
  whatIsUnderEyeConcerns,
  whatIsUnwantedHair,
  whatIsWrinklesAndFineLines,
  whatIsBotox,
  whatAreDermalFillers,
  vsBotox,
  howAestheticClinicPricingWorksInTheUae,
  whatIsLaserHairRemoval,
  costOfLaserHairRemovalInDubai,
  howToVerifyClinicLicenseUae,
  costOfBotoxInDubai,
  acneScarsTreatment,
  costOfDermalFillersInDubai,
  laserHairRemovalDarkSkin,
  hairLossTreatments,
  whatIsMicroneedling,
  whatIsHydrafacial,
  whatIsPrp,
  whatIsChemicalPeels,
  whatIsCoolsculpting,
  costOfMicroneedlingInDubai,
  costOfHydrafacialInDubai,
  whatIsRosacea,
  darkCircles,
];
