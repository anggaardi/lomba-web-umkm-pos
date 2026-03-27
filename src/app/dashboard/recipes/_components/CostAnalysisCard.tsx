import React from "react";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CostAnalysisCardProps {
  ingredientCost: number;
  laborEstimate: number;
  setLaborEstimate: (val: number) => void;
  totalProductionCost: number;
  isDark?: boolean;
}

export function CostAnalysisCard({
  ingredientCost,
  laborEstimate,
  setLaborEstimate,
  totalProductionCost,
  isDark = true,
}: CostAnalysisCardProps) {
  const containerClass = isDark
    ? "bg-[#0F172A] rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20"
    : "bg-white rounded-3xl p-8 text-slate-800 shadow-sm border border-slate-100";

  const labelClass = isDark ? "text-slate-400" : "text-slate-500";
  const borderClass = isDark ? "border-white/5" : "border-slate-100";
  const subValueClass = isDark ? "text-white" : "text-slate-900";
  const totalValueClass = isDark ? "text-white" : "text-primary";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3 mb-8">
        <div className={isDark ? "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white" : "w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary"}>
          <DollarSign className="w-4 h-4" />
        </div>
        <h3 className={`font-bold uppercase tracking-widest text-[13px] ${isDark ? "opacity-80" : ""}`}>
          Cost Analysis
        </h3>
      </div>

      <div className="space-y-6">
        <div className={`flex items-center justify-between border-b ${borderClass} pb-4`}>
          <span className={`text-sm font-medium ${labelClass}`}>
            Ingredient Cost
          </span>
          <span className={`text-base font-bold ${subValueClass}`}>
            {formatCurrency(ingredientCost)}
          </span>
        </div>

        <div className={`flex items-center justify-between border-b ${borderClass} pb-4`}>
          <span className={`text-sm font-medium ${labelClass}`}>
            Labor Estimate
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rp</span>
            <input
              type="number"
              value={laborEstimate}
              onChange={(e) => setLaborEstimate(Number(e.target.value))}
              className={`w-24 bg-transparent border-none p-0 text-right text-base font-bold ${subValueClass} focus:ring-0 outline-none`}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-black uppercase tracking-wider ${labelClass}`}>
              Total Production Cost
            </span>
            <span className={`text-2xl font-black ${totalValueClass}`}>
              {formatCurrency(totalProductionCost)}
            </span>
          </div>
          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"} font-medium italic`}>
            Total cost is automatically calculated based on ingredient
            composition and labor estimate.
          </p>
        </div>
      </div>
    </div>
  );
}
