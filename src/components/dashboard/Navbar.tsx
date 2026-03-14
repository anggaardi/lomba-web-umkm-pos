"use client";

import {
  Bell,
  Search,
  User,
  ExternalLink,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { Session } from "next-auth";

export function Navbar({
  session: initialSession,
}: {
  session?: Session | null;
}) {
  const { data: clientSession } = useSession();
  const session = initialSession || clientSession;
  const pathname = usePathname();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  if (isSuperAdmin) {
    // Generate simple breadcrumbs for Super Admin
    let breadcrumbTitle = "Dashboard";
    if (pathname.includes("/tenants")) breadcrumbTitle = "Tenants List";
    if (pathname.includes("/subscriptions")) breadcrumbTitle = "Subscriptions";
    if (pathname.includes("/system")) breadcrumbTitle = "System";

    return (
      <header className="h-20 w-full bg-white flex items-center justify-between px-8 sticky top-0 z-30 border-b border-gray-200">
        <div className="flex items-center text-sm text-slate-500">
          <span>Management</span>
          <span className="mx-2 text-slate-300">›</span>
          <span className="font-semibold text-slate-900">
            {breadcrumbTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            <ExternalLink className="w-4 h-4" />
            Open Tenant
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#C3272B] text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                SELECTED TENANT
              </span>
              <span className="text-sm font-bold text-slate-800">
                JEEVAWASA
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-20 w-full bg-white flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-12 text-sm text-gray-900 border-0 rounded-xl bg-[#FFEFEB]/50 focus:ring-2 focus:ring-[#FF724C] focus:outline-none transition-all"
            placeholder="Search activities, products..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="p-3 text-gray-500 hover:bg-[#FFEFEB] rounded-xl transition-colors relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-[#FF724C] rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {session?.user?.role?.toLowerCase().replace("_", " ") || "Member"}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#FF724C] flex items-center justify-center text-white font-bold shadow-lg shadow-[#FF724C]/20">
            {session?.user?.name?.[0]?.toUpperCase() || (
              <User className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
