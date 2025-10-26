import { Package, Clock, MessageCircle, Heart } from "lucide-react";

const benefits = [
  {
    icon: Package,
    title: "Discreet plain packaging",
    description: "Your privacy matters to us"
  },
  {
    icon: Clock,
    title: "Always on time",
    description: "Never run out unexpectedly"
  },
  {
    icon: MessageCircle,
    title: "Flexible schedule & payment",
    description: "Pause, skip, or modify anytime"
  },
  {
    icon: Heart,
    title: "Trusted brands only",
    description: "Quality products you can rely on"
  }
];

const WhyChoose = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Why Choose NariCare
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Care, comfort, and confidence — delivered monthly
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 bg-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-4">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
