import { Package, Calendar, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Choose your brand",
    description: "Senora, Whisper, Joya, etc."
  },
  {
    icon: Calendar,
    title: "Pick quantity & date",
    description: "Customize your delivery schedule"
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    description: "bKash, Nagad, or Cash on Delivery"
  },
  {
    icon: Truck,
    title: "Receive every month",
    description: "Discreet delivery, always on time"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to never worry about running out again
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative flex flex-col items-center text-center p-6 bg-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mt-2">
                <step.icon className="w-8 h-8 text-accent" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
