import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = "+94754420805";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}`;

  return (
    <footer className="py-8 bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <Image src="/ov.png" alt="Oshadi Vidarshana Logo" width={32} height={32} className="rounded-full" />
            <div>
              <p>
                © {currentYear} Oshadi Vidarshana. All rights reserved.
              </p>
            </div>
          </div>

          {/* Contact and Powered by */}
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2">
             <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4"/>
                <span>Phone: {whatsappNumber}</span>
            </a>
            <span className="hidden sm:inline">|</span>
            <span>
                Powered by{" "}
                <a
                href="https://www.esystemlk.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                >
                esystemlk
                </a>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
