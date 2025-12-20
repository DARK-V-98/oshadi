"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/ov/Navbar";
import Footer from "@/components/ov/Footer";
import AuthForm from "@/components/AuthForm";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthGuard>
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
            <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
    </AuthGuard>
  );
}
