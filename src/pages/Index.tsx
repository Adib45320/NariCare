import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import Privacy from "@/components/Privacy";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Pricing />
      <WhyChoose />
      <Testimonials />
      <Privacy />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
};

export default Index;
