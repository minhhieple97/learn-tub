import { PricingPlans } from '@/components/pricing-plans';
import { checkAuth } from '@/lib/require-auth';

export default async function SettingsPage() {
  await checkAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="pt-12 pb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your subscription and unlock powerful AI-driven learning features
          </p>
        </div>

        <PricingPlans />
      </div>
    </div>
  );
}
