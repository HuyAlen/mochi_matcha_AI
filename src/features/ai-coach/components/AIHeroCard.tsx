export default function AIHeroCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-center gap-4">
        <div className="flex size-24 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 text-6xl">
          🤖
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold leading-6 text-slate-700">
            Xin chào mẹ! Mind AI đang đọc dữ liệu của Mochi & Matcha để đưa ra
            gợi ý cá nhân hóa.
          </p>
        </div>
      </div>
    </div>
  );
}
