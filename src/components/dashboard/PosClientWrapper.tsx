"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { PosClientProps } from "@/types/pos";

const PosClientDynamic = dynamic(
  () => import("./PosClient").then((mod) => mod.PosClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    ),
  }
);

export function PosClientWrapper(props: PosClientProps) {
  return <PosClientDynamic {...props} />;
}
