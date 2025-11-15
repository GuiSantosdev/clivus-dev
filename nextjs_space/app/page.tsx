
import { HeroSection } from "@/components/hero-section";
import { ProblemSection } from "@/components/problem-section";
import { SolutionSection } from "@/components/solution-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { OfferSection } from "@/components/offer-section";
import { FaqSection } from "@/components/faq-section";
import { LeadForm } from "@/components/lead-form";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <OfferSection />
      <FaqSection />
      <LeadForm />
      <Footer />
    </main>
  );
}
