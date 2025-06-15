import { redirect } from "next/navigation";
import { routes } from "@/routes";
import {
  Header,
  HeroSection,
  FeaturesSection,
  PricingSection,
  CTASection,
} from "@/components/shared/home";
import { getUserInSession } from "@/features/profile/queries";

export default async function LandingPage() {
  const user = await getUserInSession();
  if (user) {
    redirect(routes.learn);
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20 min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
}
