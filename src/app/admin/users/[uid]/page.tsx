"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";
import { useParams } from "next/navigation";
import { getUserById, updateUserProfile } from "@/lib/users";
import Link from "next/link";

const ALL_MODULES = ["dashboard", "training", "admin", "users", "modules", "courses"];
const ROLES = ["user", "admin"];
const REGIONS = ["APAC", "LUI", "LEI", "LCG"];

export default function UserDetailPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("user");
  const [region, setRegion] = useState("APAC");
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserById(uid);

      if (data) {
        setUser(data);
        setRole(data.role || "user");
        setRegion(data.region || "APAC");
        setEnabledModules(data.enabledModules || []);
      }
    };

    if (uid) {
      fetchUser();
    }
  }, [uid]);

  const toggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await updateUserProfile(uid, {
        role,
        region,
        enabledModules,
    });

    const updatedUser = await getUserById(uid);
    setUser(updatedUser);

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
        setSaved(false);
    }, 2500);
    };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
            <Link
                href="/admin/users"
                className="mb-4 inline-block text-sm text-blue-700 hover:underline"
            >
                ← Back to Users
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">User Detail</h1>
          <p className="mt-2 text-slate-600">
            Manage user role, region, and module access.
          </p>
        </div>

        {!user ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
            Loading user...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Basic Information
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-slate-500">Name</div>
                  <div className="font-medium text-slate-900">{user.name}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-slate-900">{user.email}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">UID</div>
                  <div className="break-all font-mono text-xs text-slate-700">
                    {uid}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Access Settings
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-sm font-medium text-slate-700">
                  Enabled Modules
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {ALL_MODULES.map((moduleId) => (
                    <label
                      key={moduleId}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={enabledModules.includes(moduleId)}
                        onChange={() => toggleModule(moduleId)}
                      />
                      {moduleId}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {saved && (
                <span className="text-sm font-medium text-green-600">
                    Saved successfully.
                </span>
                )}

                <span className="text-sm text-slate-500">
                Current role: {user.role} / Region: {user.region}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}