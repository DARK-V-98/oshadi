
"use client";

import { useState } from "react";
import Head from 'next/head';
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";

const PrivacyPolicyPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Privacy Policy | Oshadi Vidarshana</title>
      </Head>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-grow pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-8">Privacy Policy</h1>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <h2 className="font-heading text-2xl text-foreground">1. Introduction</h2>
              <p>Welcome to Oshadi Vidarshana's website ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>

              <h2 className="font-heading text-2xl text-foreground">2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul>
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register for an account or when you choose to participate in various activities related to the Site, such as submitting testimonials.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, and your access times.</li>
              </ul>

              <h2 className="font-heading text-2xl text-foreground">3. Use of Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
              <ul>
                <li>Create and manage your account.</li>
                <li>Process your transactions and deliver the digital products you have purchased.</li>
                <li>Communicate with you regarding your account or orders.</li>
                <li>Request feedback and contact you about your use of the Site.</li>
                <li>Display user testimonials on the website after your approval.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              </ul>

              <h2 className="font-heading text-2xl text-foreground">4. Disclosure of Your Information</h2>
              <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes.</p>

              <h2 className="font-heading text-2xl text-foreground">5. Security of Your Information</h2>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

              <h2 className="font-heading text-2xl text-foreground">6. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us via the contact details provided on our website.</p>
            </div>
          </div>
        </main>
        <Footer />
        <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
