import { MessageCircle, Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
  const whatsappLink = "https://wa.me/8801763636997";
  
  return (
    <footer className="bg-foreground/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">নারীCare</h3>
            <p className="text-muted-foreground">
              Care, comfort, and confidence — every month.
            </p>
          </div>
          
          <div className="flex justify-center gap-6">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-accent" />
            </a>
            <a 
              href="#"
              className="w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-accent" />
            </a>
            <a 
              href="#"
              className="w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-accent" />
            </a>
            <a 
              href="mailto:hello@naricare.com"
              className="w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-accent" />
            </a>
          </div>
          
          <div className="text-sm text-black space-y-2">
            <p>
              <a href="mailto:hello@naricare.com" className="text-black hover:text-accent transition-colors">
                hello@naricare.com
              </a>
            </p>
            <p>© 2025 NariCare — All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
