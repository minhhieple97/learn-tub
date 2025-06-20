import { checkAuth } from "@/lib/require-auth";
import { SubscriptionManagement } from "@/components/settings";

export default async function SettingsPage() {
  await checkAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-2">
        <div className="pt-8 pb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Account Settings
          </h1>
        </div>

        <div className="max-w-2xl mx-auto pb-8">
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
}
