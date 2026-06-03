"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";

const protectedPrefixes = ["/training", "/modules", "/admin"];

const isProtectedPath = (pathname: string) => {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
};

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useUserProfile();
  const [signingIn, setSigningIn] = useState(false);

  const protectedPage = isProtectedPath(pathname);

  const handleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);

    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  if (!protectedPage) {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Checking access...</div>;
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

  return <>{children}</>;
}