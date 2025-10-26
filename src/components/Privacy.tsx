import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <section className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Privacy & Trust
          </h2>
          
          <p className="text-white/90 text-lg leading-relaxed">
            We believe every woman deserves comfort, care, and confidence — without judgment or inconvenience. 
            NariCare keeps your deliveries private and your experience effortless.
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4 justify-center text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Discreet packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Privacy guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
