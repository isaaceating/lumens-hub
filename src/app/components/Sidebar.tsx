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

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();

  const [modules, setModules] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/admin"));

  const enabledModules = profile?.enabledModules || [];
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const fetchModules = async () => {
      const data = await getAllModules();
      setModules(data);
    };

    if (!loading && profile) {
      fetchModules();
    }
  }, [loading, profile]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setAdminOpen(true);
    }
  }, [pathname]);

  const visibleModules = loading
    ? []
    : modules.filter((module) => {
        if (module.enabled === false) return false;

        if (module.type === "admin") {
          return isAdmin && enabledModules.includes(module.id);
        }

        return enabledModules.includes(module.id);
      });

  const resourceModules = visibleModules.filter(
    (module) => module.type === "feature"
  );

  const adminModules = visibleModules.filter((module) => module.type === "admin");

  const baseItemClass =
    "flex items-center rounded-lg px-4 py-2 text-sm transition";

  const activeItemClass = "bg-blue-600 text-white";
  const inactiveItemClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

  const renderInternalItem = (
    label: string,
    href: string,
    icon: string,
    exact = false
  ) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    if (collapsed) {
      return (
        <Link
          key={href}
          href={href}
          title={label}
          className={`mb-1 flex items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <span>{icon}</span>
        </Link>
      );
    }

    return (
      <Link
        key={href}
        href={href}
        className={`${baseItemClass} mb-1 gap-3 ${
          isActive ? activeItemClass : inactiveItemClass
        }`}
      >
        <span className="w-5 text-center">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const renderExpandableItem = (
    label: string,
    icon: string,
    isOpen: boolean,
    onClick: () => void,
    isActive = false
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
          className={`mb-1 flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
            isActive ? activeItemClass : inactiveItemClass
          }`}
        >
          <span>{icon}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseItemClass} mb-1 w-full justify-between gap-3 ${
          isActive ? activeItemClass : inactiveItemClass
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="w-5 text-center">{icon}</span>
          <span>{label}</span>
        </span>

        <span className="text-xs">{isOpen ? "▴" : "▾"}</span>
      </button>
    );
  };

  const renderModuleItem = (item: any) => {
    const href = getModuleHref(item);
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    const className = collapsed
      ? `mb-1 flex items-center justify-center rounded-lg px-2 py-2 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`
      : `mb-1 block truncate rounded-lg px-4 py-2 pl-6 text-sm transition ${
          isActive ? activeItemClass : inactiveItemClass
        }`;

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
          {renderInternalItem("Home", "/dashboard", "⌂", true)}

          <div>
            {renderExpandableItem(
              "Resources",
              "▦",
              resourcesOpen,
              () => setResourcesOpen((prev) => !prev),
              resourceModules.some((module) => {
                const href = getModuleHref(module);
                return pathname === href || pathname.startsWith(`${href}/`);
              })
            )}

            {!collapsed && resourcesOpen && (
              <div className="mt-1">
                {resourceModules.length > 0 ? (
                  resourceModules.map(renderModuleItem)
                ) : (
                  <div className="px-8 py-2 text-sm text-slate-500">
                    No resources available.
                  </div>
                )}
              </div>
            )}
          </div>

          {renderInternalItem("My Bookmarks", "/dashboard#bookmarks", "★")}

          {adminModules.length > 0 && (
            <div>
              {renderExpandableItem(
                "Admin",
                "⚙",
                adminOpen,
                () => setAdminOpen((prev) => !prev),
                pathname.startsWith("/admin")
              )}

              {!collapsed && adminOpen && (
                <div className="mt-1">{adminModules.map(renderModuleItem)}</div>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}