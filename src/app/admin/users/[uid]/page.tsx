"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";
import { useParams } from "next/navigation";
import { getUserById } from "@/lib/users";

export default function UserDetailPage() {
  const params = useParams();
  const uid = params.uid as string;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserById(uid);
      setUser(data);
    };

    if (uid) {
      fetchUser();
    }
  }, [uid]);

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Detail</h1>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!user ? (
            <div className="text-slate-500">Loading user...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Name</div>
                <div className="font-medium text-slate-900">{user.name}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-slate-900">{user.email}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Role</div>
                <div className="text-slate-900">{user.role}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Region</div>
                <div className="text-slate-900">{user.region}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Enabled Modules</div>
                <div className="text-slate-900">
                  {(user.enabledModules || []).join(", ")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}