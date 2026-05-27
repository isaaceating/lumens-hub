"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { getModuleById, updateModule } from "@/lib/modules";

export default function EditModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "feature",
    moduleKind: "external",
    href: "",
    embedUrl: "",
    showOnDashboard: true,
    enabled: true,
    order: 10 as number | "",
    locked: false,
  });

  useEffect(() => {
    const fetchModule = async () => {
      const data = (await getModuleById(moduleId)) as any;

      if (data) {
        setForm({
          name: data.name || "",
          description: data.description || "",
          type: data.type || "feature",
          moduleKind: data.moduleKind || "external",
          href: data.href || "",
          embedUrl: data.embedUrl || "",
          showOnDashboard: data.showOnDashboard ?? true,
          enabled: data.enabled ?? true,
          order: data.order ?? 10,
          locked: data.locked || false,
        });
      }

      setLoading(false);
    };

    if (moduleId) fetchModule();
  }, [moduleId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const normalizedOrder = form.order === "" ? 0 : Number(form.order);

    const payload = form.locked
      ? {
          name: form.name,
          description: form.description,
          showOnDashboard: form.showOnDashboard,
          order: normalizedOrder,
          enabled: form.enabled,
        }
      : {
          ...form,
          order: normalizedOrder,
          embedUrl: form.embedUrl || null,
        };

    await updateModule(moduleId, payload);

    setSaving(false);
    router.push("/admin/modules");
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-slate-500">Loading...</div>
      </AdminGuard>
    );
  }

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

          <h1 className="text-2xl font-bold text-slate-900">Edit Module</h1>
          <p className="mt-2 text-slate-600">
            Manage module name, description, visibility, and URL settings.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Module ID
              </label>
              <input
                value={moduleId}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
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
                disabled={form.locked}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              >
                <option value="feature">feature</option>
                <option value="admin">admin</option>
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
                disabled={form.locked}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
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
                disabled={form.locked}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
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
                  disabled={form.locked}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
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

          {form.locked && (
            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              This is a native system module. Route and module type are locked.
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save Changes"}
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