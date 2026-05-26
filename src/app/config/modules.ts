export type ModuleType = "core" | "feature" | "admin";

export interface ModuleItem {
  id: string;
  name: string;
  href: string;
  type: ModuleType;
  showOnDashboard?: boolean;
}

export const modules: ModuleItem[] = [
  {
    id: "dashboard",
    name: "Home",
    href: "/dashboard",
    type: "core",
  },
  {
  id: "training",
  name: "Certification",
  href: "/training",
  type: "feature",
  showOnDashboard: true,
  },
  {
    id: "admin",
    name: "Admin Home",
    href: "/admin",
    type: "admin",
  },
  {
    id: "users",
    name: "Users",
    href: "/admin/users",
    type: "admin",
  },
  {
    id: "modules",
    name: "Modules",
    href: "/admin/modules",
    type: "admin",
  },
  {
  id: "courses",
  name: "Courses",
  href: "/admin/courses",
  type: "admin",
  },
];