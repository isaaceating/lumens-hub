"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  },
  {
    id: "admin-training",
    name: "Training",
    href: "/admin/training",
  },
  {
    id: "admin-modules",
    name: "Modules",
    href: "/admin/modules",
  },
  {
    id: "admin-users",
    name: "Users",
    href: "/admin/users",
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
    "flex items-center rounded-lg px-4 py-2 text-sm transition";

  const activeItemClass = "bg-blue-600 text-white";
  const inactiveItemClass = "text-slate-300 hover:bg-slate-800 hover:text-white";
  const parentItemClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

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
          className={`mb-1 flex items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <span>⌂</span>
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
        <span className="w-5 text-center">⌂</span>
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
          className={`mb-1 flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <span>★</span>
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
        <span className="w-5 text-center">★</span>
        <span>My Bookmarks</span>
      </button>
    );
  };

  const renderExpandableItem = (
    label: string,
    icon: string,
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
          className={`mb-1 flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm transition ${parentItemClass}`}
        >
          <span>{icon}</span>
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
          <span className="w-5 text-center">{icon}</span>
          <span>{label}</span>
        </span>

        <span className="text-xs">{isOpen ? "▴" : "▾"}</span>
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
      ? `mb-1 flex items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`
      : `mb-1 block truncate rounded-lg px-4 py-2 text-sm transition ${
          options?.compact ? "pl-8" : "pl-6"
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
          {collapsed ? "•" : item.name}
        </a>
      );
    }

    return (
      <Link key={item.id} href={href} title={item.name} className={className}>
        {collapsed ? "•" : item.name}
      </Link>
    );
  };

  const renderAdminItem = (item: { id: string; name: string; href: string }) => {
    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    const className = collapsed
      ? `mb-1 flex items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`
      : `mb-1 block truncate rounded-lg px-4 py-2 pl-8 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`;

    return (
      <Link key={item.id} href={item.href} title={item.name} className={className}>
        {collapsed ? "•" : item.name}
      </Link>
    );
  };

  return (
    <aside
      className={`flex min-h-screen flex-col bg-slate-950 text-white transition-all duration-200 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <div
        className={`border-b border-slate-800 ${
          collapsed ? "px-3 py-5" : "px-5 py-5"
        }`}
      >
        {collapsed ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold hover:bg-blue-500"
            >
              »
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">Lumens Portal</h1>
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              «
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {renderHomeItem()}

          <div>
            {renderExpandableItem("Workspaces", "◈", workspacesOpen, () =>
              setWorkspacesOpen((prev) => !prev)
            )}

            {!collapsed && workspacesOpen && (
              <div className="mt-1">
                {workspaceModules.length > 0 ? (
                  workspaceModules.map((module) =>
                    renderModuleItem(module, { compact: true })
                  )
                ) : (
                  <div className="px-8 py-2 text-sm text-slate-500">
                    No workspaces available.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {renderExpandableItem("Resources", "▦", resourcesOpen, () =>
              setResourcesOpen((prev) => !prev)
            )}

            {!collapsed && resourcesOpen && (
              <div className="mt-1">
                {resourceModules.length > 0 ? (
                  resourceModules.map((module) =>
                    renderModuleItem(module, { compact: true })
                  )
                ) : (
                  <div className="px-8 py-2 text-sm text-slate-500">
                    No resources available.
                  </div>
                )}
              </div>
            )}
          </div>

          {renderBookmarkItem()}

          {isAdmin && (
            <div>
              {renderExpandableItem("Admin", "⚙", adminOpen, () =>
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