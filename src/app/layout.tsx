import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: {
    default: 'Oshadi Vidarshana | NVQ Level 4 Bridal & Beauty Notes Sri Lanka',
    template: '%s | Oshadi Vidarshana',
  },
  description: 'Expertly crafted NVQ Level 4 Bridal & Beauty course notes and study materials by Oshadi Vidarshana. Your complete resource for exam preparation in Sri Lanka. Unlock theory notes, practical guides, and assignments.',
  keywords: "NVQ Level 4, Bridal Notes, Beauty Course Sri Lanka, Oshadi Vidarshana, NVQ Notes, Exam Preparation, Study Materials, Beautician Course, Bridal Dresser",
  authors: [{ name: 'M.K.D Oshadi Vidarshana Perera' }],
  creator: 'Oshadi Vidarshana',
  publisher: 'Oshadi Vidarshana',
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
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
