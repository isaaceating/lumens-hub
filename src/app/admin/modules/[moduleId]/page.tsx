"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, FileText, Globe2, LayoutDashboard, MonitorUp, Save, Settings2 } from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { getModuleById, updateModule } from "@/lib/modules";

const getSectionLabel = (section: string, type?: string) => {
  if (type === "admin") return "Admin";
  return section === "workspace" ? "My Workspace" : "Official Resources";
};

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
    section: "resource",
    href: "",
    embedUrl: "",
    showOnDashboard: true,
    enabled: true,
    order: 10 as number | "",
    locked: false,
  });

  const isNativeModule = form.moduleKind === "native" || form.locked;
  const isFeatureModule = form.type === "feature";
  const internalRoute = `/modules/${moduleId}`;
  const targetUrl = form.moduleKind === "embedded" ? form.embedUrl : form.href;

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
          section: data.section || "resource",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => {
      if (type === "checkbox") return { ...prev, [name]: checked };
      if (name === "order") return { ...prev, order: value === "" ? "" : Number(value) };
      if (name === "moduleKind") return { ...prev, moduleKind: value, href: "", embedUrl: "" };
      if (name === "href") return { ...prev, href: value, embedUrl: "" };
      if (name === "embedUrl") return { ...prev, embedUrl: value, href: `/modules/${moduleId}` };
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Module name is required.");
      return;
    }

    setSaving(true);

    try {
      const normalizedOrder = form.order === "" ? 0 : Number(form.order);

      if (isNativeModule) {
        await updateModule(moduleId, {
          name: form.name.trim(),
          description: form.description.trim(),
          section: isFeatureModule ? form.section : null,
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
        section: form.section,
        href: form.moduleKind === "embedded" ? `/modules/${moduleId}` : form.href.trim(),
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

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading module...</div>;

  if (!moduleFound) {
    return (
      <div className="space-y-4">
        <Link href="/admin/modules" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Modules
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Module not found.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/modules" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Modules
        </Link>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{isNativeModule ? "native" : form.moduleKind}</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              {form.moduleKind === "embedded" ? <MonitorUp size={26} /> : <Globe2 size={26} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manage Module</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">Update module information, placement, visibility, and destination settings.</p>
            </div>
          </div>
        </div>
      </div>

      {isNativeModule && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 shadow-sm">
          This is a native system module. Type, module kind, and route are managed by code. You can still adjust name, description, section, dashboard visibility, order, and enabled status.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <FileText className="mt-0.5 text-blue-600" size={20} />
            <div><h2 className="text-lg font-semibold text-slate-900">Module Information</h2><p className="mt-1 text-sm text-slate-500">Edit the user-facing name, description, and destination.</p></div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Module ID</label><input value={moduleId} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm text-slate-500" /><p className="mt-1 text-xs text-slate-500">Module ID is the system key and cannot be changed.</p></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Name</label><input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
            <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>

            {isNativeModule ? (
              <>
                <div><label className="mb-2 block text-sm font-medium text-slate-700">Type</label><input value={form.type} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500" /></div>
                <div><label className="mb-2 block text-sm font-medium text-slate-700">Module Kind</label><input value="native" disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500" /></div>
                <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Internal Route</label><input value={form.href} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500" /></div>
              </>
            ) : (
              <>
                {form.moduleKind === "external" && <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">External URL</label><input name="href" value={form.href} onChange={handleChange} placeholder="https://sites.google.com/view/lumensapac" required className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /><p className="mt-1 text-xs text-slate-500">External modules open in a new browser tab.</p></div>}
                {form.moduleKind === "embedded" && <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Embed URL</label><input name="embedUrl" value={form.embedUrl} onChange={handleChange} placeholder="https://script.google.com/macros/s/.../exec" required className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /><p className="mt-1 text-xs text-slate-500">Embedded modules use the internal Portal route <span className="font-mono">{internalRoute}</span>.</p></div>}
              </>
            )}
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3"><Settings2 className="mt-0.5 text-blue-600" size={20} /><div><h2 className="font-semibold text-slate-900">Module Settings</h2><p className="mt-1 text-sm text-slate-500">Control placement, order, and visibility.</p></div></div>
            <div className="space-y-4">
              {!isNativeModule && <div><label className="mb-2 block text-sm font-medium text-slate-700">Module Kind</label><select name="moduleKind" value={form.moduleKind} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"><option value="external">external</option><option value="embedded">embedded</option></select></div>}
              {isFeatureModule && <div><label className="mb-2 block text-sm font-medium text-slate-700">Dashboard Section</label><select name="section" value={form.section} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"><option value="workspace">My Workspace</option><option value="resource">Official Resources</option></select></div>}
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Order</label><input name="order" type="number" value={form.order} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><input name="showOnDashboard" type="checkbox" checked={form.showOnDashboard} onChange={handleChange} className="mt-1" /><span><span className="font-semibold text-slate-900">Show on Dashboard</span><span className="mt-1 block text-xs text-slate-500">Controls whether this module appears in dashboard sections.</span></span></label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><input name="enabled" type="checkbox" checked={form.enabled} onChange={handleChange} className="mt-1" /><span><span className="font-semibold text-slate-900">Enabled</span><span className="mt-1 block text-xs text-slate-500">Controls whether this module is active for normal users.</span></span></label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3"><LayoutDashboard className="mt-0.5 text-blue-600" size={20} /><div><h2 className="font-semibold text-slate-900">Preview</h2><p className="mt-1 text-sm text-slate-500">Current module behavior summary.</p></div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{isNativeModule ? "native" : form.moduleKind}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Order {Number(form.order) || 0}</span></div>
              <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">{form.name.trim() || "Untitled module"}</h3><p className="mt-1 break-all font-mono text-xs text-slate-500">{moduleId}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{form.description.trim() || "Module description preview."}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-500"><div>Section: <span className="font-semibold text-slate-700">{getSectionLabel(form.section, form.type)}</span></div><div>Route: <span className="break-all font-mono text-slate-700">{form.moduleKind === "embedded" ? internalRoute : targetUrl || "—"}</span></div>{form.moduleKind === "embedded" && <div>Embed: <span className="break-all font-mono text-slate-700">{form.embedUrl || "—"}</span></div>}<div className="flex flex-wrap gap-2 pt-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${form.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{form.enabled ? <Eye size={13} /> : <EyeOff size={13} />}{form.enabled ? "Enabled" : "Disabled"}</span><span className={`rounded-full px-2.5 py-1 font-semibold ${form.showOnDashboard ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{form.showOnDashboard ? "Dashboard" : "Not on Dashboard"}</span></div></div>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div className="text-sm text-slate-500">Managing <span className="font-semibold text-slate-900">{form.name.trim() || moduleId}</span></div><div className="flex items-center gap-3"><Link href="/admin/modules" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</button></div></div></div>
    </form>
  );
}

export default function EditModulePage() {
  return (
    <AdminGuard>
      <EditModuleContent />
    </AdminGuard>
  );
}
