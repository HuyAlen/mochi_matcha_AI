import { BottomNav } from "@/components/layout/BottomNav";

export default function AICoachPage() {
  return (
    <main className="min-h-screen bg-[#F8F7FF]">
      <div className="mx-auto min-h-screen max-w-md bg-white px-5 pb-28 pt-6">
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="mt-2 text-slate-500">
          AI phân tích và gợi ý chăm bé mỗi ngày.
        </p>
        <BottomNav />
      </div>
    </main>
  );
}
