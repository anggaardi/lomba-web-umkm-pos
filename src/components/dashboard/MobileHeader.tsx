"use client";

import React, { useState, useEffect } from "react";
import { Bell, User, Menu, X, MonitorSmartphone, ScrollText, BarChart3, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const secondaryMenu = [
    { icon: MonitorSmartphone, label: "POS Kasir", href: "/dashboard/pos" },
    { icon: ShoppingCart, label: "Transaksi", href: "/dashboard/transactions" },
    { icon: BarChart3, label: "Laporan", href: "/dashboard/reports" },
  ];

  return (
    <>
      <header 
        className={cn(
          "h-20 w-full bg-white flex items-center justify-between px-6 sticky top-0 z-40 lg:hidden transition-all duration-300",
          isScrolled ? "shadow-md" : "border-b border-gray-50"
        )}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <h1 className="text-xl font-bold text-[#FF724C]">
            Artisan Production
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 bg-gray-50 rounded-full relative transition-colors hover:bg-gray-100">
            <Bell className="h-6 w-6" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#FF724C] rounded-full border-2 border-white"></span>
          </button>
          <div className="h-9 w-9 rounded-full border border-gray-100 flex items-center justify-center font-bold text-[#FF724C] overflow-hidden">
             {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
             ) : (
              <User className="h-5 w-5" />
             )}
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden pt-20">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white border-b border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top-full duration-300">
            <div className="p-4 space-y-2">
              <p className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">Akses Cepat</p>
              {secondaryMenu.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#FFEFEB] hover:text-[#FF724C] rounded-2xl transition-all"
                >
                  <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-medium text-gray-400 px-4 text-center italic">
                Menu ini berisi fitur tambahan yang jarang dibuka melalui dashboard utama.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
