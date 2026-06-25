export type BabyId = "mochi" | "matcha";

export type BabyGender = "girl" | "boy" | "other";

export interface BabyProfile {
  id: BabyId;
  name: string;
  nickname?: string;
  gender: BabyGender;
  birthDate: string;
  avatar?: string;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
}
