import { SettingsView } from "@/components/settings-view";
import { requirePageAuth } from "@/lib/auth";

export default async function SettingsPage() {
  await requirePageAuth();
  return <SettingsView />;
}
