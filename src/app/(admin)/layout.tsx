"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isScholarDetailPage = pathname.startsWith('/scholars/') && pathname !== '/scholars';

  return (
    <div className="flex min-h-screen">
      {!isScholarDetailPage && <Sidebar />}
      <div className={`flex-1 transition-all duration-300 ${!isScholarDetailPage ? 'ml-[260px] peer-data-[collapsed=true]:ml-[72px]' : ''}`}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
