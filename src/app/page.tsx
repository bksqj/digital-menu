import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductDemo } from "@/components/landing/product-demo";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MenuShowcase } from "@/components/landing/menu-showcase";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex-1 bg-[var(--color-canvas)]">
      <Navbar />
      <main>
        <Hero />
        <ProductDemo />
        <HowItWorks />
        <MenuShowcase />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
