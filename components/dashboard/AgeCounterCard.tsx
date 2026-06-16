import { babies } from "@/src/store/babyStore";

function getAgeMonths(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

export default function AgeCounterCard() {
  const birthDate = babies[0]?.birthDate ?? new Date().toISOString();
  const months = getAgeMonths(birthDate);

  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 via-purple-100 to-lime-100 p-4 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-purple-700">Twin Age</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">
            🎂 {months} tháng tuổi
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ăn dặm • Bò trườn • Tập đứng
          </p>
        </div>

        <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-white/80 text-3xl shadow-sm">
          👧🏻👧🏼
        </div>
      </div>
    </div>
  );
}
