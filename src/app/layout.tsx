import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AuthGuard from "./components/AuthGuard";

export const metadata: Metadata = {
  title: "Lumens Portal",
  description: "Lumens unified portal for resources, training, and workspaces",
};

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

            <main className="min-w-0 flex-1">
              <Header />
              <section className="p-8">
                <AuthGuard>{children}</AuthGuard>
              </section>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}