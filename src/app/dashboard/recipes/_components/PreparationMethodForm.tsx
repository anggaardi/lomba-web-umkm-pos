import React from "react";
import { BookOpen } from "lucide-react";

interface PreparationMethodFormProps {
  preparationMethod: string;
  setPreparationMethod: (val: string) => void;
}

export function PreparationMethodForm({
  preparationMethod,
  setPreparationMethod,
}: PreparationMethodFormProps) {
  return (
    <div className="lg:col-span-8 xl:col-span-12 bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          <BookOpen className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
          Preparation Method
        </h3>
      </div>
      <textarea
        value={preparationMethod}
        onChange={(e) => setPreparationMethod(e.target.value)}
        placeholder="Describe the steps to prepare this recipe..."
        className="w-full min-h-[160px] bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium text-base resize-none border"
      />
    </div>
  );
}
