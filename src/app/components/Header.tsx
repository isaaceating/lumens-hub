"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getModuleById } from "@/lib/modules";

const buildStaticBreadcrumbs = (pathname: string) => {
  if (pathname === "/dashboard") {
    return [{ label: "Home", href: "/dashboard" }];
  }

  if (pathname === "/training") {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Training", href: "/training" },
    ];
  }

  if (pathname.startsWith("/training/level-1")) {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Training", href: "/training" },
      { label: "Level 1 Training", href: "/training/level-1" },
    ];
  }

  if (pathname.startsWith("/training")) {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Training", href: "/training" },
    ];
  }

  if (pathname === "/admin") {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Admin", href: "/admin" },
      { label: "Admin Dashboard", href: "/admin" },
    ];
  }

  if (pathname.startsWith("/admin/users")) {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Admin", href: "/admin" },
      { label: "User Management", href: "/admin/users" },
    ];
  }

  if (pathname.startsWith("/admin/modules")) {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Admin", href: "/admin" },
      { label: "Module Management", href: "/admin/modules" },
    ];
  }

  if (pathname.startsWith("/admin/courses")) {
    return [
      { label: "Home", href: "/dashboard" },
      { label: "Admin", href: "/admin" },
      { label: "Course Management", href: "/admin/courses" },
    ];
  }

  return [{ label: "Home", href: "/dashboard" }];
};

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useUserProfile();
  const [signingIn, setSigningIn] = useState(false);
  const [moduleName, setModuleName] = useState("");

  const isModulePage = pathname.startsWith("/modules/");
  const moduleId = isModulePage ? pathname.split("/")[2] : "";

  useEffect(() => {
    const fetchModuleName = async () => {
      if (!moduleId || !user) {
        setModuleName("");
        return;
      }

      try {
        const data = (await getModuleById(moduleId)) as any;
        setModuleName(data?.name || "Resource");
      } catch (error) {
        console.error("Failed to load module name:", error);
        setModuleName("Resource");
      }
    };

    fetchModuleName();
  }, [moduleId, user]);

  const breadcrumbs = isModulePage
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Resources", href: "/dashboard" },
        { label: moduleName || "Resource", href: pathname },
      ]
    : buildStaticBreadcrumbs(pathname);

  const pageTitle =
    breadcrumbs[breadcrumbs.length - 1]?.label || "Lumens Portal";

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
          <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <span
                  key={`${item.href}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 && <span className="text-slate-300">/</span>}

                  {isLast ? (
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  ) : (
                    <Link href={item.href} className="hover:text-blue-700">
                      {item.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>

          <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
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