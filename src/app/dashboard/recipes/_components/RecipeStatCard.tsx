import React from "react";
import { cn } from "@/lib/utils";

interface RecipeStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}

export function RecipeStatCard({ 
  icon: Icon, 
  label, 
  value, 
  iconBg, 
  iconColor 
}: RecipeStatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg, iconColor)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
