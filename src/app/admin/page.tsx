'use client';
import AdminUnitList from '@/components/admin/AdminUnitList';

function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminUnitList />
    </div>
  );
}

export default function AdminPage() {
    return (
        <AdminDashboard />
    )
}
