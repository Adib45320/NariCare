import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Nusrat A.",
    location: "Dhaka",
    text: "No more awkward shop runs! NariCare makes it so easy and private.",
    rating: 5
  },
  {
    name: "Farah K.",
    location: "Chittagong",
    text: "Super easy to use — I love how private it feels. Always on time!",
    rating: 5
  },
  {
    name: "Lamia R.",
    location: "Sylhet",
    text: "Affordable and consistent. It's one less thing to worry about every month.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            What Women Are Saying
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by hundreds of women across Bangladesh
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 bg-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300 border-none"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
              
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
