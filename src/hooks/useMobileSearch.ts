"use client";

import { useEffect, useCallback } from "react";
import { useMobileHeader } from "@/context/MobileHeaderContext";


export function useMobileSearch(handler: (query: string) => void): string {
  const { registerSearchHandler, clearSearchHandler, searchQuery } = useMobileHeader();

  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    registerSearchHandler(stableHandler);
    return () => {
      clearSearchHandler();
    };
  }, [stableHandler, registerSearchHandler, clearSearchHandler]);

  return searchQuery;
}
