
'use client';
import { useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/ov/Navbar';
import Footer from '@/components/ov/Footer';
import AuthForm from '@/components/AuthForm';
import NotesList from '@/components/ov/NotesList';

const NotesPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>NVQ Level 4 Notes for Bridal & Beauty Course | Oshadi Vidarshana</title>
        <meta
          name="description"
          content="Browse and purchase the complete collection of NVQ Level 4 Bridal & Beauty notes. Covers all units including theory, practicals, and assignments for your exam success in Sri Lanka."
        />
      </Head>
      <div className="min-h-screen bg-background flex flex-col">
          <Navbar onUnlockClick={() => setIsAuthModalOpen(true)} onLoginClick={() => setIsAuthModalOpen(true)} />
          <main className="flex-grow pt-20">
              <NotesList />
          </main>
          <Footer />
          <AuthForm open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      </div>
    </>
  );
};

export default NotesPage;
