"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";

const getPageTitle = (pathname: string) => {
  if (pathname === "/dashboard") return "My Workspace";
  if (pathname.startsWith("/modules/")) return "Resource";
  if (pathname === "/admin") return "Admin Dashboard";
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/modules")) return "Module Management";
  if (pathname.startsWith("/admin/courses")) return "Course Management";
  if (pathname.startsWith("/training/level-1")) return "Level 1 Training";
  if (pathname.startsWith("/training")) return "Training";

  return "Lumens Platform";
};

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useUserProfile();
  const [signingIn, setSigningIn] = useState(false);

  const pageTitle = getPageTitle(pathname);

  const handleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);

    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-500">Lumens Platform</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {loading ? (
            <div className="text-sm text-slate-500">Loading user...</div>
          ) : user ? (
            <>
              <div className="text-right text-sm text-slate-700">
                <div>Hi {user.displayName || "there"} 👋</div>
                <div className="text-slate-500">{user.email}</div>
              </div>

              <button
                onClick={logout}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="text-sm text-slate-500">Not signed in</div>

              <button
                onClick={handleLogin}
                disabled={signingIn}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {signingIn ? "Signing in..." : "Login with Google"}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}