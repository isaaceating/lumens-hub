"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/users";
import { updateUserModules } from "@/lib/users";
import AdminGuard from "@/app/components/AdminGuard";
import Link from "next/link";

const ALL_MODULES = [
  "dashboard",
  "training",
  "admin",
  "users",
  "modules",
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();

        console.log("🔥 USERS DATA:", data); // 👈 加這行

        setUsers(data);
      } catch (err) {
        console.error("❌ FETCH USERS ERROR:", err); // 👈 加這行
      }
    };

    fetchUsers();
  }, []);

  return (
    <AdminGuard>
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="space-y-4">
        {users.map((user, index) => {
          const currentModules = user.enabledModules || [];

          const toggleModule = async (moduleId: string) => {
            let newModules;

            if (currentModules.includes(moduleId)) {
              newModules = currentModules.filter((m: string) => m !== moduleId);
            } else {
              newModules = [...currentModules, moduleId];
            }

            await updateUserModules(user.uid, newModules);

            // 👉 立即更新 UI
            setUsers((prev) =>
              prev.map((u) =>
                u.uid === user.uid ? { ...u, enabledModules: newModules } : u
              )
            );
          };

          return (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Link
                href={`/admin/users/${user.uid}`}
                className="font-semibold text-blue-700 hover:underline"
              >
                {user.name || "No Name"}
              </Link>

              <div className="text-sm text-slate-500">{user.email}</div>

              <div className="mt-2 text-xs text-slate-400">
                role: {user.role}
              </div>

              {/* 👉 模組控制 */}
              <div className="mt-4 space-y-2">
                {ALL_MODULES.map((moduleId) => (
                  <label key={moduleId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={currentModules.includes(moduleId)}
                      onChange={() => toggleModule(moduleId)}
                    />
                    {moduleId}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </AdminGuard>
  );
}