import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared/layout/Navbar";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main className="pb-10">{children ?? <Outlet />}</main>
    </div>
  );
}

export default MainLayout;