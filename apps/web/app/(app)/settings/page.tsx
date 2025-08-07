import { checkProfile } from "@/lib/require-auth";
import {
  SubscriptionManagement,
  ProfileSettings,
  SettingsHeader,
} from "@/features/settings/components";

export default async function SettingsPage() {
  const profile = await checkProfile();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <SettingsHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProfileSettings userProfile={profile} />
            <SubscriptionManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
