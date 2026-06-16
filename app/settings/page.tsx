import AppShell from "@/components/layout/AppShell";
import LogoutButton from "@/components/settings/LogoutButton";
import ProfileCard from "@/components/settings/ProfileCard";
import SettingsMenu from "@/components/settings/SettingsMenu";
import SyncStatusCard from "@/components/settings/SyncStatusCard";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Hồ sơ</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản và thiết lập Mind AI.
          </p>
        </div>

        <ProfileCard />

        <SettingsMenu />

        <SyncStatusCard />

        <LogoutButton />
      </section>
    </AppShell>
  );
}
