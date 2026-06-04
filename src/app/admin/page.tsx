"use client";

import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";

const adminCards = [
  {
    title: "User Management",
    description: "Manage user roles and resource permissions.",
    href: "/admin/users",
  },
  {
    title: "Module Management",
    description: "Manage available Lumens Portal resources.",
    href: "/admin/modules",
  },
  {
    title: "Training Management",
    description: "Create reusable training programs, levels, courses, and lessons.",
    href: "/admin/training",
  },
];

function AdminHomeContent() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Manage Lumens Portal users, modules, training, and permissions.
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
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminHomeContent />
    </AdminGuard>
  );
}