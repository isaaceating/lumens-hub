"use client";

import { ShieldCheck } from "lucide-react";
import {
  adminModuleOptions,
  type AdminModuleKey,
} from "@/lib/adminPermissions";

type AdminModulesAccessPanelProps = {
  systemRole: string;
  selectedModules: AdminModuleKey[];
  onToggle: (moduleId: AdminModuleKey) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export default function AdminModulesAccessPanel({
  systemRole,
  selectedModules,
  onToggle,
  onSelectAll,
  onClear,
}: AdminModulesAccessPanelProps) {
  const isAdmin = systemRole === "admin";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Admin Modules</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which admin areas this user can manage. This only applies when System Role is admin.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={!isAdmin}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!isAdmin}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Clear
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Set System Role to admin before assigning admin module permissions.
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {adminModuleOptions.map((option) => {
          const checked = selectedModules.includes(option.id);

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                checked && isAdmin
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              } ${!isAdmin ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked && isAdmin}
                disabled={!isAdmin}
                onChange={() => onToggle(option.id)}
                className="mt-1 h-4 w-4"
              />

              <div>
                <div className="font-medium text-slate-900">{option.label}</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                <div className="mt-2 font-mono text-xs text-slate-400">{option.id}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
