"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  ClipboardList,
  Eye,
  Home,
  KeyRound,
  LayoutDashboard,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { getUserById, updateUserProfile } from "@/lib/users";
import { modules as staticModules } from "@/app/config/modules";
import { getAllModules } from "@/lib/modules";

const SYSTEM_ROLES = ["user", "admin"];

const ACCOUNT_TYPES = [
  "Lumens",
  "Distributor",
  "System Integrator",
  "End User",
];

const REGIONS = ["HQ", "APAC", "LUI", "LEI", "LCG"];

const LUMENS_DEPARTMENTS = ["SAL", "MKT", "PDM", "TS", "Management"];

const JOB_ROLES = [
  "Sales",
  "Marketing",
  "Product Manager",
  "Pre-sales",
  "Technical Support",
  "Management",
  "Other",
];

type DashboardSectionKey =
  | "news"
  | "activity"
  | "workspaces"
  | "resources"
  | "bookmarks";

type DetailTab = "profile" | "dashboard" | "modules" | "audit";

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

const getEffectiveDepartment = (accountType: string, department: string) => {
  if (accountType !== "Lumens") return "VIP Partner";
  return department || "SAL";
};

const getEffectiveJobRoleForDisplay = (
  jobRole: string,
  customJobRole: string,
) => {
  if (jobRole === "Other" && customJobRole.trim()) {
    return customJobRole.trim();
  }

  return jobRole || "Other";
};

const getDisplayName = (user: any, editedName: string) => {
  return editedName.trim() || user?.googleName || user?.name || "No Name";
};

function UserDetailContent() {
  const params = useParams();
  const uid = params.uid as string;

  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [systemRole, setSystemRole] = useState("user");

  const [accountType, setAccountType] = useState("Lumens");
  const [region, setRegion] = useState("APAC");
  const [department, setDepartment] = useState("SAL");
  const [jobRole, setJobRole] = useState("Other");
  const [customJobRole, setCustomJobRole] = useState("");

  const [knowledgeCenterAuditEnabled, setKnowledgeCenterAuditEnabled] =
    useState(false);

  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const [enabledDashboardSections, setEnabledDashboardSections] = useState<
    string[]
  >(defaultDashboardSections);

  const [moduleOptions, setModuleOptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("profile");
  const [moduleQuery, setModuleQuery] = useState("");
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

          setName(data.name || data.googleName || "");
          setSystemRole(data.role || "user");

          const nextAccountType = data.accountType || "Lumens";
          setAccountType(nextAccountType);

          setRegion(data.region || "APAC");

          const nextDepartment =
            nextAccountType === "Lumens"
              ? data.department || "SAL"
              : "VIP Partner";
          setDepartment(nextDepartment);

          setJobRole(data.jobRole || "Other");
          setCustomJobRole(data.customJobRole || "");

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

  const handleAccountTypeChange = (nextAccountType: string) => {
    setAccountType(nextAccountType);

    if (nextAccountType !== "Lumens") {
      setDepartment("VIP Partner");
    } else if (department === "VIP Partner") {
      setDepartment("SAL");
    }
  };

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
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Name is required.");
      setActiveTab("profile");
      return;
    }

    if (jobRole === "Other" && !customJobRole.trim()) {
      alert("Please enter a custom job role when Job Role is Other.");
      setActiveTab("profile");
      return;
    }

    setSaving(true);
    setSaved(false);

    const effectiveDepartment = getEffectiveDepartment(accountType, department);

    try {
      await updateUserProfile(uid, {
        name: trimmedName,
        isNameManuallyEdited: true,

        role: systemRole,
        accountType,
        region,
        department: effectiveDepartment,
        jobRole,
        customJobRole: jobRole === "Other" ? customJobRole.trim() : "",

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

  const moduleMatchesQuery = (module: any) => {
    const q = moduleQuery.trim().toLowerCase();
    if (!q) return true;

    return [module.id, module.name, module.description]
      .map((item) => String(item || "").toLowerCase())
      .join(" ")
      .includes(q);
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
  const effectiveDepartment = getEffectiveDepartment(accountType, department);
  const effectiveJobRole = getEffectiveJobRoleForDisplay(
    jobRole,
    customJobRole,
  );
  const displayName = getDisplayName(user, name);
  const filteredWorkspaceModules = workspaceModules.filter(moduleMatchesQuery);
  const filteredResourceModules = resourceModules.filter(moduleMatchesQuery);

  const tabs: {
    key: DetailTab;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "profile",
      label: "Profile",
      description: "Identity, role, region, and department.",
      icon: <UserRound size={16} />,
    },
    {
      key: "dashboard",
      label: "Dashboard",
      description: "Homepage sections visible to this user.",
      icon: <LayoutDashboard size={16} />,
    },
    {
      key: "modules",
      label: "Modules",
      description: "Workspace and official resource access.",
      icon: <Blocks size={16} />,
    },
    {
      key: "audit",
      label: "Audit",
      description: "Knowledge Center tracking settings.",
      icon: <ClipboardList size={16} />,
    },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <UserRound className="mt-1 text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set the display name and review account identity.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              placeholder="Display name"
            />
            <p className="mt-1 text-xs text-slate-400">
              Used as the display name inside Lumens Portal and audit logs.
            </p>
          </div>

          <div>
            <div className="text-sm text-slate-500">Email</div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {user.email || "No Email"}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Google Name</div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {user.googleName || user.name || "No Google Name"}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">UID</div>
            <div className="mt-2 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
              {uid}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <ShieldCheck className="mt-1 text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Profile & Permission
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Control Portal role and the profile fields used in audit logs.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              System Role
            </label>
            <select
              value={systemRole}
              onChange={(e) => setSystemRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            >
              {SYSTEM_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Controls Portal admin permission. This is not the Knowledge Center
              usage role.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => handleAccountTypeChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Non-Lumens accounts are grouped under VIP Partner department.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            {accountType === "Lumens" ? (
              <select
                value={department === "VIP Partner" ? "SAL" : department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {LUMENS_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                VIP Partner
              </div>
            )}

            <p className="mt-1 text-xs text-slate-400">
              Saved value will be: {effectiveDepartment}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Job Role
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {JOB_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {jobRole === "Other" && (
                <input
                  value={customJobRole}
                  onChange={(e) => setCustomJobRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="Enter custom job role"
                />
              )}
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Usage log userRole will be: {effectiveJobRole}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <LayoutDashboard className="mt-1 text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Dashboard Sections
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Control which homepage sections this user can see.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllDashboardSections}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={clearDashboardSections}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
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
  );

  const renderModulesTab = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Blocks className="mt-1 text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Module Access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Control which workspace and resource modules this user can access.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllModules}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={clearModules}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-5 max-w-md">
        <input
          value={moduleQuery}
          onChange={(e) => setModuleQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          placeholder="Search modules by name, id, or description..."
        />
      </div>

      <div className="mt-6 space-y-7">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Workspaces
          </h3>

          {filteredWorkspaceModules.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredWorkspaceModules.map((module) =>
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

          {filteredResourceModules.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredResourceModules.map((module) =>
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
  );

  const renderAuditTab = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <ClipboardList className="mt-1 text-blue-600" size={20} />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Audit Log Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Decide whether this user's Knowledge Center usage should be tracked.
          </p>
        </div>
      </div>

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
          onChange={(e) => setKnowledgeCenterAuditEnabled(e.target.checked)}
          className="mt-1 h-4 w-4"
        />

        <div>
          <div className="font-medium text-slate-900">
            Knowledge Center Usage Audit
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Track this user's Knowledge Center usage, including page view, book
            open, file preview, search-result preview, open in Google Drive, and
            download events.
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            The usage log will use User Profile fields: Region, Department, and
            Job Role.
          </p>
        </div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Users
        </Link>

        {!loading && user && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>UID:</span>
            <span className="break-all rounded-full bg-slate-100 px-2.5 py-1 font-mono">
              {uid}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Loading user...
        </div>
      ) : !user ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          User not found.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-white/75">
                      {user.email || "No email"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
                        {systemRole}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
                        {accountType}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
                        {region}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
                        {effectiveDepartment}
                      </span>
                    </div>
                  </div>
                </div>

                {saved && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1.5 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-200/30">
                    <CheckCircle2 size={16} /> Saved successfully
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-0 border-t border-slate-100 md:grid-cols-4">
              <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <KeyRound size={16} /> Modules
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {enabledModules.length}
                </div>
              </div>

              <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Home size={16} /> Dashboard
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {enabledDashboardSections.length}
                </div>
              </div>

              <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Eye size={16} /> Audit
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {knowledgeCenterAuditEnabled ? "On" : "Off"}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <BadgeCheck size={16} /> Usage Role
                </div>
                <div className="mt-2 truncate text-2xl font-bold text-slate-900">
                  {effectiveJobRole}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                {tabs.map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                        active
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="mt-0.5">{tab.icon}</span>
                      <span>
                        <span className="block text-sm font-semibold">
                          {tab.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 opacity-75">
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "dashboard" && renderDashboardTab()}
              {activeTab === "modules" && renderModulesTab()}
              {activeTab === "audit" && renderAuditTab()}
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Managing <span className="font-semibold text-slate-900">{displayName}</span>
                <span className="hidden sm:inline"> · {enabledModules.length} modules · {enabledDashboardSections.length} dashboard sections</span>
              </div>

              <div className="flex items-center gap-3">
                {saved && (
                  <span className="hidden text-sm font-medium text-green-600 sm:inline">
                    Saved successfully.
                  </span>
                )}

                <Link
                  href="/admin/users"
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </>
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
