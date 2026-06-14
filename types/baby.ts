export type BabyGender = "boy" | "girl" | "other";

export type BabyProfile = {
  id: string;
  name: string;
  nickname: string;
  gender: BabyGender;
  birthDate: string;
  avatar: string;
  birthWeightKg: number;
  birthHeightCm: number;
  currentWeightKg: number;
  currentHeightCm: number;
  developmentScore: number;
  sleepHoursToday: number;
  milkTodayMl: number;
  note?: string;
};

export type Baby = BabyProfile;
