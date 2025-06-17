import React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { HeaderWrapper } from "@/components/shared/header-wrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderWrapper />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
