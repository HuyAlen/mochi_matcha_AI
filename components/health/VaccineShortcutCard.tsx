import Link from "next/link";

export default function VaccineShortcutCard() {
  return (
    <Link
      href="/vaccines"
      className="block rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100"
    >
      <p className="text-sm font-bold text-purple-700">Vaccines</p>
      <h3 className="mt-2 text-lg font-black text-slate-950">
        Xem lịch tiêm của Mochi & Matcha
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Theo dõi mũi sắp tới, lịch sử tiêm và phản ứng sau tiêm.
      </p>
    </Link>
  );
}
