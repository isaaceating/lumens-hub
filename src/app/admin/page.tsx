"use client";

import AdminGuard from "@/app/components/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
    </AdminGuard>
  );
}