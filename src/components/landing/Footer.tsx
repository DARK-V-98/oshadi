import Link from "next/link"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bridal & Beauty. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6 text-sm">
          <Link href="#overview" className="transition-colors hover:text-primary">
            Overview
          </Link>
          <Link href="#features" className="transition-colors hover:text-primary">
            Features
          </Link>
          <Link href="#units" className="transition-colors hover:text-primary">
            Unit List
          </Link>
          <Link href="#contact" className="transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
