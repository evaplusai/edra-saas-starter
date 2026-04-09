import { Hero } from '@/pages/landing/hero';
import { Features } from '@/pages/landing/features';
import { PricingSection } from '@/pages/landing/pricing';
import { Testimonials } from '@/pages/landing/testimonials';
import { CTA } from '@/pages/landing/cta';

export default function LandingIndex() {
  return (
    <>
      <Hero />
      <Features />
      <PricingSection />
      <Testimonials />
      <CTA />
    </>
  );
}
