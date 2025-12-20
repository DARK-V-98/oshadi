
'use client';
import AuthGuard from '@/components/AuthGuard';
import UserManagementList from '@/components/admin/UserManagementList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function UsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
         <div>
            <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-heading mt-4">User Management</h1>
            <p className="text-muted-foreground">View and manage user roles.</p>
         </div>
      </div>
      <UserManagementList />
    </div>
  );
}

export default function AdminUsersPage() {
    return (
        <AuthGuard adminOnly={true}>
            <UsersPage />
        </AuthGuard>
    )
}
