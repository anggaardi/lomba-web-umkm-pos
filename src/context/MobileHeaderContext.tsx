"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileHeaderState {
  title: string | null;
  backUrl: string | null;
  subTitle?: string | null;
  searchQuery: string;
}

interface MobileHeaderContextValue extends MobileHeaderState {
  setDetailHeader: (title: string, backUrl: string, subTitle?: string) => void;
  clearDetailHeader: () => void;
  onSearchChange: (query: string) => void;
  registerSearchHandler: (handler: (q: string) => void) => void;
  clearSearchHandler: () => void;
}

const MobileHeaderContext = createContext<MobileHeaderContextValue>({
  title: null,
  backUrl: null,
  subTitle: null,
  searchQuery: "",
  setDetailHeader: () => {},
  clearDetailHeader: () => {},
  onSearchChange: () => {},
  registerSearchHandler: () => {},
  clearSearchHandler: () => {},
});

export function MobileHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<MobileHeaderState>({
    title: null,
    backUrl: null,
    subTitle: null,
    searchQuery: "",
  });

  const searchHandlerRef = useRef<((q: string) => void) | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setState((prev) => ({ ...prev, searchQuery: "" }));
    if (searchHandlerRef.current) searchHandlerRef.current("");
  }, [pathname]);

  const setDetailHeader = useCallback((title: string, backUrl: string, subTitle?: string) => {
    setState((prev) => ({ ...prev, title, backUrl, subTitle }));
  }, []);

  const clearDetailHeader = useCallback(() => {
    setState((prev) => ({ ...prev, title: null, backUrl: null, subTitle: null }));
  }, []);

  const onSearchChange = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchHandlerRef.current?.(query);
    }, 150);
  }, []);

  const registerSearchHandler = useCallback((handler: (q: string) => void) => {
    searchHandlerRef.current = handler;
  }, []);

  const clearSearchHandler = useCallback(() => {
    searchHandlerRef.current = null;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setState((prev) => ({ ...prev, searchQuery: "" }));
  }, []);

  return (
    <MobileHeaderContext.Provider
      value={{
        ...state,
        setDetailHeader,
        clearDetailHeader,
        onSearchChange,
        registerSearchHandler,
        clearSearchHandler,
      }}
    >
      {children}
    </MobileHeaderContext.Provider>
  );
}

export function useMobileHeader() {
  return useContext(MobileHeaderContext);
}
