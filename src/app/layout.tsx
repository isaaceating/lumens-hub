import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

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
            <Sidebar />

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