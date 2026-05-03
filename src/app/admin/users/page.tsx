"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/users";

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
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="font-semibold text-slate-900">
              {user.name || "No Name"}
            </div>

            <div className="text-sm text-slate-500">{user.email}</div>

            <div className="mt-2 text-xs text-slate-400">
              role: {user.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}