"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import { getAllUsers } from "@/lib/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="mt-2 text-slate-600">
            View users and open the detail page to manage access.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Modules</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {user.name || "No Name"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3 text-slate-600">{user.region}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {(user.enabledModules || []).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.uid}`}
                      className="text-blue-700 hover:underline"
                    >
                      Edit
                    </Link>
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