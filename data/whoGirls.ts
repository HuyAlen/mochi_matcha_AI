import type { WHOReferencePoint } from "@/types/health";

/**
 * Bảng tham chiếu rút gọn cho bé gái 0-24 tháng.
 * Đây là dữ liệu mô phỏng để xây MVP UI và logic percentile.
 * Khi đưa vào production, nên thay bằng dataset WHO đầy đủ.
 */
export const whoGirlsWeightForAge: WHOReferencePoint[] = [
  { ageMonths: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { ageMonths: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
  { ageMonths: 2, p3: 3.9, p15: 4.4, p50: 5.1, p85: 5.8, p97: 6.6 },
  { ageMonths: 3, p3: 4.5, p15: 5.0, p50: 5.8, p85: 6.6, p97: 7.5 },
  { ageMonths: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.3, p97: 8.2 },
  { ageMonths: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
  { ageMonths: 6, p3: 5.7, p15: 6.4, p50: 7.3, p85: 8.3, p97: 9.3 },
  { ageMonths: 7, p3: 6.0, p15: 6.7, p50: 7.6, p85: 8.7, p97: 9.8 },
  { ageMonths: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 9.0, p97: 10.2 },
  { ageMonths: 9, p3: 6.5, p15: 7.3, p50: 8.2, p85: 9.3, p97: 10.5 },
  { ageMonths: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.6, p97: 10.9 },
  { ageMonths: 11, p3: 6.9, p15: 7.7, p50: 8.7, p85: 9.9, p97: 11.2 },
  { ageMonths: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5 },
  { ageMonths: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.9, p97: 12.4 },
  { ageMonths: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.6, p97: 13.2 },
  { ageMonths: 21, p3: 8.6, p15: 9.6, p50: 10.9, p85: 12.4, p97: 14.1 },
  { ageMonths: 24, p3: 9.0, p15: 10.1, p50: 11.5, p85: 13.1, p97: 14.8 },
];

export const whoGirlsHeightForAge: WHOReferencePoint[] = [
  { ageMonths: 0, p3: 45.4, p15: 47.0, p50: 49.1, p85: 51.2, p97: 52.9 },
  { ageMonths: 1, p3: 49.8, p15: 51.5, p50: 53.7, p85: 55.9, p97: 57.6 },
  { ageMonths: 2, p3: 53.0, p15: 54.7, p50: 57.1, p85: 59.4, p97: 61.1 },
  { ageMonths: 3, p3: 55.6, p15: 57.4, p50: 59.8, p85: 62.1, p97: 64.0 },
  { ageMonths: 4, p3: 57.8, p15: 59.7, p50: 62.1, p85: 64.5, p97: 66.4 },
  { ageMonths: 5, p3: 59.6, p15: 61.6, p50: 64.0, p85: 66.5, p97: 68.5 },
  { ageMonths: 6, p3: 61.2, p15: 63.2, p50: 65.7, p85: 68.3, p97: 70.3 },
  { ageMonths: 7, p3: 62.7, p15: 64.7, p50: 67.3, p85: 69.9, p97: 71.9 },
  { ageMonths: 8, p3: 64.0, p15: 66.1, p50: 68.7, p85: 71.4, p97: 73.5 },
  { ageMonths: 9, p3: 65.3, p15: 67.4, p50: 70.1, p85: 72.8, p97: 75.0 },
  { ageMonths: 10, p3: 66.5, p15: 68.6, p50: 71.5, p85: 74.2, p97: 76.4 },
  { ageMonths: 11, p3: 67.7, p15: 69.9, p50: 72.8, p85: 75.6, p97: 77.8 },
  { ageMonths: 12, p3: 68.9, p15: 71.1, p50: 74.0, p85: 76.9, p97: 79.2 },
  { ageMonths: 15, p3: 72.0, p15: 74.3, p50: 77.5, p85: 80.6, p97: 83.0 },
  { ageMonths: 18, p3: 74.9, p15: 77.4, p50: 80.7, p85: 83.9, p97: 86.5 },
  { ageMonths: 21, p3: 77.5, p15: 80.1, p50: 83.7, p85: 87.1, p97: 89.8 },
  { ageMonths: 24, p3: 80.0, p15: 82.8, p50: 86.4, p85: 90.0, p97: 92.9 },
];
