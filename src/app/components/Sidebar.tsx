"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Home,
  HouseHeart,
  MonitorSmartphone,
  Newspaper,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
};

const adminNavItems = [
  {
    id: "admin-home",
    name: "Admin Home",
    href: "/admin",
    icon: Shield,
  },
  {
    id: "admin-training",
    name: "Training",
    href: "/admin/training",
    icon: GraduationCap,
  },
  {
    id: "admin-news",
    name: "News",
    href: "/admin/news",
    icon: Newspaper,
  },
  {
    id: "admin-modules",
    name: "Modules",
    href: "/admin/modules",
    icon: Boxes,
  },
  {
    id: "admin-users",
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();

  const [modules, setModules] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [workspacesOpen, setWorkspacesOpen] = useState(
    pathname.startsWith("/modules")
  );
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/admin"));
  const [currentHash, setCurrentHash] = useState("");

  const enabledModules = profile?.enabledModules || [];
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== "undefined") {
        setCurrentHash(window.location.hash);
      }
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);
    }

    if (pathname.startsWith("/admin")) {
      setAdminOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const fetchModules = async () => {
      const data = await getAllModules();
      setModules(data);
    };

    if (!loading && profile) {
      fetchModules();
    }
  }, [loading, profile]);

  const visibleModules = loading
    ? []
    : modules.filter((module) => {
        if (module.enabled === false) return false;

        if (module.type === "admin") {
          return false;
        }

        return enabledModules.includes(module.id);
      });

  const featureModules = visibleModules.filter(
    (module) => module.type === "feature"
  );

  const workspaceModules = featureModules.filter(
    (module) => module.section === "workspace"
  );

  const resourceModules = featureModules.filter(
    (module) => module.section !== "workspace"
  );

  useEffect(() => {
    if (!pathname.startsWith("/modules") && !pathname.startsWith("/training")) {
      return;
    }

    const activeModule = featureModules.find((module) => {
      const href = getModuleHref(module);
      return pathname === href || pathname.startsWith(`${href}/`);
    });

    if (!activeModule) return;

    if (activeModule.section === "workspace") {
      setWorkspacesOpen(true);
    } else {
      setResourcesOpen(true);
    }
  }, [pathname, featureModules]);

  const baseItemClass =
    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition";
  const activeItemClass =
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/30";
  const inactiveItemClass =
    "text-slate-300 hover:bg-slate-800/80 hover:text-white";
  const parentItemClass =
    "text-slate-300 hover:bg-slate-800/80 hover:text-white";

  const goToBookmarks = () => {
    if (typeof window === "undefined") return;

    if (window.location.pathname === "/dashboard") {
      const target = document.getElementById("bookmarks");

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      window.history.replaceState(null, "", "/dashboard#bookmarks");
      setCurrentHash("#bookmarks");
      return;
    }

    window.location.href = "/dashboard#bookmarks";
  };

  const renderHomeItem = () => {
    const isActive = pathname === "/dashboard" && currentHash !== "#bookmarks";

    if (collapsed) {
      return (
        <Link
          href="/dashboard"
          title="Home"
          onClick={() => setCurrentHash("")}
          className={`mb-1 flex items-center justify-center rounded-xl px-2 py-2.5 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <Home size={18} strokeWidth={2.1} />
        </Link>
      );
    }

    return (
      <Link
        href="/dashboard"
        onClick={() => setCurrentHash("")}
        className={`${baseItemClass} mb-1 gap-3 ${
          isActive ? activeItemClass : inactiveItemClass
        }`}
      >
        <Home size={18} strokeWidth={2.1} />
        <span>Home</span>
      </Link>
    );
  };

  const renderBookmarkItem = () => {
    const isActive = pathname === "/dashboard" && currentHash === "#bookmarks";

    if (collapsed) {
      return (
        <button
          type="button"
          onClick={goToBookmarks}
          title="My Bookmarks"
          className={`mb-1 flex w-full items-center justify-center rounded-xl px-2 py-2.5 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <ExternalLink size={18} strokeWidth={2.1} />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={goToBookmarks}
        className={`${baseItemClass} mb-1 w-full gap-3 ${
          isActive ? activeItemClass : inactiveItemClass
        }`}
      >
        <ExternalLink size={18} strokeWidth={2.1} />
        <span>My Bookmarks</span>
      </button>
    );
  };

  const renderExpandableItem = (
    label: string,
    Icon: React.ElementType,
    isOpen: boolean,
    onClick: () => void
  ) => {
    if (collapsed) {
      return (
        <button
          type="button"
          onClick={() => {
            setCollapsed(false);
            onClick();
          }}
          title={label}
          className={`mb-1 flex w-full items-center justify-center rounded-xl px-2 py-2.5 text-sm transition ${parentItemClass}`}
        >
          <Icon size={18} strokeWidth={2.1} />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseItemClass} mb-1 w-full justify-between gap-3 ${parentItemClass}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon size={18} strokeWidth={2.1} />
          <span>{label}</span>
        </span>

        {isOpen ? (
          <ChevronUp size={15} strokeWidth={2.1} />
        ) : (
          <ChevronDown size={15} strokeWidth={2.1} />
        )}
      </button>
    );
  };

  const renderModuleItem = (
    item: any,
    options?: {
      compact?: boolean;
      exact?: boolean;
    }
  ) => {
    const href = getModuleHref(item);
    const exact = options?.exact ?? false;

    const isActive = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

    const className = collapsed
      ? `mb-1 flex items-center justify-center rounded-xl px-2 py-2.5 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`
      : `mb-1 flex items-center gap-3 truncate rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          options?.compact ? "pl-9" : "pl-6"
        } ${isActive ? activeItemClass : inactiveItemClass}`;

    if (item.moduleKind === "external") {
      return (
        <a
          key={item.id}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
          className={className}
        >
          {collapsed ? (
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          ) : (
            <>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
              <span className="truncate">{item.name}</span>
            </>
          )}
        </a>
      );
    }

    return (
      <Link key={item.id} href={href} title={item.name} className={className}>
        {collapsed ? (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        ) : (
          <>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span className="truncate">{item.name}</span>
          </>
        )}
      </Link>
    );
  };

  const renderAdminItem = (item: {
    id: string;
    name: string;
    href: string;
    icon: React.ElementType;
  }) => {
    const Icon = item.icon;

    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    const className = collapsed
      ? `mb-1 flex items-center justify-center rounded-xl px-2 py-2.5 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`
      : `mb-1 flex items-center gap-3 truncate rounded-xl px-3 py-2.5 pl-9 text-sm font-medium transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`;

    return (
      <Link key={item.id} href={item.href} title={item.name} className={className}>
        <Icon size={17} strokeWidth={2.1} />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`flex min-h-screen flex-col border-r border-slate-800/80 bg-slate-950 text-white transition-all duration-200 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <div
        className={`border-b border-slate-800/90 ${
          collapsed ? "px-3 py-5" : "px-5 py-5"
        }`}
      >
        {collapsed ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-500 hover:to-blue-400"
            >
              <ChevronRight size={20} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-950/30">
                  <HouseHeart size={20} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-white">
                    <span className="block">Lumens</span>
                    <span className="block">Portal</span>
                  </h1>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="mt-1 shrink-0 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <ChevronLeft size={18} strokeWidth={2.1} />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {renderHomeItem()}

          <div className="pt-1">
            {renderExpandableItem(
              "Workspaces",
              MonitorSmartphone,
              workspacesOpen,
              () => setWorkspacesOpen((prev) => !prev)
            )}

            {!collapsed && workspacesOpen && (
              <div className="mt-1">
                {workspaceModules.length > 0 ? (
                  workspaceModules.map((module) =>
                    renderModuleItem(module, { compact: true })
                  )
                ) : (
                  <div className="px-9 py-2 text-sm text-slate-500">
                    No workspaces available.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {renderExpandableItem("Resources", BookOpenCheck, resourcesOpen, () =>
              setResourcesOpen((prev) => !prev)
            )}

            {!collapsed && resourcesOpen && (
              <div className="mt-1">
                {resourceModules.length > 0 ? (
                  resourceModules.map((module) =>
                    renderModuleItem(module, { compact: true })
                  )
                ) : (
                  <div className="px-9 py-2 text-sm text-slate-500">
                    No resources available.
                  </div>
                )}
              </div>
            )}
          </div>

          {renderBookmarkItem()}

          {isAdmin && (
            <div className="pt-3">
              {!collapsed && (
                <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Admin
                </div>
              )}

              {renderExpandableItem("Admin", Settings, adminOpen, () =>
                setAdminOpen((prev) => !prev)
              )}

              {!collapsed && adminOpen && (
                <div className="mt-1">
                  {adminNavItems.map((item) => renderAdminItem(item))}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}