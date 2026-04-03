"use client";

import React, { useState, useCallback, useTransition } from "react";
import { 
  Search, Calendar, Download, FileText, ChevronDown,
  Banknote, CreditCard, Smartphone, X, Printer, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TransactionSummary,
  TransactionDetail,
  PaginationMeta,
} from "@/types/transaction";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("Rp", "Rp ");
}

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  return { time, date };
}

function getStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED": return "bg-[#E2F7ED] text-[#2D9B63]";
    case "PENDING":   return "bg-[#FEF6D9] text-[#D4A017]";
    case "CANCELLED": return "bg-[#FEEBEC] text-[#D84A4A]";
    case "VOIDED":    return "bg-gray-100 text-gray-400";
    default:          return "bg-gray-100 text-gray-500";
  }
}

function MethodIcon({ method, size = "md" }: { method: string; size?: "sm" | "md" }) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  switch (method) {
    case "CASH":  return <div className={cn("p-2 rounded-lg bg-[#FEF9E7] text-[#F2C94C]", size === "sm" && "p-0 bg-transparent")}><Banknote className={iconClass} /></div>;
    case "CARD":  return <div className={cn("p-2 rounded-lg bg-[#EBF5FB] text-[#2F80ED]", size === "sm" && "p-0 bg-transparent")}><CreditCard className={iconClass} /></div>;
    case "QRIS":  return <div className={cn("p-2 rounded-lg bg-[#FEEAEB] text-[#EB5757]", size === "sm" && "p-0 bg-transparent")}><Smartphone className={iconClass} /></div>;
    default:      return <div className="p-2 rounded-lg bg-gray-100 text-gray-400"><Banknote className={iconClass} /></div>;
  }
}

// --- Props ---

type Props = {
  initialTransactions: TransactionSummary[];
  initialPagination: PaginationMeta;
};

// --- Component ---

export default function TransactionsClient({ initialTransactions, initialPagination }: Props) {
  const [transactions, setTransactions] = useState<TransactionSummary[]>(initialTransactions);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<TransactionDetail | null>(null);
  const [isLoadingDetail, startDetailTransition] = useTransition();
  const [isLoadingList, startListTransition] = useTransition();
  const [voidError, setVoidError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- Data fetching helpers ---

  const fetchTransactions = useCallback(
    (overrides: { page?: number; search?: string; status?: string; start?: string; end?: string } = {}) => {
      startListTransition(async () => {
        const params = new URLSearchParams();
        params.set("page", String(overrides.page ?? 1));
        params.set("limit", "20");
        if (overrides.search ?? search) params.set("search", overrides.search ?? search);
        if (overrides.status ?? statusFilter) params.set("status", overrides.status ?? statusFilter);
        if (overrides.start ?? startDate) params.set("startDate", overrides.start ?? startDate);
        if (overrides.end ?? endDate) params.set("endDate", overrides.end ?? endDate);

        try {
          const res = await fetch(`/api/dashboard/transactions?${params.toString()}`);
          if (!res.ok) throw new Error("Gagal memuat transaksi");
          const data = await res.json();
          setTransactions(data.transactions ?? []);
          setPagination(data.pagination);
        } catch (err) {
          console.error("Fetch transactions error:", err);
        }
      });
    },
    [search, statusFilter, startDate, endDate]
  );

  const fetchDetail = useCallback((txId: string) => {
    setSelectedTxId(txId);
    setSelectedTxDetail(null);
    setVoidError(null);
    startDetailTransition(async () => {
      try {
        const res = await fetch(`/api/dashboard/transactions/${txId}`);
        if (!res.ok) throw new Error("Gagal memuat detail transaksi");
        const data = await res.json();
        setSelectedTxDetail(data.transaction);
      } catch (err) {
        console.error("Fetch detail error:", err);
        setSelectedTxId(null);
      }
    });
  }, []);

  const handleVoid = useCallback(async () => {
    if (!selectedTxId) return;
    setVoidError(null);
    try {
      const res = await fetch(`/api/pos/transactions/${selectedTxId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VOID" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal melakukan void");
      // Refetch list to get fresh state (safer than optimistic update for paginated data)
      await fetchTransactions();
      setSelectedTxId(null);
      setSelectedTxDetail(null);
    } catch (err) {
      setVoidError(err instanceof Error ? err.message : "Gagal melakukan void");
    }
  }, [selectedTxId, fetchTransactions]);

  // --- Filter handlers ---
  const handleFilter = useCallback(
    (newStatus?: string, newSearch?: string) => {
      fetchTransactions({ page: 1, status: newStatus, search: newSearch });
    },
    [fetchTransactions]
  );

  const pendingRevenue = transactions.reduce(
    (sum, t) => (t.status === "COMPLETED" ? sum + t.totalAmount : sum),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>Riwayat Transaksi</span>
            <span>•</span>
            <span>SmartBizFNB</span>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A]">
            Riwayat <span className="text-primary">Transaksi</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary border border-primary rounded-xl font-bold text-sm hover:bg-primary-light transition-all shadow-sm">
            <FileText className="h-4 w-4" />
            CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md">
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Date Range */}
          <div className="flex items-center gap-3 w-full lg:w-auto bg-gray-50/50 p-1 rounded-2xl border border-gray-50">
            <div className="relative w-full lg:w-40">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); fetchTransactions({ start: e.target.value, page: 1 }); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-gray-300 font-bold">—</span>
            <div className="relative w-full lg:w-40">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); fetchTransactions({ end: e.target.value, page: 1 }); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-8 w-px bg-gray-100 hidden lg:block" />

          {/* Status Filter */}
          <div className="relative w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); handleFilter(e.target.value, search); }}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">Semua Status</option>
              {["COMPLETED", "PENDING", "CANCELLED", "VOIDED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative w-full flex-1">
            <input
              type="text"
              placeholder="Cari ID Nota..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilter(statusFilter, e.target.value); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-400 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="h-8 w-px bg-gray-100 hidden lg:block" />

          {/* Stats */}
          <div className="flex items-center gap-10 w-full lg:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">TOTAL</span>
              <span className="text-3xl font-black text-[#1A1A1A] leading-none">{pagination.total}</span>
            </div>
            <div className="h-10 w-px bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">PENDAPATAN</span>
              <span className="text-3xl font-black text-primary leading-none">{formatCurrency(pendingRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Transaction Table */}
        <div className={cn(
          "bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300",
          selectedTxId ? "w-full xl:flex-1" : "w-full",
          isLoadingList && "opacity-60 pointer-events-none"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 xl:px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-wider">ID Transaksi</th>
                  <th className="px-6 xl:px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 xl:px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 xl:px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Metode</th>
                  <th className="px-6 xl:px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-sm font-medium text-gray-400">
                      Belum ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const { time, date } = formatDateTime(tx.createdAt);
                    const isSelected = selectedTxId === tx.id;
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => fetchDetail(tx.id)}
                        className={cn(
                          "group cursor-pointer transition-colors",
                          isSelected ? "bg-[#FDF2F0]" : "hover:bg-gray-50/60"
                        )}
                      >
                        <td className="px-6 xl:px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-primary mb-0.5">{tx.id.slice(0, 14)}...</span>
                            <span className="text-[11px] font-medium text-gray-400">{tx.branchName ?? tx.type}</span>
                          </div>
                        </td>
                        <td className="px-6 xl:px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-[#1A1A1A] mb-0.5">{time}</span>
                            <span className="text-[11px] font-medium text-gray-400">{date}</span>
                          </div>
                        </td>
                        <td className="px-6 xl:px-8 py-6">
                          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider", getStatusColor(tx.status))}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 xl:px-8 py-6">
                          <div className="flex justify-center">
                            <MethodIcon method={tx.paymentMethod} />
                          </div>
                        </td>
                        <td className="px-6 xl:px-8 py-6 text-right">
                          <span className="text-sm font-black text-[#1A1A1A]">{formatCurrency(tx.totalAmount)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — same pattern as inventory */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-50">
            <p className="text-xs font-bold text-slate-400">
              Menampilkan{" "}
              <span className="text-slate-700 font-black">{transactions.length}</span>{" "}
              dari{" "}
              <span className="text-slate-700 font-black">{pagination.total}</span>{" "}
              transaksi
            </p>

            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5 gap-1">
              {/* First */}
              <button
                onClick={() => fetchTransactions({ page: 1 })}
                disabled={pagination.page <= 1 || isLoadingList}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
                title="Halaman pertama"
              >
                &#171;
              </button>
              {/* Prev */}
              <button
                onClick={() => fetchTransactions({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1 || isLoadingList}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
                title="Halaman sebelumnya"
              >
                &#8249;
              </button>

              {/* Numbered pages with ellipsis */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - pagination.page) <= 1 || p === 1 || p === pagination.totalPages)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-300 text-xs font-black">
                      ···
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => fetchTransactions({ page: item as number })}
                      disabled={isLoadingList}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all active:scale-90",
                        pagination.page === item
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-sm"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => fetchTransactions({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages || isLoadingList}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
                title="Halaman berikutnya"
              >
                &#8250;
              </button>
              {/* Last */}
              <button
                onClick={() => fetchTransactions({ page: pagination.totalPages })}
                disabled={pagination.page >= pagination.totalPages || isLoadingList}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
                title="Halaman terakhir"
              >
                &#187;
              </button>
            </div>
          </div>

        </div>

        {/* Detail Panel */}
        {selectedTxId && (
          <div className="w-full xl:w-[400px] bg-white rounded-4xl shadow-sm border border-gray-100 p-6 shrink-0 sticky top-24">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-6">
              <div>
                <h2 className="text-lg font-black text-[#1A1A1A] mb-1">Detail Transaksi</h2>
                <p className="text-xs font-medium text-gray-400 truncate w-48">{selectedTxDetail?.id ?? "Memuat..."}</p>
              </div>
              <button
                onClick={() => { setSelectedTxId(null); setSelectedTxDetail(null); }}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail || !selectedTxDetail ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Status & Meta */}
                <div className="bg-gray-50/50 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider", getStatusColor(selectedTxDetail.status))}>
                      {selectedTxDetail.status}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {formatDateTime(selectedTxDetail.createdAt).date} {formatDateTime(selectedTxDetail.createdAt).time}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-400 mb-1">Kasir</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{selectedTxDetail.cashierName ?? "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-400 mb-1">Cabang</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{selectedTxDetail.branchName ?? "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-400 mb-1">Tipe</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{selectedTxDetail.type}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-400 mb-1">Metode</span>
                      <div className="flex items-center gap-1.5">
                        <MethodIcon method={selectedTxDetail.paymentMethod} size="sm" />
                        <span className="text-sm font-bold text-[#1A1A1A]">{selectedTxDetail.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ITEM PESANAN</h3>
                  <div className="space-y-4">
                    {selectedTxDetail.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#1A1A1A] mb-0.5">{item.productName}</span>
                          <span className="text-[11px] font-medium text-gray-400">
                            {formatCurrency(item.priceAtTime)} × {item.quantity}
                          </span>
                        </div>
                        <span className="text-sm font-black text-[#1A1A1A]">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-gray-50/80 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500">Subtotal</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{formatCurrency(selectedTxDetail.breakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500">Pajak & Biaya</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {formatCurrency(selectedTxDetail.totalAmount - selectedTxDetail.breakdown.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-1">
                    <span className="text-sm font-black text-[#1A1A1A]">Total</span>
                    <span className="text-xl font-black text-primary">{formatCurrency(selectedTxDetail.totalAmount)}</span>
                  </div>
                </div>

                {/* Void Error */}
                {voidError && (
                  <p className="text-xs text-red-500 font-medium text-center mb-4">{voidError}</p>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full flex justify-center items-center gap-2 py-3.5 border-2 border-primary/20 rounded-xl text-primary font-bold text-sm hover:bg-primary-light hover:border-primary/30 transition-all">
                    <Printer className="h-4 w-4" />
                    Cetak Ulang Struk
                  </button>
                  {["COMPLETED", "PENDING"].includes(selectedTxDetail.status) && (
                    <button
                      onClick={handleVoid}
                      className="w-full flex justify-center items-center gap-2 py-3.5 bg-[#FDF2F0] rounded-xl text-[#D84A4A] font-bold text-sm hover:bg-[#FEEBEC] transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      Batalkan (Void)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
