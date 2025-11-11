import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import LeftSidebar from "./LeftSideBar";
import RightSidebar from "./RightSideBar";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen text-slate-900 bg-slate-50">
      {/* Левая панель */}
      <LeftSidebar currentPath={location.pathname} />

      {/* Центральная часть */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* Правая панель */}
      <RightSidebar currentPath={location.pathname} />
    </div>
  );
}
