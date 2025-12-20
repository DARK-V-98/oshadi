'use client';
import AuthGuard from '@/components/AuthGuard';
import UnitList from '@/components/ov/UnitList';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

function AdminDashboard() {
  const { signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
        <Button onClick={signOut} variant="outline">Sign Out</Button>
      </div>
      <UnitList />
    </div>
  );
}

export default function AdminPage() {
    return (
        <AuthGuard>
            <AdminDashboard />
        </AuthGuard>
    )
}