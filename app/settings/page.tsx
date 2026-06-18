import AppShell from "@/components/layout/AppShell";
import LogoutButton from "@/components/settings/LogoutButton";
import ProfileCard from "@/components/settings/ProfileCard";
import SettingsMenu from "@/components/settings/SettingsMenu";
import SyncStatusCard from "@/components/settings/SyncStatusCard";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="space-y-3 pb-4">
        <ProfileCard />
        <SettingsMenu />
        <SyncStatusCard />
        <LogoutButton />
      </section>
    </AppShell>
  );
}
