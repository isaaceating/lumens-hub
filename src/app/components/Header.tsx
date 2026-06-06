"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getModuleById } from "@/lib/modules";
import { getTrainingProgramById } from "@/lib/training";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type HeaderMeta = {
  section: string;
  breadcrumbs: BreadcrumbItem[];
};

const decodeSegment = (value?: string) => {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const toTitleCase = (value: string) => {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useUserProfile();
  const [signingIn, setSigningIn] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [trainingProgramName, setTrainingProgramName] = useState("");

  const pathSegments = useMemo(() => {
    return pathname.split("/").filter(Boolean);
  }, [pathname]);

  const isModulePage = pathname.startsWith("/modules/");
  const moduleId = isModulePage ? pathSegments[1] : "";

  const isTrainingPage = pathname.startsWith("/training/");
  const trainingProgramId = isTrainingPage ? pathSegments[1] : "";
  const isLessonPage =
    isTrainingPage && pathSegments[2] === "lessons" && Boolean(pathSegments[3]);

  useEffect(() => {
    const fetchModuleName = async () => {
      if (!moduleId || !user) {
        setModuleName("");
        return;
      }

      try {
        const data = (await getModuleById(moduleId)) as any;
        setModuleName(data?.name || toTitleCase(moduleId));
      } catch (error) {
        console.error("Failed to load module name:", error);
        setModuleName(toTitleCase(moduleId));
      }
    };

    fetchModuleName();
  }, [moduleId, user]);

  useEffect(() => {
    const fetchTrainingProgramName = async () => {
      if (!trainingProgramId || !user) {
        setTrainingProgramName("");
        return;
      }

      try {
        const data = await getTrainingProgramById(trainingProgramId);
        setTrainingProgramName(data?.title || toTitleCase(trainingProgramId));
      } catch (error) {
        console.error("Failed to load training program name:", error);
        setTrainingProgramName(toTitleCase(trainingProgramId));
      }
    };

    fetchTrainingProgramName();
  }, [trainingProgramId, user]);

  const headerMeta: HeaderMeta = useMemo(() => {
    if (pathname === "/dashboard") {
      return {
        section: "Lumens Portal",
        breadcrumbs: [{ label: "Home", href: "/dashboard" }],
      };
    }

    if (isModulePage) {
      const title = moduleName || toTitleCase(moduleId) || "Resource";

      return {
        section: "Official Resource",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Resources", href: "/dashboard" },
          { label: title, href: pathname },
        ],
      };
    }

    if (isTrainingPage) {
      const programTitle =
        trainingProgramName || toTitleCase(trainingProgramId) || "Training";

      if (isLessonPage) {
        return {
          section: "Training",
          breadcrumbs: [
            { label: "Home", href: "/dashboard" },
            { label: programTitle, href: `/training/${trainingProgramId}` },
            { label: "Lesson", href: pathname },
          ],
        };
      }

      return {
        section: "Training",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: programTitle, href: pathname },
        ],
      };
    }

    if (pathname === "/admin") {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Admin Dashboard", href: "/admin" },
        ],
      };
    }

    if (pathname === "/admin/training") {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Training Management", href: "/admin/training" },
        ],
      };
    }

    if (pathname === "/admin/training/new") {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Training Management", href: "/admin/training" },
          { label: "New Program", href: pathname },
        ],
      };
    }

    if (pathname.startsWith("/admin/training/")) {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Training Management", href: "/admin/training" },
          { label: "Edit Program", href: pathname },
        ],
      };
    }

    if (pathname.startsWith("/admin/users")) {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "User Management", href: "/admin/users" },
        ],
      };
    }

    if (pathname.startsWith("/admin/modules")) {
      return {
        section: "Admin",
        breadcrumbs: [
          { label: "Home", href: "/dashboard" },
          { label: "Module Management", href: "/admin/modules" },
        ],
      };
    }

    const fallbackTitle = pathSegments.length
      ? toTitleCase(decodeSegment(pathSegments[pathSegments.length - 1]))
      : "Lumens Portal";

    return {
      section: "Lumens Portal",
      breadcrumbs: [
        { label: "Home", href: "/dashboard" },
        { label: fallbackTitle, href: pathname },
      ],
    };
  }, [
    pathname,
    pathSegments,
    isModulePage,
    moduleName,
    moduleId,
    isTrainingPage,
    trainingProgramName,
    trainingProgramId,
    isLessonPage,
  ]);

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
    <header className="border-b border-slate-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {headerMeta.section}
          </span>

          <nav className="flex min-w-0 flex-wrap items-center gap-1 text-sm text-slate-500">
            {headerMeta.breadcrumbs.map((item, index) => {
              const isLast = index === headerMeta.breadcrumbs.length - 1;

              return (
                <span
                  key={`${item.href}-${index}`}
                  className="flex min-w-0 items-center gap-1"
                >
                  {index > 0 && <span className="text-slate-300">/</span>}

                  {isLast ? (
                    <span className="max-w-[280px] truncate font-semibold text-slate-800">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="max-w-[220px] truncate hover:text-blue-700"
                    >
                      {item.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
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