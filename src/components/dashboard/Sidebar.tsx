"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Store,
  LogOut,
  Building2,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const adminMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Building2, label: "Manajemen Tenant", href: "/dashboard/tenants" },
    { icon: CreditCard, label: "Langganan", href: "/dashboard/subscriptions" },
    { icon: ShieldCheck, label: "Sistem", href: "/dashboard/system" },
  ];

  const tenantMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
    { icon: ShoppingCart, label: "Transaksi", href: "/dashboard/transactions" },
    { icon: BarChart3, label: "Laporan", href: "/dashboard/reports" },
  ];

  const menuItems = isSuperAdmin ? adminMenu : tenantMenu;

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <Store className="h-6 w-6 text-blue-600 mr-2" />
        <span className="text-xl font-bold tracking-tight">UMKM-Flow</span>
      </div>
      
      <div className="px-6 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {isSuperAdmin ? "Platform Owner" : "Shop Management"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5",
                isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
          )}
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Keluar
        </button>
      </div>
    </div>
  );
}
