"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import { deleteModule, getAllModules } from "@/lib/modules";

const isNativeModule = (module: any) => {
  return module.moduleKind === "native" || module.locked === true;
};

const getSectionLabel = (module: any) => {
  if (module.type === "admin") return "-";

  if (module.section === "workspace") return "My Workspace";

  return "Official Resources";
};

function AdminModulesContent() {
  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchModules = async () => {
    setLoadingModules(true);

    try {
      const data = await getAllModules();
      setModules(data);
    } catch (error) {
      console.error("Failed to load modules:", error);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (module: any) => {
    if (isNativeModule(module)) {
      alert("Native system modules cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${module.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(module.id);
      await deleteModule(module.id);
      await fetchModules();
    } catch (error) {
      console.error("Failed to delete module:", error);
      alert("Failed to delete module. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const customModules = modules.filter((module) => !isNativeModule(module));
  const nativeModules = modules.filter((module) => isNativeModule(module));

  const renderTable = (
    tableModules: any[],
    options?: {
      showDelete?: boolean;
      emptyText?: string;
    }
  ) => {
    const showDelete = options?.showDelete ?? false;

    if (tableModules.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {options?.emptyText || "No modules found."}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1500px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Kind</th>
              <th className="px-4 py-3 font-semibold">Section</th>
              <th className="px-4 py-3 font-semibold">URL / Route</th>
              <th className="px-4 py-3 font-semibold">Embed URL</th>
              <th className="px-4 py-3 font-semibold">Dashboard</th>
              <th className="px-4 py-3 font-semibold">Enabled</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {tableModules.map((module) => (
              <tr key={module.id}>
                <td className="px-4 py-3 text-slate-600">
                  {module.order ?? "-"}
                </td>

                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {module.id}
                </td>

                <td className="px-4 py-3 font-medium text-slate-900">
                  {module.name}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {module.type || "-"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {module.moduleKind || "-"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {getSectionLabel(module)}
                </td>

                <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">
                  {module.href || "-"}
                </td>

                <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">
                  {module.embedUrl || "-"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {module.showOnDashboard ? "Yes" : "No"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {module.enabled ? "Yes" : "No"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/modules/${module.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      Edit
                    </Link>

                    {showDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(module)}
                        disabled={deletingId === module.id}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                      >
                        {deletingId === module.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loadingModules) {
    return <div className="text-slate-500">Loading modules...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Module Management
          </h1>
          <p className="mt-2 text-slate-600">
            Manage custom modules and review native system modules.
          </p>
        </div>

        <Link
          href="/admin/modules/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Create Module
        </Link>
      </div>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Custom Modules
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Modules created from Admin, including external and embedded modules.
          </p>
        </div>

        {renderTable(customModules, {
          showDelete: true,
          emptyText: "No custom modules yet.",
        })}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Native / System Modules
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Built-in modules managed by code. These modules cannot be deleted
            from this page.
          </p>
        </div>

        {renderTable(nativeModules, {
          showDelete: false,
          emptyText: "No native system modules found.",
        })}
      </section>
    </div>
  );
}

export default function AdminModulesPage() {
  return (
    <AdminGuard>
      <AdminModulesContent />
    </AdminGuard>
  );
}