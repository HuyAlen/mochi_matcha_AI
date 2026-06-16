import type { Baby, BabyId } from "@/types/baby";

export const babies: Baby[] = [
  {
    id: "mochi",
    name: "Mochi",
    nickname: "Bé Mochi",
    gender: "female",
    birthDate: "2025-10-16",
    avatarEmoji: "🎀",
    birthWeightKg: 2.4,
    birthHeightCm: 47,
  },
  {
    id: "matcha",
    name: "Matcha",
    nickname: "Bé Matcha",
    gender: "female",
    birthDate: "2025-10-16",
    avatarEmoji: "🌸",
    birthWeightKg: 2.3,
    birthHeightCm: 46,
  },
];

export function getBabyById(id: BabyId): Baby {
  return babies.find((baby) => baby.id === id) ?? babies[0];
}
