"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import EmbeddedModuleFrame from "@/components/EmbeddedModuleFrame";
import { signInWithGoogle } from "@/lib/auth";
import { getModuleById } from "@/lib/modules";
import { useUserProfile } from "@/lib/useUserProfile";

const isKnowledgeCenterModule = (module: any) => {
  const moduleId = String(module?.id || "").toLowerCase();
  const moduleName = String(module?.name || "").toLowerCase();
  const embedUrl = String(module?.embedUrl || "").toLowerCase();

  return (
    moduleId.includes("knowledge") ||
    moduleName.includes("knowledge") ||
    moduleName.includes("知識") ||
    embedUrl.includes("script.google.com")
  );
};

const getKnowledgeCenterAuditEnabled = (module: any, profile: any) => {
  if (!isKnowledgeCenterModule(module)) return false;

  return (
    profile?.knowledgeCenterAuditEnabled === true ||
    profile?.auditSettings?.knowledgeCenter === true
  );
};

const getUsageRole = (profile: any) => {
  const jobRole = String(profile?.jobRole || "").trim();
  const customJobRole = String(profile?.customJobRole || "").trim();

  if (jobRole === "Other" && customJobRole) {
    return customJobRole;
  }

  return (
    jobRole ||
    String(profile?.department || "").trim() ||
    String(profile?.role || "").trim()
  );
};

const isGoogleAppsScriptEmbed = (module: any) => {
  const embedUrl = String(module?.embedUrl || "");

  return embedUrl.includes("script.google.com");
};

const getEmbeddedInitialHeight = (module: any) => {
  if (isGoogleAppsScriptEmbed(module)) {
    return `${Number(module?.embedHeight) || 1200}px`;
  }

  return "calc(100vh - 64px)";
};

const buildEmbeddedModuleSrc = ({
  src,
  module,
  user,
  profile,
}: {
  src: string;
  module: any;
  user: any;
  profile: any;
}) => {
  if (!src) return "";

  const auditEnabled = getKnowledgeCenterAuditEnabled(module, profile);

  const params: Record<string, string> = {
    source: "portal",
    email: String(profile?.email || user?.email || ""),
    name: String(profile?.name || user?.displayName || ""),
    accountType: String(profile?.accountType || ""),
    role: getUsageRole(profile),
    region: String(profile?.region || ""),
    department: String(profile?.department || ""),
    audit: auditEnabled ? "1" : "0",
  };

  try {
    const url = new URL(src);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== "") {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch {
    const query = new URLSearchParams(params).toString();
    const separator = src.includes("?") ? "&" : "?";

    return `${src}${separator}${query}`;
  }
};

export default function ModuleRendererPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  const { user, profile, loading: profileLoading } = useUserProfile();

  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;

      try {
        const data = await getModuleById(moduleId);
        setModule(data);
      } catch (error) {
        console.error("Failed to load module:", error);
        setModule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <div className="text-sm text-slate-500">Loading resource...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login required</h1>
        <p className="mt-3 text-slate-600">
          Please sign in with an authorized Google account to access this
          resource.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Login with Google
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Resource not found
        </h1>
        <p className="mt-3 text-slate-600">
          This resource does not exist or has been removed.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const enabledModules = profile?.enabledModules || [];
  const hasAccess = enabledModules.includes(moduleId);

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">Access denied</h1>
        <p className="mt-3 text-red-700">
          Your account does not have permission to access this resource.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (module.enabled === false) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-yellow-800">
          Resource unavailable
        </h1>
        <p className="mt-3 text-yellow-700">
          This resource is currently disabled.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (module.moduleKind === "external") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{module.name}</h1>
        <p className="mt-2 text-slate-600">
          This resource opens in a new browser tab.
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
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">Missing Embed URL</h1>
          <p className="mt-3 text-red-700">
            This embedded resource has not been configured correctly.
          </p>
        </div>
      );
    }

    const embeddedSrc = buildEmbeddedModuleSrc({
      src: module.embedUrl,
      module,
      user,
      profile,
    });

    const autoResize = isGoogleAppsScriptEmbed(module);

    return (
      <div className="-m-8 bg-white">
        <EmbeddedModuleFrame
          title={module.name || "Embedded Module"}
          src={embeddedSrc}
          height={getEmbeddedInitialHeight(module)}
          autoResize={autoResize}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{module.name}</h1>
      <p className="mt-2 text-slate-600">
        This module type is not supported yet.
      </p>
    </div>
  );
}
