export type BabyId = "mochi" | "matcha";

export type BabyGender = "female";

export interface Baby {
  id: BabyId;
  name: string;
  nickname: string;
  gender: BabyGender;
  birthDate: string;
  avatarEmoji: string;
  birthWeightKg: number;
  birthHeightCm: number;
}
