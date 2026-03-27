"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Box,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Code2,
  GitBranch,
  Store,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Session } from "next-auth";

export function Sidebar({
  session: initialSession,
}: {
  session?: Session | null;
}) {
  const pathname = usePathname();
  const { data: clientSession } = useSession();
  const session = initialSession || clientSession;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const adminMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Building2, label: "Corporate", href: "/dashboard/tenants" },
    { icon: ScrollText, label: "System Log", href: "/dashboard/subscriptions" },
    { icon: Code2, label: "API Log", href: "/dashboard/system" },
    { type: "header", label: "CORPORATE MANAGEMENT" },
    { icon: GitBranch, label: "Branches", href: "#" },
    { icon: Store, label: "Merchants", href: "#" },
    { icon: Flag, label: "Feature Flags", href: "#" },
  ];

  const tenantMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MonitorSmartphone, label: "POS Kasir", href: "/dashboard/pos" },
    { icon: Box, label: "Inventory", href: "/dashboard/inventory" },
    { icon: ScrollText, label: "Resep Produk", href: "/dashboard/recipes" },
    { icon: ShoppingCart, label: "Transaksi", href: "/dashboard/transactions" },
    { icon: BarChart3, label: "Laporan", href: "/dashboard/reports" },
  ];

  const menuItems = isSuperAdmin ? adminMenu : tenantMenu;

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-primary transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-20 items-center overflow-hidden mb-6 mt-4",
          isCollapsed ? "justify-center px-0" : "px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-xl">
            P
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-white truncate">
              POS System
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 py-4">
        {menuItems.map((item, index) => {
          if ("type" in item && item.type === "header") {
            return (
              !isCollapsed && (
                <div key={index} className="px-6 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    {item.label}
                  </p>
                </div>
              )
            );
          }

          const isActive = "href" in item && pathname === item.href;
          if (!("href" in item)) return null;

          return (
            <Link
              key={"label" in item ? item.label : index}
              href={"href" in item ? (item.href as string) : "#"}
              className={cn(
                "group relative flex items-center py-3 transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-6",
                isActive
                  ? "bg-primary-light text-primary rounded-l-full ml-4 shadow-lg"
                  : "text-white hover:bg-[#813531]/20"
              )}
            >
              {/* Active indicator bar or shape if needed, but image shows rounded white background */}
              {item.icon && (
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-white group-hover:scale-110",
                    !isCollapsed && "mr-4"
                  )}
                />
              )}

              {!isCollapsed && (
                <span className="text-sm font-semibold tracking-wide">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && item.label && (
                <div className="absolute left-full ml-2 hidden rounded bg-[#813531] px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div
        className={cn(
          "border-t border-white/20 p-4 space-y-2",
          isCollapsed ? "flex flex-col items-center" : ""
        )}
      >
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center text-white/80 hover:text-white transition-colors py-2",
            isCollapsed ? "justify-center" : "px-2"
          )}
        >
          <Settings className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center text-white/80 hover:text-white transition-colors py-2",
            isCollapsed ? "justify-center" : "px-2"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="text-sm">Keluar</span>}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex w-full items-center text-white/80 hover:text-white transition-colors py-2 mt-2",
            isCollapsed ? "justify-center" : "px-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          ) : (
            <ChevronLeft className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          )}
          {!isCollapsed && <span className="text-sm">Tutup Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
