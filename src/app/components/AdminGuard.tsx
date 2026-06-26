"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { adminModuleLabels, canAccessAdminModule, type AdminModuleKey } from "@/lib/adminPermissions";

type AdminGuardProps = {
  children: React.ReactNode;
  module?: AdminModuleKey;
};

export default function AdminGuard({ children, module }: AdminGuardProps) {
  const { user, profile, loading } = useUserProfile();
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);

    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Checking permission...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login required</h1>
        <p className="mt-3 text-slate-600">
          Please sign in with an authorized Google account to access this page.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {signingIn ? "Signing in..." : "Login with Google"}
        </button>
      </div>
    );
  }

  if (!canAccessAdminModule(profile, module)) {
    const moduleLabel = module ? adminModuleLabels[module] : "Admin";

    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">
          {moduleLabel} access required
        </h1>
        <p className="mt-3 text-red-700">
          Your account does not have permission to access this admin page.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
