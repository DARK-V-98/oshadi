'use client';
import AuthGuard from '@/components/AuthGuard';
import AdminUnitList from '@/components/admin/AdminUnitList';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users } from 'lucide-react';

function AdminDashboard() {
  const { signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
            <Button asChild variant="outline">
                <Link href="/admin/users">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                </Link>
            </Button>
            <Button onClick={signOut} variant="destructive">Sign Out</Button>
        </div>
      </div>
      <AdminUnitList />
    </div>
  );
}

export default function AdminPage() {
    return (
        <AuthGuard adminOnly={true}>
            <AdminDashboard />
        </AuthGuard>
    )
}
