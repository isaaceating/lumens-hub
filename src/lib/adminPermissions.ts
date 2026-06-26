export type AdminModuleKey = "users" | "modules" | "news" | "training";

export type AdminModuleOption = {
  id: AdminModuleKey;
  label: string;
  description: string;
};

export const adminModuleOptions: AdminModuleOption[] = [
  {
    id: "users",
    label: "Users",
    description: "Manage user profiles, roles, regions, modules, and admin access.",
  },
  {
    id: "modules",
    label: "Modules",
    description: "Manage Portal modules and dashboard visibility.",
  },
  {
    id: "news",
    label: "News",
    description: "Create and edit portal news posts.",
  },
  {
    id: "training",
    label: "Training",
    description: "Manage training programs, lessons, materials, and quizzes.",
  },
];

export const adminModuleLabels = adminModuleOptions.reduce(
  (labels, option) => ({ ...labels, [option.id]: option.label }),
  {} as Record<AdminModuleKey, string>
);

export const getAdminModules = (profile: any): AdminModuleKey[] => {
  if (!profile || profile.role !== "admin") return [];

  // Backward compatibility: existing admin users without adminModules keep full access.
  if (!Array.isArray(profile.adminModules)) {
    return adminModuleOptions.map((option) => option.id);
  }

  return profile.adminModules.filter((module: string): module is AdminModuleKey =>
    adminModuleOptions.some((option) => option.id === module)
  );
};

export const canAccessAdminModule = (profile: any, moduleId?: AdminModuleKey) => {
  if (!profile || profile.role !== "admin") return false;
  if (!moduleId) return true;

  return getAdminModules(profile).includes(moduleId);
};
