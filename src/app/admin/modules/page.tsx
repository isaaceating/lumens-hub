"use client";

import AdminGuard from "@/app/components/AdminGuard";
import { modules } from "@/app/config/modules";

export default function AdminModulesPage() {
  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Module Management
          </h1>
          <p className="mt-2 text-slate-600">
            View registered Lumens HUB modules.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Dashboard</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => (
                <tr key={module.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {module.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {module.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {module.type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {module.href}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {module.showOnDashboard ? "Yes" : "No"}
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