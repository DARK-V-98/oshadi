'use client';
import MainCategoryManagement from '@/components/admin/MainCategoryManagement';

function MainCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MainCategoryManagement />
    </div>
  );
}

export default function AdminMainCategoriesPage() {
    return (
        <MainCategoriesPage />
    )
}