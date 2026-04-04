"use client";

import Link from "next/link";
import {
  Bell,
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
    // Generate breadcrumbs for Super Admin
    const breadcrumbs: Array<{ label: string; href: string }> = [
      { label: "Management", href: "/dashboard" }
    ];
    
    if (pathname.includes("/tenants")) {
      breadcrumbs.push({ label: "Corporate", href: "/dashboard/tenants" });
    } else if (pathname.includes("/subscriptions")) {
      breadcrumbs.push({ label: "System Log", href: "/dashboard/subscriptions" });
    } else if (pathname.includes("/system")) {
      breadcrumbs.push({ label: "API Log", href: "/dashboard/system" });
    } else if (pathname.includes("/branches")) {
      breadcrumbs.push({ label: "Branches", href: "/dashboard/branches" });
    } else if (pathname.includes("/merchants")) {
      breadcrumbs.push({ label: "Merchants", href: "/dashboard/merchants" });
    } else if (pathname.includes("/feature-flags")) {
      breadcrumbs.push({ label: "Feature Flags", href: "/dashboard/feature-flags" });
    } else if (pathname.includes("/settings")) {
      breadcrumbs.push({ label: "Settings", href: "/dashboard/settings" });
    } else if (pathname === "/dashboard") {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
    }

    return (
      <header className="h-20 w-full bg-white items-center justify-between px-8 sticky top-0 z-30 border-b border-gray-200 hidden md:flex">
        <div className="flex items-center text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-slate-300">›</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-slate-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
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

  // Generate breadcrumbs for Admin (Tenant)
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: "Dashboard", href: "/dashboard" }
  ];
  
  if (pathname.includes("/pos")) {
    breadcrumbs.push({ label: "POS Kasir", href: "/dashboard/pos" });
  } else if (pathname.includes("/inventory")) {
    breadcrumbs.push({ label: "Inventory", href: "/dashboard/inventory" });
  } else if (pathname.includes("/recipes")) {
    breadcrumbs.push({ label: "Resep Produk", href: "/dashboard/recipes" });
    if (pathname.includes("/recipes/new")) {
      breadcrumbs.push({ label: "Tambah Resep", href: pathname });
    } else if (pathname.includes("/edit") || (pathname.match(/\/recipes\/[^/]+/) && !pathname.endsWith("/recipes"))) {
      breadcrumbs.push({ label: "Edit Resep", href: pathname });
    }
  } else if (pathname.includes("/transactions")) {
    breadcrumbs.push({ label: "Transaksi", href: "/dashboard/transactions" });
    if (pathname.match(/\/transactions\/[^/]+$/)) {
      breadcrumbs.push({ label: "Detail Transaksi", href: pathname });
    }
  } else if (pathname.includes("/reports")) {
    breadcrumbs.push({ label: "Laporan", href: "/dashboard/reports" });
  } else if (pathname.includes("/settings")) {
    breadcrumbs.push({ label: "Settings", href: "/dashboard/settings" });
  }

  return (
    <header className="h-20 w-full bg-white items-center justify-between px-8 sticky top-0 z-30 border-b border-gray-200 hidden md:flex">
      <div className="flex items-center text-sm text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-slate-300">›</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-slate-900">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <button className="p-3 text-gray-500 hover:bg-primary-light rounded-xl transition-colors relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary rounded-full border-2 border-white"></span>
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
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            {session?.user?.name?.[0]?.toUpperCase() || (
              <User className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
