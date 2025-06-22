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

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg mb-4 text-foreground">
                  Quick Links
                </h3>
                <div className="space-y-3 text-sm">
                  <a
                    href="#profile"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#subscription"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Subscription Management
                  </a>
                  <a
                    href="#security"
                    className="block text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
                  >
                    Security Settings (Coming Soon)
                  </a>
                  <a
                    href="#notifications"
                    className="block text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
                  >
                    Notifications (Coming Soon)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
