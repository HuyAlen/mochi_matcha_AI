export default function SyncStatusCard() {
  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">Cloud Sync</p>
      <h3 className="mt-2 text-lg font-black text-slate-950">
        Dữ liệu Mochi & Matcha đã sẵn sàng đồng bộ
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Sprint sau có thể kết nối Supabase để đồng bộ tài khoản gia đình.
      </p>
    </div>
  );
}
