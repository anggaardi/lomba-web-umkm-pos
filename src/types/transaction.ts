// Shared TypeScript types for the Transactions feature.
// Used by both server (page.tsx) and client (TransactionsClient.tsx).

export type TransactionStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "VOIDED";
export type PaymentMethod = "CASH" | "CARD" | "QRIS";
export type TransactionType = "OFFLINE" | "ONLINE";

export type TransactionItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime: number;
  subtotal: number;
};

/** Data ringkas untuk satu baris di tabel riwayat transaksi. */
export type TransactionSummary = {
  id: string;
  transactionNumber?: string | null;
  createdAt: string; // ISO string
  status: TransactionStatus;
  paymentMethod: string;
  type: TransactionType;
  totalAmount: number;
  branchName: string | null;
};

/** Data lengkap untuk panel detail transaksi, termasuk item pesanan. */
export type TransactionDetail = TransactionSummary & {
  cashierName: string | null;
  items: TransactionItem[];
  breakdown: {
    subtotal: number;
    // Reserved for future service charge and tax display
  };
};

export type PaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};
