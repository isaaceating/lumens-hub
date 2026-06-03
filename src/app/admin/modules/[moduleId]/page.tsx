"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { getModuleById, updateModule } from "@/lib/modules";

function EditModuleContent() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [loading, setLoading] = useState(true);
  const [moduleFound, setModuleFound] = useState(true);
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

  const isNativeModule = form.moduleKind === "native" || form.locked;

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;

      setLoading(true);

      try {
        const data = (await getModuleById(moduleId)) as any;

        if (!data) {
          setModuleFound(false);
          return;
        }

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

        setModuleFound(true);
      } catch (error) {
        console.error("Failed to load module:", error);
        setModuleFound(false);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

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
          href: `/modules/${moduleId}`,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      const normalizedOrder = form.order === "" ? 0 : Number(form.order);

      if (isNativeModule) {
        await updateModule(moduleId, {
          name: form.name.trim(),
          description: form.description.trim(),
          showOnDashboard: form.showOnDashboard,
          order: normalizedOrder,
          enabled: form.enabled,
        });

        router.push("/admin/modules");
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

      await updateModule(moduleId, {
        name: form.name.trim(),
        description: form.description.trim(),
        type: "feature",
        moduleKind: form.moduleKind,
        href:
          form.moduleKind === "embedded"
            ? `/modules/${moduleId}`
            : form.href.trim(),
        embedUrl: form.moduleKind === "embedded" ? form.embedUrl.trim() : null,
        showOnDashboard: form.showOnDashboard,
        order: normalizedOrder,
        enabled: form.enabled,
        locked: false,
      });

      router.push("/admin/modules");
    } catch (error) {
      console.error("Failed to save module:", error);
      alert("Failed to save module. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading module...</div>;
  }

  if (!moduleFound) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/modules")}
          className="mb-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Modules
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Module not found.
        </div>
      </div>
    );
  }

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
            <p className="mt-1 text-xs text-slate-500">
              Module ID is used as the system key and cannot be changed.
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

          {isNativeModule ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <input
                  value={form.type}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Module Kind
                </label>
                <input
                  value="native"
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Internal Route
                </label>
                <input
                  value={form.href}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <input
                  value="feature"
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Custom modules are always feature modules.
                </p>
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
                    Internal route is automatically set to{" "}
                    <span className="font-mono">/modules/{moduleId}</span>
                  </p>
                </div>
              )}
            </>
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

        {isNativeModule && (
          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
            This is a native system module. Type, module kind, and route are
            managed by code and cannot be changed here.
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
  );
}

export default function EditModulePage() {
  return (
    <AdminGuard>
      <EditModuleContent />
    </AdminGuard>
  );
}