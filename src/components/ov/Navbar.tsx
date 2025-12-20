
"use client";
import { useState } from "react";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


type NavbarProps = {
  onUnlockClick: () => void;
  onLoginClick: () => void;
};

const Navbar = ({ onUnlockClick, onLoginClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Units", href: "#units" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <Image src="/ov.png" alt="Oshadi Vidarshana Logo" width={40} height={40} className="rounded-full" />
            <span className="font-heading text-xl font-semibold text-foreground hidden sm:block">
              Oshadi Vidarshana
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground font-medium transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
            <Button variant="outline" size="sm" onClick={onUnlockClick}>
              <BookOpen className="w-4 h-4" />
              Unlock Notes
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" size="sm" onClick={onLoginClick}>
                <User className="w-4 h-4" />
                Login
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
                <>
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </Button>
                   <Button variant="hero" size="sm" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => { onLoginClick(); setIsOpen(false); }}>
                  <User className="w-4 h-4" />
                  Login
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
