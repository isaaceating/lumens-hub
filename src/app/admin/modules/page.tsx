"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import { deleteModule, getAllModules } from "@/lib/modules";

export default function AdminModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchModules = async () => {
    const data = await getAllModules();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (module: any) => {
    if (module.locked) {
      alert("This is a locked system module and cannot be deleted.");
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

  return (
    <AdminGuard>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Module Management
            </h1>
            <p className="mt-2 text-slate-600">
              Manage registered Lumens HUB modules.
            </p>
          </div>

          <Link
            href="/admin/modules/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Create Module
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Kind</th>
                <th className="px-4 py-3 font-semibold">Route / URL</th>
                <th className="px-4 py-3 font-semibold">Dashboard</th>
                <th className="px-4 py-3 font-semibold">Enabled</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => (
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

                  <td className="px-4 py-3 text-slate-600">{module.type}</td>

                  <td className="px-4 py-3 text-slate-600">
                    {module.moduleKind}
                  </td>

                  <td className="px-4 py-3 text-slate-600">{module.href}</td>

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

                      <button
                        type="button"
                        onClick={() => handleDelete(module)}
                        disabled={deletingId === module.id || module.locked}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                      >
                        {deletingId === module.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}