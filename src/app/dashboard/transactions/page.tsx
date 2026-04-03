import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import TransactionsClient from "./TransactionsClient";
import type { TransactionSummary, PaginationMeta } from "@/types/transaction";

export const dynamic = "force-dynamic";

const INITIAL_LIMIT = 20;

export default async function TransactionsPage() {
  try {
    // Auth guard: ensures user is logged in and has an active tenant.
    // If this throws, we redirect to /login below.
    await requireTenant();
  } catch {
    redirect("/login");
  }

  // SSR: fetch the first page of transactions server-side for instant display.
  // Cookie forwarding is required so the API route can read the session.
  let initialTransactions: TransactionSummary[] = [];
  let initialPagination: PaginationMeta = {
    total: 0,
    page: 1,
    totalPages: 0,
    limit: INITIAL_LIMIT,
  };

  try {
    const cookieStore = await cookies();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/dashboard/transactions?page=1&limit=${INITIAL_LIMIT}`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      initialTransactions = data.transactions ?? [];
      initialPagination = data.pagination ?? initialPagination;
    }
  } catch (error) {
    // If the SSR fetch fails (e.g. DB timeout), render the page with empty state.
    // The client component can retry via its own fetch on mount.
    console.error("SSR transactions fetch failed, rendering with empty state:", error);
  }

  return (
    <div className="container mx-auto py-6">
      <TransactionsClient
        initialTransactions={initialTransactions}
        initialPagination={initialPagination}
      />
    </div>
  );
}
