import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lumens HUB",
  description: "Lumens unified enterprise platform",
};

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Sales Training", href: "/training" },
  { name: "Admin", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Modules", href: "/admin/modules" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-100 text-slate-900">
          <div className="flex min-h-screen">
            <aside className="w-64 bg-slate-950 text-white">
              <div className="border-b border-slate-800 px-6 py-5">
                <h1 className="text-xl font-bold">Lumens HUB</h1>
                <p className="mt-1 text-sm text-slate-400">v0 Platform</p>
              </div>

              <nav className="p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Modules
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </aside>

            <main className="flex-1">
              <header className="border-b border-slate-200 bg-white px-8 py-4">
                <div className="text-sm text-slate-500">
                  Lumens Digital Operation System
                </div>
              </header>

              <section className="p-8">{children}</section>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}