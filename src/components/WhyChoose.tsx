import { Package, Clock, MessageCircle, Heart } from "lucide-react";

const benefits = [
  {
    icon: Package,
    emoji: "📦",
    title: "Discreet plain packaging",
    description: "Your privacy matters to us"
  },
  {
    icon: Clock,
    emoji: "⏰",
    title: "Always on time",
    description: "Never run out unexpectedly"
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Flexible schedule & payment",
    description: "Pause, skip, or modify anytime"
  },
  {
    icon: Heart,
    emoji: "💗",
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
              className="flex flex-col items-center justify-center text-center p-4 bg-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300"
            >
              <div className="w-full flex items-center justify-center mb-2">
                <div className="text-7xl">{benefit.emoji}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="font-semibold text-xl mb-2 w-full text-center">{benefit.title}</h3>
              <p className="text-muted-foreground text-base w-full text-center">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
