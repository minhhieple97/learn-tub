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
    <div className="bg-neutral-pearl min-h-screen">
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
