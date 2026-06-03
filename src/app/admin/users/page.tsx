"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import { getAllUsers } from "@/lib/users";

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);

      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  if (loadingUsers) {
    return <div className="text-slate-500">Loading users...</div>;
  }

  return (
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

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}