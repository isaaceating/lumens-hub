"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { createModule } from "@/lib/modules";

function NewModuleContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    moduleKind: "external",
    section: "resource",
    href: "",
    embedUrl: "",
    showOnDashboard: true,
    enabled: true,
    order: 10 as number | "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => {
      if (type === "checkbox") {
        return {
          ...prev,
          [name]: checked,
        };
      }

      if (name === "order") {
        return {
          ...prev,
          order: value === "" ? "" : Number(value),
        };
      }

      if (name === "moduleKind") {
        return {
          ...prev,
          moduleKind: value,
          href: "",
          embedUrl: "",
        };
      }

      if (name === "href") {
        return {
          ...prev,
          href: value,
          embedUrl: "",
        };
      }

      if (name === "embedUrl") {
        return {
          ...prev,
          embedUrl: value,
          href: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = form.id.trim();

    if (!trimmedId) {
      alert("Module ID is required.");
      return;
    }

    if (form.moduleKind === "external" && !form.href.trim()) {
      alert("External URL is required.");
      return;
    }

    if (form.moduleKind === "embedded" && !form.embedUrl.trim()) {
      alert("Embed URL is required.");
      return;
    }

    setSaving(true);

    try {
      const normalizedOrder = form.order === "" ? 0 : Number(form.order);

      await createModule({
        id: trimmedId,
        name: form.name.trim(),
        description: form.description.trim(),
        type: "feature",
        moduleKind: form.moduleKind,
        section: form.section,
        href:
          form.moduleKind === "embedded"
            ? `/modules/${trimmedId}`
            : form.href.trim(),
        embedUrl: form.moduleKind === "embedded" ? form.embedUrl.trim() : null,
        showOnDashboard: form.showOnDashboard,
        enabled: form.enabled,
        order: normalizedOrder,
        locked: false,
      });

      router.push("/admin/modules");
    } catch (error) {
      console.error("Failed to create module:", error);
      alert("Failed to create module. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/modules")}
          className="mb-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Modules
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Create Module</h1>
        <p className="mt-2 text-slate-600">
          Create an external or embedded module for Lumens Portal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Module ID
            </label>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="c01-playbook"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use lowercase letters and hyphens. This cannot be changed later.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="C01 Playbook"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe this module."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Module Kind
            </label>
            <select
              name="moduleKind"
              value={form.moduleKind}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="external">external</option>
              <option value="embedded">embedded</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Custom modules are always saved as feature modules.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dashboard Section
            </label>
            <select
              name="section"
              value={form.section}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="workspace">My Workspace</option>
              <option value="resource">Official Resources</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Choose where this module appears on the dashboard.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Order
            </label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {form.moduleKind === "external" && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                External URL
              </label>
              <input
                name="href"
                value={form.href}
                onChange={handleChange}
                placeholder="https://sites.google.com/view/lumensapac"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">
                This module will open in a new browser tab.
              </p>
            </div>
          )}

          {form.moduleKind === "embedded" && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Embed URL
              </label>
              <input
                name="embedUrl"
                value={form.embedUrl}
                onChange={handleChange}
                placeholder="https://script.google.com/macros/s/.../exec"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">
                Internal route will be created automatically as{" "}
                <span className="font-mono">
                  /modules/{form.id.trim() || "module-id"}
                </span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-6 pt-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                name="showOnDashboard"
                type="checkbox"
                checked={form.showOnDashboard}
                onChange={handleChange}
              />
              Show on Dashboard
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                name="enabled"
                type="checkbox"
                checked={form.enabled}
                onChange={handleChange}
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Create Module"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/modules")}
            className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewModulePage() {
  return (
    <AdminGuard>
      <NewModuleContent />
    </AdminGuard>
  );
}