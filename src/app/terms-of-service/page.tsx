
"use client";

import { useState } from "react";
import Head from 'next/head';
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";

const TermsOfServicePage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Terms of Service | Oshadi Vidarshana</title>
      </Head>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-8">Terms of Service</h1>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <h2 className="font-heading text-2xl text-foreground">1. Agreement to Terms</h2>
              <p>By accessing our website and purchasing our digital products (notes, assignments), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website or services.</p>

              <h2 className="font-heading text-2xl text-foreground">2. User Accounts</h2>
              <p>To access certain features, such as downloading purchased content, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate. You are responsible for safeguarding your password.</p>

              <h2 className="font-heading text-2xl text-foreground">3. Digital Products</h2>
              <p>We sell digital educational materials ("notes", "assignments"). These products are delivered via a one-time use access key.</p>
              <ul>
                <li><strong>Access Keys:</strong> Each key is for a single user and is intended for a single content unlock. Sharing or reselling keys is strictly prohibited.</li>
                <li><strong>One-Time Download:</strong> Access to download the PDF file is granted once per unlocked item. You are responsible for securely saving your downloaded file. We are not obligated to provide a replacement download if you lose your file.</li>
                <li><strong>Intellectual Property:</strong> All digital products are the intellectual property of M.K.D Oshadi Vidarshana Perera. The content is for your personal, non-commercial use only. You may not distribute, share, reproduce, or resell the content in any form.</li>
              </ul>

              <h2 className="font-heading text-2xl text-foreground">4. Refund Policy</h2>
              <p>Due to the digital nature of our products, all sales are final. We do not offer refunds once an access key has been purchased or used. If you experience technical issues with a download, please contact support for assistance.</p>
              
              <h2 className="font-heading text-2xl text-foreground">5. User Conduct</h2>
              <p>You agree not to use the website or its content for any unlawful purpose. You are prohibited from violating or attempting to violate the security of the website.</p>

              <h2 className="font-heading text-2xl text-foreground">6. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of the website after such changes constitutes your acceptance of the new terms.</p>

              <h2 className="font-heading text-2xl text-foreground">7. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us.</p>
            </div>
          </div>
        </main>
        <Footer />
        <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      </div>
    </>
  );
};

export default TermsOfServicePage;
