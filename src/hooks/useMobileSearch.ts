import { useEffect, useCallback } from "react";
import { useMobileHeader } from "@/context/MobileHeaderContext";


export function useMobileSearch(handler: (query: string) => void): string {
  const { registerSearchHandler, clearSearchHandler, searchQuery } = useMobileHeader();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Intentionally stable: handler is memoized by the calling component via useCallback
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    registerSearchHandler(stableHandler);
    return () => {
      clearSearchHandler();
    };
  }, [stableHandler, registerSearchHandler, clearSearchHandler]);

  return searchQuery;
}
