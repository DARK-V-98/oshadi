"use client";
import { useState } from "react";
import { Menu, X, BookOpen, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import Link from "next/link";

type NavbarProps = {
  onUnlockClick: () => void;
};

const Navbar = ({ onUnlockClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <span className="font-heading text-lg font-bold text-primary-foreground">OV</span>
            </div>
            <span className="font-heading text-xl font-semibold text-foreground hidden sm:block">
              Oshadi Vidarshana
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
            <Button variant="outline" size="sm" onClick={onUnlockClick}>
              <BookOpen className="w-4 h-4" />
              Unlock Notes
            </Button>
            {user ? (
               <Button asChild variant="hero" size="sm">
                <Link href="/admin">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="hero" size="sm">
                <Link href="/signin">
                  <User className="w-4 h-4" />
                  Admin
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-300 py-2"
                >
                  {link.name}
                </a>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => { onUnlockClick(); setIsOpen(false); }}>
                <BookOpen className="w-4 h-4" />
                Unlock Notes
              </Button>
               {user ? (
                <Button asChild variant="hero" size="sm" className="w-full mt-2">
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="sm" className="w-full mt-2">
                  <Link href="/signin" onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;