import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: {
    default: 'Oshadi Vidarshana | Bridal Makeup Artist & NVQ Beauty Course Notes',
    template: '%s | Oshadi Vidarshana',
  },
  description: 'Official website of Oshadi Vidarshana, a professional bridal makeup artist in Sri Lanka. Discover bridal services and purchase expertly crafted NVQ Level 4 Bridal & Beauty course notes and study materials.',
  keywords: "Oshadi Vidarshana, Bridal Makeup Sri Lanka, NVQ Level 4, Beauty Course Sri Lanka, Bridal Dresser, Makeup Artist, NVQ Notes",
  authors: [{ name: 'M.K.D Oshadi Vidarshana Perera', url: 'https://www.esystemlk.xyz' }],
  creator: 'Oshadi Vidarshana',
  publisher: 'Oshadi Vidarshana',
  generator: 'Next.js',
  applicationName: 'Oshadi Vidarshana',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
