import {
  Header,
  HeroSection,
  FeaturesSection,
  CTASection,
} from "@/components/shared/home";
import { getUserInSession } from "@/features/profile/queries";
import { routes } from "@/routes";
import { redirect } from "next/navigation";

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
        <CTASection />
      </main>
    </div>
  );
}
