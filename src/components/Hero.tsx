import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, ShoppingBag } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";
import { useState } from "react";
import OrderDialog from "@/components/OrderDialog";

const Hero = () => {
  const [orderOpen, setOrderOpen] = useState(false);
  const whatsappLink = "https://wa.me/8801763636997?text=Hi! I want to start my monthly NariCare subscription.";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-background z-0" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-6 py-2 bg-primary/20 rounded-full mb-4">
            <p className="text-sm font-medium text-foreground">নারীCare</p>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Your Period,{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              On Time.
            </span>
            <br />
            Every Month.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Subscribe once — we'll deliver your pads discreetly and reliably every month.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              variant="cta"
              className="text-base px-8 py-6 rounded-2xl"
              onClick={() => setOrderOpen(true)}
            >
              <ShoppingBag className="mr-2" />
              Order Now 💕
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 rounded-2xl border-primary/30 hover:bg-primary/10"
              asChild
            >
              <Link to="/login">
                Login to Dashboard
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Already tracking your cycle?{" "}
            <Link to="/period-tracker" className="text-primary hover:underline font-semibold">
              Use our simple tracker
            </Link>
          </p>
        </div>
      </div>

      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </section>
  );
};

export default Hero;
