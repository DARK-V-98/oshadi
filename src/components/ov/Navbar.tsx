
"use client";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useFirestore } from "@/firebase";
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
import { doc, getDoc } from "firebase/firestore";

type NavbarProps = {
  onUnlockClick: () => void;
  onLoginClick: () => void;
};

const Navbar = ({ onUnlockClick, onLoginClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, "users", user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      });
    } else {
      setUserRole(null);
    }
  }, [user, firestore]);

  const navLinks = [
    ...(isHomePage ? [
      { name: "Home", href: "#home" },
      { name: "About", href: "#about" },
      { name: "Services", href: "#services" },
    ] : []),
    { name: "Notes", href: "/notes" },
    ...(isHomePage ? [
      { name: "Testimonials", href: "#testimonials" },
      { name: "Contact", href: "#contact" },
    ] : [])
  ];

  const getHref = (link: {name: string, href: string}) => {
    if (link.href.startsWith('/')) {
        return link.href;
    }
    // If not on home page and link is a hash link, go to home first
    return isHomePage ? link.href : `/${link.href}`;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  }

  const handleBuyNotes = () => {
    const message = encodeURIComponent("Hi! I'm interested in buying the NVQ Level 4 notes. Can you please provide more information?");
    window.open(`https://wa.me/94754420805?text=${message}`, '_blank');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/ov.png" alt="Oshadi Vidarshana Logo" width={40} height={40} className="rounded-full" />
            <span className="font-heading text-xl font-semibold text-foreground hidden sm:block">
              Oshadi Vidarshana
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={getHref(link)}
                className="px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground font-medium transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/notes">
                <BookOpen className="w-4 h-4 mr-2" />
                View Notes
              </Link>
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
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" size="sm" onClick={onLoginClick} className="rounded-full">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full mr-2">
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
                    {userRole === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="hero" size="sm" onClick={onLoginClick} className="rounded-full mr-2">
                  <User className="w-4 h-4" />
                </Button>
              )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={getHref(link)}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-300 py-2"
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/notes" onClick={() => setIsOpen(false)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Notes
                </Link>
              </Button>
               {!user && (
                <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => { onLoginClick(); setIsOpen(false); }}>
                  <User className="w-4 h-4 mr-2" />
                  Login / Sign Up
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
