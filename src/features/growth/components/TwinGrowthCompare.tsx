import type { TwinGrowthComparison } from "@/types/growth";

interface TwinGrowthCompareProps {
  comparison: TwinGrowthComparison;
}

export default function TwinGrowthCompare({
  comparison,
}: TwinGrowthCompareProps) {
  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <h3 className="text-lg font-black text-slate-950">So sánh song sinh</h3>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-3xl bg-pink-50 p-3 text-center">
          <p className="font-black text-pink-600">
            {comparison.weightDiffKg}kg
          </p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Chênh cân</p>
        </div>
        <div className="rounded-3xl bg-purple-50 p-3 text-center">
          <p className="font-black text-purple-600">
            {comparison.heightDiffCm}cm
          </p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Chênh cao</p>
        </div>
        <div className="rounded-3xl bg-lime-50 p-3 text-center">
          <p className="font-black text-lime-600">{comparison.headDiffCm}cm</p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Vòng đầu</p>
        </div>
      </div>

      <p className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-600">
        {comparison.insight}
      </p>
    </section>
  );
}
