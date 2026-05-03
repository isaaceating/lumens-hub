"use client";

import { useUserProfile } from "@/lib/useUserProfile";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return <div className="text-slate-500">Checking permission...</div>;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        You do not have permission to access this page.
      </div>
    );
  }

  return <>{children}</>;
}