import AppShell from "@/components/layout/AppShell";
import { ReminderCenter } from "@/features/reminders";

export default function RemindersPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50 px-4 pb-28 pt-4">
        <div className="mx-auto w-full max-w-[430px] space-y-5">
          <section className="overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-400 px-5 py-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/75">
                Mind AI Reminder
              </p>

              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black leading-tight">
                    Nháº¯c lá»‹ch chÄƒm bÃ©
                  </h1>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                    Táº¡o nháº¯c cá»¯ sá»¯a, ngá»§, thuá»‘c, hÃºt sá»¯a vÃ  lá»‹ch riÃªng cho
                    Matcha & Mochi.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-3xl shadow-inner ring-1 ring-white/25">
                  â°
                </div>
              </div>
            </div>
          </section>

          <ReminderCenter />
        </div>
      </main>
    </AppShell>
  );
}
