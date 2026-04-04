import { useState, useEffect } from "react";

export function useResponsiveColumns() {
  const [columnCount, setColumnCount] = useState(5);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumnCount(2);
      } else if (width < 768) {
        setColumnCount(3);
      } else if (width < 1024) {
        setColumnCount(4);
      } else {
        setColumnCount(5);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return columnCount;
}
