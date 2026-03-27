"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Menu,
  X,
  MonitorSmartphone,
  ScrollText,
  BarChart3,
  ShoppingCart,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMobileHeader } from "@/context/MobileHeaderContext";
import { ExpandableSearch } from "./ExpandableSearch";

interface SessionUser {
  tenantSlug?: string;
}

export function MobileHeader() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { title, backUrl, subTitle, clearDetailHeader, onSearchChange } = useMobileHeader();

  const handleSearchActiveChange = useCallback((active: boolean) => {
    setIsSearchActive(active);
    if (!active) onSearchChange("");
  }, [onSearchChange]);

  const isDetailMode = !!(title && backUrl);

  useEffect(() => {
    const mainEl = document.querySelector("[data-scroll-container]");
    if (!mainEl) return;
    const handleScroll = () => {
      setIsScrolled((mainEl as HTMLElement).scrollTop > 20);
    };
    mainEl.addEventListener("scroll", handleScroll);
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDetailMode) setIsMenuOpen(false);
  }, [isDetailMode]);

  const tenantSlug = (session?.user as SessionUser)?.tenantSlug;

  const secondaryMenu = [
    { icon: MonitorSmartphone, label: "POS Kasir", href: "/dashboard/pos" },
    { icon: ShoppingCart, label: "Transaksi", href: "/dashboard/transactions" },
    { icon: BarChart3, label: "Laporan", href: "/dashboard/reports" },
    ...(tenantSlug ? [{ 
      icon: ExternalLink, 
      label: "Lihat Toko Online", 
      href: `/s/${tenantSlug}`,
      target: "_blank" as const
    }] : []),
  ];

  return (
    <>
      <header
        className={cn(
          "h-16 w-full bg-white flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40 lg:hidden transition-all duration-300",
          isScrolled ? "shadow-md" : "border-b border-gray-100"
        )}
      >
        {!isDetailMode ? (
          <>
            <div className={cn("flex items-center gap-3", isSearchActive ? "hidden" : "flex")}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                {pathname.startsWith("/dashboard/recipes")
                  ? "Recipe Manager"
                  : "Artisan Production"}
              </h1>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isSearchActive ? "w-full" : "shrink-0"
              )}
            >
              <ExpandableSearch
                onActiveChange={handleSearchActiveChange}
                onSearch={onSearchChange}
                className={isSearchActive ? "w-full" : ""}
                placeholder="Cari sesuatu..."
              />

              {!isSearchActive && (
                <>
                  <button className="p-2 text-gray-400 bg-gray-50 rounded-full relative transition-colors hover:bg-gray-100">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary rounded-full border-2 border-white" />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => {
                clearDetailHeader();
                router.push(backUrl!);
              }}
                className="flex items-center justify-center p-2 -ml-2 text-gray-500 hover:text-primary transition-colors shrink-0 group"
                aria-label="Kembali"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                  {subTitle || "Detail Resep"}
                </p>
                <h1 className="text-base font-black text-gray-900 truncate leading-tight">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 text-gray-400 bg-gray-50 rounded-full relative transition-colors hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-white" />
              </button>
            </div>
          </>
        )}
      </header>

      {isMenuOpen && !isDetailMode && (
        <div className="fixed inset-0 z-30 lg:hidden pt-16">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white border-b border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top-full duration-300">
            <div className="p-4 space-y-2">
              <p className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Akses Cepat
              </p>
              {secondaryMenu.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.target}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary-light hover:text-primary rounded-2xl transition-all"
                >
                  <div className="p-2 bg-gray-50 rounded-xl transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-medium text-gray-400 px-4 text-center italic">
                Menu ini berisi fitur tambahan yang jarang dibuka melalui
                dashboard utama.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
