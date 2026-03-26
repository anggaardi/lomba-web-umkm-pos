"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableSearchProps {
  onSearch?: (query: string) => void;
  onActiveChange?: (isActive: boolean) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export function ExpandableSearch({
  onSearch,
  onActiveChange,
  placeholder = "Cari...",
  className,
  initialQuery = "",
}: ExpandableSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    onActiveChange?.(isOpen);
  }, [isOpen, onActiveChange]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setQuery("");
      onSearch?.("");
    } else {
      setIsOpen(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <div
        className={cn(
          "flex items-center transition-all duration-300 ease-in-out",
          isOpen ? "w-full bg-gray-50 rounded-2xl px-3 py-1.5" : "w-10 justify-center"
        )}
      >
        <button
          onClick={handleToggle}
          className={cn(
            "p-2 text-gray-500 hover:text-gray-900 transition-colors shrink-0",
            isOpen ? "-ml-1" : ""
          )}
          aria-label={isOpen ? "Tutup pencarian" : "Buka pencarian"}
        >
          {isOpen ? <ArrowLeft className="h-5 w-5" /> : <Search className="h-6 w-6" />}
        </button>

        {isOpen && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-gray-400 placeholder:font-medium shadow-none"
          />
        )}

        {isOpen && query && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
