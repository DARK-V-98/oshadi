"use client"

import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type HeaderProps = {
  onUnlockClick: () => void;
};

export default function Header({ onUnlockClick }: HeaderProps) {
  const navLinks = [
    { name: "Overview", href: "#overview" },
    { name: "What You Get", href: "#features" },
    { name: "Unit List", href: "#units" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline inline-block">Bridal & Beauty</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="relative hidden lg:block w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search content..." className="pl-9" />
          </div>
          <Button variant="ghost" onClick={onUnlockClick}>Unlock PDF</Button>
          <Button>Buy Notes</Button>
        </div>
      </div>
    </header>
  )
}
