"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BellRing,
  Building2,
  Clock3,
  Filter,
  KeyRound,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { getAllUsers } from "@/lib/users";

type SortKey = "name" | "email" | "role" | "region" | "modules" | "createdAt";

const NEW_USER_WINDOW_DAYS = 7;

const normalize = (value: unknown) => String(value || "").trim();

const getDisplayName = (user: any) => {
  return normalize(user.name || user.googleName) || "No Name";
};

const getModuleCount = (user: any) => {
  return Array.isArray(user.enabledModules) ? user.enabledModules.length : 0;
};

const getDashboardSectionCount = (user: any) => {
  return Array.isArray(user.enabledDashboardSections)
    ? user.enabledDashboardSections.length
    : 0;
};

const getAuditEnabled = (user: any) => {
  return (
    user.knowledgeCenterAuditEnabled === true ||
    user.auditSettings?.knowledgeCenter === true
  );
};

const getUserCreatedDate = (user: any) => {
  const raw = user.createdAt;

  if (!raw) return null;

  if (raw instanceof Date) return raw;

  if (typeof raw === "object" && typeof raw.toDate === "function") {
    return raw.toDate();
  }

  if (typeof raw === "object" && typeof raw.seconds === "number") {
    return new Date(raw.seconds * 1000);
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (user: any) => {
  const date = getUserCreatedDate(user);

  if (!date) return "—";

  return date.toLocaleDateString();
};

const isNewUser = (user: any) => {
  const createdDate = getUserCreatedDate(user);

  if (!createdDate) return false;

  const diffDays =
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= NEW_USER_WINDOW_DAYS;
};

const needsSetup = (user: any) => {
  const moduleCount = getModuleCount(user);
  const jobRole = normalize(user.jobRole || "Other");
  const customJobRole = normalize(user.customJobRole);
  const isDefaultName = user.isNameManuallyEdited !== true;

  return (
    isDefaultName ||
    (jobRole === "Other" && !customJobRole) ||
    moduleCount <= 2 ||
    !Array.isArray(user.enabledDashboardSections)
  );
};

const uniqueOptions = (users: any[], key: string) => {
  return Array.from(
    new Set(users.map((user) => normalize(user[key])).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
};

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [auditFilter, setAuditFilter] = useState("all");
  const [setupFilter, setSetupFilter] = useState("pending");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

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

  const roleOptions = useMemo(() => uniqueOptions(users, "role"), [users]);
  const accountTypeOptions = useMemo(
    () => uniqueOptions(users, "accountType"),
    [users],
  );
  const regionOptions = useMemo(() => uniqueOptions(users, "region"), [users]);
  const departmentOptions = useMemo(
    () => uniqueOptions(users, "department"),
    [users],
  );

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const pendingSetup = users.filter(needsSetup).length;
    const newUsers = users.filter(isNewUser).length;
    const auditUsers = users.filter(getAuditEnabled).length;

    return { admins, pendingSetup, newUsers, auditUsers };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = users.filter((user) => {
      const moduleCount = getModuleCount(user);
      const searchable = [
        getDisplayName(user),
        user.email,
        user.role,
        user.accountType,
        user.region,
        user.department,
        user.jobRole,
        user.customJobRole,
        ...(Array.isArray(user.enabledModules) ? user.enabledModules : []),
      ]
        .map((item) => normalize(item).toLowerCase())
        .join(" ");

      return (
        (!q || searchable.includes(q)) &&
        (roleFilter === "all" || user.role === roleFilter) &&
        (accountTypeFilter === "all" ||
          normalize(user.accountType || "Lumens") === accountTypeFilter) &&
        (regionFilter === "all" || normalize(user.region) === regionFilter) &&
        (departmentFilter === "all" ||
          normalize(user.department) === departmentFilter) &&
        (accessFilter === "all" ||
          (accessFilter === "withAccess" && moduleCount > 0) ||
          (accessFilter === "noAccess" && moduleCount === 0)) &&
        (auditFilter === "all" ||
          (auditFilter === "enabled" && getAuditEnabled(user)) ||
          (auditFilter === "disabled" && !getAuditEnabled(user))) &&
        (setupFilter === "all" ||
          (setupFilter === "pending" && needsSetup(user)) ||
          (setupFilter === "ready" && !needsSetup(user)) ||
          (setupFilter === "new" && isNewUser(user)))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "modules") {
        return getModuleCount(b) - getModuleCount(a);
      }

      if (sortKey === "createdAt") {
        const aDate = getUserCreatedDate(a)?.getTime() || 0;
        const bDate = getUserCreatedDate(b)?.getTime() || 0;
        return bDate - aDate;
      }

      const aValue =
        sortKey === "name" ? getDisplayName(a) : normalize(a[sortKey]);
      const bValue =
        sortKey === "name" ? getDisplayName(b) : normalize(b[sortKey]);

      return aValue.localeCompare(bValue);
    });
  }, [
    users,
    query,
    roleFilter,
    accountTypeFilter,
    regionFilter,
    departmentFilter,
    accessFilter,
    auditFilter,
    setupFilter,
    sortKey,
  ]);

  const resetFilters = () => {
    setQuery("");
    setRoleFilter("all");
    setAccountTypeFilter("all");
    setRegionFilter("all");
    setDepartmentFilter("all");
    setAccessFilter("all");
    setAuditFilter("all");
    setSetupFilter("pending");
    setSortKey("createdAt");
  };

  const showAllUsers = () => {
    setSetupFilter("all");
    setSortKey("createdAt");
  };

  const showPendingSetup = () => {
    setSetupFilter("pending");
    setSortKey("createdAt");
  };

  if (loadingUsers) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <Users size={14} /> Admin Console
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review new registrations, find users who still need setup, and manage
            dashboard sections, module access, and audit settings.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <SlidersHorizontal size={16} /> Reset view
        </button>
      </div>

      {stats.pendingSetup > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <BellRing className="mt-0.5 text-amber-600" size={22} />
              <div>
                <h2 className="font-semibold text-amber-900">
                  {stats.pendingSetup} user{stats.pendingSetup > 1 ? "s" : ""} may need setup
                </h2>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Pending setup means the account still looks close to the default registration profile: default name, generic job role, default module access, or missing dashboard section settings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={showPendingSetup}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Review pending users
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={showAllUsers}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Total Users</div>
            <Users size={18} className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {users.length}
          </div>
        </button>

        <button
          type="button"
          onClick={showPendingSetup}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm transition hover:bg-amber-100"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-amber-700">Pending Setup</div>
            <Clock3 size={18} className="text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-900">
            {stats.pendingSetup}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSetupFilter("new")}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left shadow-sm transition hover:bg-blue-100"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-700">New This Week</div>
            <UserCheck size={18} className="text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-blue-900">
            {stats.newUsers}
          </div>
        </button>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-emerald-700">Audit Enabled</div>
            <BadgeCheck size={18} className="text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">
            {stats.auditUsers}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(8,minmax(0,1fr))]">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              placeholder="Search name, email, role, module..."
            />
          </label>

          <select
            value={setupFilter}
            onChange={(event) => setSetupFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="pending">Setup · Pending</option>
            <option value="new">Setup · New</option>
            <option value="ready">Setup · Ready</option>
            <option value="all">Setup · All</option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Role · All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={accountTypeFilter}
            onChange={(event) => setAccountTypeFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Type · All</option>
            {accountTypeOptions.map((accountType) => (
              <option key={accountType} value={accountType}>
                {accountType}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Region · All</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Dept · All</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={accessFilter}
            onChange={(event) => setAccessFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Access · All</option>
            <option value="withAccess">Has modules</option>
            <option value="noAccess">No modules</option>
          </select>

          <select
            value={auditFilter}
            onChange={(event) => setAuditFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Audit · All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="createdAt">Sort · Newest</option>
            <option value="name">Sort · Name</option>
            <option value="email">Sort · Email</option>
            <option value="role">Sort · Role</option>
            <option value="region">Sort · Region</option>
            <option value="modules">Sort · Modules</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Users</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredUsers.length} of {users.length} users.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Setup</th>
                <th className="px-5 py-3 font-semibold">Profile</th>
                <th className="px-5 py-3 font-semibold">Access</th>
                <th className="px-5 py-3 font-semibold">Audit</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const moduleCount = getModuleCount(user);
                const dashboardSectionCount = getDashboardSectionCount(user);
                const auditEnabled = getAuditEnabled(user);
                const accountType = normalize(user.accountType || "Lumens");
                const department = normalize(user.department || "—");
                const region = normalize(user.region || "—");
                const role = normalize(user.role || "user");
                const pending = needsSetup(user);
                const newlyRegistered = isNewUser(user);

                return (
                  <tr key={user.uid} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {getDisplayName(user).slice(0, 1).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">
                            {getDisplayName(user)}
                          </div>
                          <div className="mt-1 break-all text-xs text-slate-500">
                            {user.email || "No email"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            Registered: {formatDate(user)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {newlyRegistered && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            New
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            pending
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {pending ? "Needs setup" : "Ready"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {role}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {accountType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {region}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {department}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <KeyRound size={16} className="text-slate-400" />
                        {moduleCount} modules
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {dashboardSectionCount} dashboard sections
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          auditEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {auditEnabled ? "Enabled" : "Off"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/admin/users/${user.uid}`}
                        className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-sm transition ${
                          pending
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {pending ? "Set up" : "Manage"}
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
