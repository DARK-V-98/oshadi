'use client';
import AdminUnitManagement from '@/components/admin/AdminUnitManagement';

function UnitsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminUnitManagement />
    </div>
  );
}

export default function AdminUnitsPage() {
    return (
        <UnitsPage />
    )
}
