"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ScrollText, 
  Box, 
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileHeader } from "@/context/MobileHeaderContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { title, backUrl } = useMobileHeader();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isDetailMode = !!(title && backUrl);

  useEffect(() => {
    if (isDetailMode) return; 

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isDetailMode]);

  const navItems = [
    { icon: LayoutDashboard, label: "BERANDA", href: "/dashboard" },
    { icon: ScrollText, label: "RESEP", href: "/dashboard/recipes" },
    { icon: Box, label: "STOK", href: "/dashboard/inventory" },
    { icon: Settings, label: "PENGATURAN", href: "/dashboard/settings" },
  ];

  if (isDetailMode) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 lg:hidden transition-transform duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all",
              isActive ? "text-[#FF724C]" : "text-gray-400"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive ? "bg-[#FFEFEB]" : "bg-transparent"
            )}>
              <Icon className="h-6 w-6 font-bold" />
            </div>
            <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
