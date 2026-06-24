"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { getUserById, updateUserProfile } from "@/lib/users";
import { modules as staticModules } from "@/app/config/modules";
import { getAllModules } from "@/lib/modules";

const ROLES = ["user", "admin"];
const REGIONS = ["APAC", "LUI", "LEI", "LCG"];

type DashboardSectionKey =
  | "news"
  | "activity"
  | "workspaces"
  | "resources"
  | "bookmarks";

const dashboardSectionOptions: {
  key: DashboardSectionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "news",
    label: "Latest News",
    description: "Show the latest announcements carousel on the homepage.",
  },
  {
    key: "activity",
    label: "Training Activity",
    description: "Show recently viewed lessons and recent discussions.",
  },
  {
    key: "workspaces",
    label: "My Workspaces",
    description: "Show workspace modules assigned to this user.",
  },
  {
    key: "resources",
    label: "Official Resources",
    description: "Show official resource modules assigned to this user.",
  },
  {
    key: "bookmarks",
    label: "My Bookmarks",
    description: "Show this user's personal bookmark section.",
  },
];

const defaultDashboardSections = dashboardSectionOptions.map(
  (item) => item.key,
);

function UserDetailContent() {
  const params = useParams();
  const uid = params.uid as string;

  const [user, setUser] = useState<any>(null);

  const [role, setRole] = useState("user");
  const [region, setRegion] = useState("APAC");
  const [knowledgeCenterAuditEnabled, setKnowledgeCenterAuditEnabled] =
    useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const [enabledDashboardSections, setEnabledDashboardSections] = useState<
    string[]
  >(defaultDashboardSections);
  const [moduleOptions, setModuleOptions] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const workspaceModules = useMemo(() => {
    return moduleOptions.filter(
      (module) => module.type === "feature" && module.section === "workspace",
    );
  }, [moduleOptions]);

  const resourceModules = useMemo(() => {
    return moduleOptions.filter(
      (module) => module.type === "feature" && module.section !== "workspace",
    );
  }, [moduleOptions]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;

      setLoadingUser(true);

      try {
        const data = (await getUserById(uid)) as any;

        if (data) {
          setUser(data);
          setRole(data.role || "user");
          setRegion(data.region || "APAC");
          setKnowledgeCenterAuditEnabled(
            data.knowledgeCenterAuditEnabled === true ||
              data.auditSettings?.knowledgeCenter === true,
          );
          setEnabledModules(
            Array.isArray(data.enabledModules) ? data.enabledModules : [],
          );
          setEnabledDashboardSections(
            Array.isArray(data.enabledDashboardSections)
              ? data.enabledDashboardSections
              : defaultDashboardSections,
          );
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [uid]);

  useEffect(() => {
    const fetchModules = async () => {
      setLoadingModules(true);

      try {
        const firestoreModules = await getAllModules();

        const combined = [...staticModules, ...firestoreModules];

        const unique = combined.filter(
          (module, index, self) =>
            index === self.findIndex((item) => item.id === module.id),
        );

        const sorted = unique.sort((a, b) => (a.order || 0) - (b.order || 0));

        setModuleOptions(sorted);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  const toggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const toggleDashboardSection = (sectionKey: DashboardSectionKey) => {
    setEnabledDashboardSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((key) => key !== sectionKey)
        : [...prev, sectionKey],
    );
  };

  const selectAllModules = () => {
    const allModuleIds = moduleOptions
      .filter((module) => module.type === "feature")
      .map((module) => module.id);

    setEnabledModules(allModuleIds);
  };

  const clearModules = () => {
    setEnabledModules([]);
  };

  const selectAllDashboardSections = () => {
    setEnabledDashboardSections(defaultDashboardSections);
  };

  const clearDashboardSections = () => {
    setEnabledDashboardSections([]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateUserProfile(uid, {
        role,
        region,
        knowledgeCenterAuditEnabled,
        auditSettings: {
          ...(user?.auditSettings || {}),
          knowledgeCenter: knowledgeCenterAuditEnabled,
        },
        enabledModules,
        enabledDashboardSections,
      });

      const updatedUser = (await getUserById(uid)) as any;
      setUser(updatedUser);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderModuleCheckbox = (module: any) => {
    const checked = enabledModules.includes(module.id);

    return (
      <label
        key={module.id}
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
          checked
            ? "border-blue-200 bg-blue-50"
            : "border-slate-200 bg-white hover:border-blue-200"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleModule(module.id)}
          className="mt-1 h-4 w-4"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">
              {module.name || module.id}
            </span>

            {module.enabled === false && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
                Disabled
              </span>
            )}

            {module.locked && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                Native
              </span>
            )}
          </div>

          <div className="mt-1 break-all text-xs text-slate-500">
            {module.id}
          </div>

          {module.description && (
            <p className="mt-2 text-sm text-slate-500">{module.description}</p>
          )}
        </div>
      </label>
    );
  };

  const loading = loadingUser || loadingModules;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="mb-4 inline-block text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Users
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">User Detail</h1>
        <p className="mt-2 text-slate-600">
          Manage user role, region, dashboard sections, and module access.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          Loading user...
        </div>
      ) : !user ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          User not found.
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
                <div className="font-medium text-slate-900">
                  {user.name || "No Name"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-slate-900">{user.email || "No Email"}</div>
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
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Audit Log Settings
            </h2>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                knowledgeCenterAuditEnabled
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <input
                type="checkbox"
                checked={knowledgeCenterAuditEnabled}
                onChange={(e) =>
                  setKnowledgeCenterAuditEnabled(e.target.checked)
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <div className="font-medium text-slate-900">
                  Knowledge Center Usage Audit
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Track this user's Knowledge Center usage, including page view,
                  book open, file preview, search-result preview, open in Google
                  Drive, and download events.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Recommended for Sales and Marketing users only. This setting
                  controls whether Lumens Portal passes audit=1 to the embedded
                  Knowledge Center.
                </p>
              </div>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Dashboard Sections
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control which homepage sections this user can see.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllDashboardSections}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearDashboardSections}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {dashboardSectionOptions.map((section) => {
                const checked = enabledDashboardSections.includes(section.key);

                return (
                  <label
                    key={section.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      checked
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDashboardSection(section.key)}
                      className="mt-1 h-4 w-4"
                    />

                    <div>
                      <div className="font-medium text-slate-900">
                        {section.label}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Module Access
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control which workspace and resource modules this user can
                  access.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearModules}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-7">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Workspaces
                </h3>

                {workspaceModules.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {workspaceModules.map((module) =>
                      renderModuleCheckbox(module),
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    No workspace modules found.
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Official Resources
                </h3>

                {resourceModules.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {resourceModules.map((module) =>
                      renderModuleCheckbox(module),
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    No official resource modules found.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href="/admin/users"
              className="rounded-lg bg-slate-100 px-5 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </Link>

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
      )}
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <AdminGuard>
      <UserDetailContent />
    </AdminGuard>
  );
}
