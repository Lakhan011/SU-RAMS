"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px] transition-all duration-300 peer-data-[collapsed=true]:ml-[72px]">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
