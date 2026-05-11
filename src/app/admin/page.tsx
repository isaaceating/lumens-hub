"use client";

import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";

const adminCards = [
  {
    title: "User Management",
    description: "Manage user roles and module permissions.",
    href: "/admin/users",
  },
  {
    title: "Module Management",
    description: "Manage available Lumens HUB modules.",
    href: "/admin/modules",
  },
  {
  title: "Course Management",
  description: "Create and manage training courses.",
  href: "/admin/courses",
  },
];

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Manage Lumens HUB users, modules, and permissions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {adminCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}