
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NotesPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the notes section on the homepage
    router.replace('/#notes');
  }, [router]);

  // Render a loading state or null while redirecting
  return null;
};

export default NotesPage;
