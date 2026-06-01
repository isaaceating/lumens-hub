"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getModuleById } from "@/lib/modules";
import { useUserProfile } from "@/lib/useUserProfile";

export default function ModuleRendererPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const { profile, loading: profileLoading } = useUserProfile();

  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      const data = await getModuleById(moduleId);
      setModule(data);
      setLoading(false);
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  if (loading || profileLoading) {
    return <div className="text-slate-500">Loading module...</div>;
  }

  if (!module) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Module not found.
      </div>
    );
  }

  const enabledModules = profile?.enabledModules || [];
  const hasAccess = enabledModules.includes(moduleId);

  if (!hasAccess) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="mt-2">
          You do not have permission to access this module.
        </p>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (module.enabled === false) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-700">
        This module is currently disabled.
      </div>
    );
  }

  if (module.moduleKind === "external") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{module.name}</h1>
        <p className="mt-2 text-slate-600">
          This module opens in a new browser tab.
        </p>

        <a
          href={module.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open {module.name}
        </a>
      </div>
    );
  }

  if (module.moduleKind === "embedded") {
    if (!module.embedUrl) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Missing Embed URL.
        </div>
      );
    }

    return (
      <div className="-m-8 h-[calc(100vh-64px)]">
        <iframe
          src={module.embedUrl}
          title={module.name}
          className="h-full w-full border-0 bg-white"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{module.name}</h1>
      <p className="mt-2 text-slate-600">
        This is a native Lumens HUB module.
      </p>

      <Link
        href={module.href}
        className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Open Module
      </Link>
    </div>
  );
}