"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { createModule } from "@/lib/modules";

export default function NewModulePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "feature",
    moduleKind: "external",
    href: "",
    embedUrl: "",
    showOnDashboard: true,
    enabled: true,
    order: 10 as number | "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const normalizedOrder = form.order === "" ? 0 : Number(form.order);

    await createModule({
      ...form,
      order: normalizedOrder,
      embedUrl: form.embedUrl || null,
    });

    setSaving(false);
    router.push("/admin/modules");
  };

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/modules")}
            className="mb-4 text-sm text-blue-700 hover:underline"
          >
            ← Back to Modules
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Create Module</h1>
          <p className="mt-2 text-slate-600">
            Add a native, external, or embedded module to Lumens HUB.
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
                placeholder="apac-sales-hub"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="APAC Sales HUB"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="feature">feature</option>
                <option value="admin">admin</option>
                <option value="core">core</option>
              </select>
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
                <option value="native">native</option>
                <option value="external">external</option>
                <option value="embedded">embedded</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Route / External URL
              </label>
              <input
                name="href"
                value={form.href}
                onChange={handleChange}
                placeholder="/training or https://sites.google.com/view/lumensapac"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}

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

            <div className="flex items-center gap-6 pt-7">
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
    </AdminGuard>
  );
}