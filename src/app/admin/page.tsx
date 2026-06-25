"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";

function AdminHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
      Opening User Management...
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminHomeRedirect />
    </AdminGuard>
  );
}
