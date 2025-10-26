import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingWhatsApp = () => {
  const whatsappLink = "https://wa.me/8801763636997?text=Hi! I have a question about NariCare.";
  
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-fade-in"
    >
      <Button
        size="lg"
        variant="cta"
        className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform p-0"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </a>
  );
};

export default FloatingWhatsApp;
