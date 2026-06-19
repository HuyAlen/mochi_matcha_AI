export type BabyId = "mochi" | "matcha";

export type BabyGender = "female" | "male" | "other";

export interface Baby {
  id: BabyId;
  name: string;
  nickname: string;
  gender: BabyGender;
  birthDate: string;
  avatarEmoji: string;
  avatarUrl: string;

  allergies: string;
  medicalNotes: string;

  likes: string;
  dislikes: string;
  sleepHabits: string;
  eatingHabits: string;
  careNotes: string;

  doctor: string;
  hospital: string;
  insurance: string;
}
