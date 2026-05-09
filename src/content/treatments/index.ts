import type { Treatment } from "@/lib/content/types";
import { botox } from "./botox";
import { dermalFillers } from "./dermal-fillers";
import { laserHairRemoval } from "./laser-hair-removal";
import { chemicalPeels } from "./chemical-peels";
import { microneedling } from "./microneedling";
import { prp } from "./prp";
import { hydrafacial } from "./hydrafacial";
import { coolsculpting } from "./coolsculpting";

export const allTreatments: Treatment[] = [
  botox,
  dermalFillers,
  laserHairRemoval,
  chemicalPeels,
  microneedling,
  prp,
  hydrafacial,
  coolsculpting,
];
