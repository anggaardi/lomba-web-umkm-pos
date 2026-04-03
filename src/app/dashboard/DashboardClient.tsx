"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  FileText,
  Banknote,
  Package,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardStats = {
  totalSalesToday: number;
  totalSalesTodayFormatted: string;
  totalOrdersToday: number;
  avgOrderValue: number;
  avgOrderValueFormatted: string;
  salesTrendPercent: number | null;
  ordersTrendCount: number;
  lowStockCount: number;
};

export type ChartPoint = {
  label: string;
  total: number;
  totalMillions: number;
};

export type TopProduct = {
  rank: number;
  productId: string;
  name: string;
  image: string | null;
  sold: number;
  revenue: number;
  revenueFormatted: string;
};

export type RecentTransaction = {
  id: string;
  transactionNumber: string | null;
  totalAmount: number;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string; // ISO string
  branchName: string | null;
};

export type LowStockItem = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  percent: number;
  status: string;
};

export type DashboardClientProps = {
  tenantSlug: string | null;
  userName: string | null;
  stats: DashboardStats;
  chartData: ChartPoint[];
  topProducts: TopProduct[];
  recentTransactions: RecentTransaction[];
  lowStockItems: LowStockItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("Rp", "Rp ");
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-50 text-green-600 border-green-100";
    case "PENDING":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "CANCELLED":
    case "VOIDED":
      return "bg-red-50 text-red-500 border-red-100";
    default:
      return "bg-gray-50 text-gray-500 border-gray-100";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "COMPLETED": return "Selesai";
    case "PENDING":   return "Menunggu";
    case "CANCELLED": return "Batal";
    case "VOIDED":    return "Void";
    default:          return status;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardClient({
  tenantSlug,
  userName,
  stats,
  chartData,
  topProducts,
  recentTransactions,
  lowStockItems,
}: DashboardClientProps) {
  // Tentukan bar yang "active" = hari terakhir (index 6)
  const activeBarIndex = chartData.length - 1;

  // Total penjualan minggu ini
  const weeklyTotal = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 px-4 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Selamat Datang, {userName || "User"}
          </h1>
          <p className="text-gray-600 font-medium italic text-sm lg:text-base">
            Kelola bisnis Anda dengan ringkasan performa hari ini.
          </p>
        </div>
        {tenantSlug ? (
          <Link
            href={`/s/${tenantSlug}`}
            target="_blank"
            className="flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-3 rounded-xl transition-all w-full lg:w-auto"
          >
            Lihat Toko Online
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-100 px-4 py-3 rounded-xl w-full lg:w-auto">
            Toko Online
            <ExternalLink className="ml-2 h-4 w-4" />
          </span>
        )}
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
        {/* Total Penjualan */}
        <StatCard
          label="Total Penjualan Hari Ini"
          value={stats.totalSalesTodayFormatted}
          trend={
            stats.salesTrendPercent === null
              ? "Belum ada data kemarin"
              : stats.salesTrendPercent > 0
              ? `+${stats.salesTrendPercent}% vs kemarin`
              : stats.salesTrendPercent < 0
              ? `${stats.salesTrendPercent}% vs kemarin`
              : "Sama dengan kemarin"
          }
          trendUp={stats.salesTrendPercent !== null && stats.salesTrendPercent > 0}
          trendIcon={
            stats.salesTrendPercent === null ? <Minus className="h-3 w-3" />
            : stats.salesTrendPercent > 0 ? <TrendingUp className="h-3 w-3" />
            : <TrendingDown className="h-3 w-3" />
          }
          icon={TrendingUp}
          color="var(--color-primary)"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        {/* Total Order */}
        <StatCard
          label="Total Order Hari Ini"
          value={String(stats.totalOrdersToday)}
          trend={
            stats.ordersTrendCount > 0
              ? `+${stats.ordersTrendCount} order vs kemarin`
              : stats.ordersTrendCount < 0
              ? `${stats.ordersTrendCount} order vs kemarin`
              : "Sama dengan kemarin"
          }
          trendUp={stats.ordersTrendCount > 0}
          icon={FileText}
          color="#27AE60"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        {/* Rata-rata Order */}
        <StatCard
          label="Rata-rata per Order"
          value={stats.avgOrderValueFormatted}
          trend={stats.totalOrdersToday > 0 ? `${stats.totalOrdersToday} transaksi` : "Belum ada transaksi"}
          trendUp={stats.totalOrdersToday > 0}
          icon={Banknote}
          color="#F2C94C"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        {/* Stok Menipis */}
        <StatCard
          label="Bahan Hampir Habis"
          value={String(stats.lowStockCount)}
          trend={stats.lowStockCount > 0 ? "Perlu restock segera" : "Semua stok aman"}
          trendUp={stats.lowStockCount === 0}
          isAlert={stats.lowStockCount > 0}
          icon={Package}
          color="#2F80ED"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">

        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                Penjualan 7 Hari Terakhir
              </h3>
              <p className="text-xs font-semibold text-gray-400">Juta IDR</p>
            </div>
          </div>

          {chartData.every((d) => d.total === 0) ? (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-sm font-medium text-gray-400">
                Belum ada data transaksi dalam 7 hari terakhir
              </p>
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 13, fontWeight: 500 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6", opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number | undefined) => [
                      `Rp ${((value ?? 0) * 1_000_000).toLocaleString("id-ID")}`,
                      "Penjualan",
                    ]}
                  />
                  <Bar dataKey="totalMillions" radius={[4, 4, 4, 4]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === activeBarIndex ? "#FF724C" : "#FFC2B2"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center space-x-12 mt-8 pt-6 border-t border-gray-50 flex-wrap gap-y-4 lg:flex-nowrap">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Total Minggu ini
              </p>
              <p className="text-3xl font-black text-primary">
                {weeklyTotal > 0
                  ? `Rp ${(weeklyTotal / 1_000_000).toFixed(1)}jt`
                  : "Rp 0"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Total Order Hari Ini
              </p>
              <p className="text-3xl font-black text-[#1A1A1A]">
                {stats.totalOrdersToday} order
              </p>
            </div>
          </div>
        </div>

        {/* Menu Terlaris */}
        <div className="lg:col-span-4 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
              Menu Terlaris
            </h3>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm font-medium text-gray-400">
                Belum ada penjualan hari ini
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {topProducts.map((product) => (
                <TopMenuItem key={product.productId} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Order Terbaru */}
        <div className="lg:col-span-12 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
              Order Terbaru
            </h3>
            <Link
              href="/dashboard/transactions"
              className="px-4 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm font-medium text-gray-400">
                Belum ada transaksi
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTransactions.map((tx) => (
                <OrderRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>

        {/* Alert Stok */}
        <div className="lg:col-span-12 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                Alert Stok
              </h3>
            </div>
            <Link
              href="/dashboard/inventory"
              className="px-4 py-1.5 text-xs font-bold text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
            >
              Kelola
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="bg-green-50 p-4 rounded-2xl flex items-center space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <p className="text-sm font-medium text-gray-700">
                <span className="font-bold">Semua stok aman!</span> Tidak ada bahan yang perlu direstock saat ini.
              </p>
            </div>
          ) : (
            <>
              {/* Rekomendasi restock = item paling kritis */}
              <div className="bg-[#FFF9E6] p-4 rounded-2xl flex items-start space-x-3 mb-6">
                <Lightbulb className="h-5 w-5 text-[#F2C94C] shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-gray-700">
                  <span className="font-bold">Rekomendasi:</span> Restock{" "}
                  <span className="font-bold">{lowStockItems[0].name}</span>{" "}
                  sekarang. Sisa:{" "}
                  <span className="font-bold">
                    {lowStockItems[0].stock} {lowStockItems[0].unit}
                  </span>{" "}
                  (min:{" "}
                  <span className="font-bold">
                    {lowStockItems[0].minStock} {lowStockItems[0].unit}
                  </span>
                  )
                </p>
              </div>

              <div className="space-y-6">
                {lowStockItems.map((item) => (
                  <StockProgress key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  trend,
  trendUp,
  trendIcon,
  icon: Icon,
  color,
  isAlert,
  className,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  trendIcon?: React.ReactNode;
  icon: React.ElementType;
  color: string;
  isAlert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-4xl shadow-sm border border-gray-100 flex flex-col",
        className
      )}
    >
      <div className="mb-4">
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
        <p
          className={cn(
            "text-[10px] font-bold flex items-center gap-1",
            isAlert
              ? "text-red-500"
              : trendUp
              ? "text-[#22C55E]"
              : "text-gray-400"
          )}
        >
          {trendIcon}
          {trend}
        </p>
      </div>
    </div>
  );
}

function TopMenuItem({ product }: { product: TopProduct }) {
  const rankColors: Record<number, string> = {
    1: "bg-primary-light text-primary",
    2: "bg-gray-50 text-gray-400",
    3: "bg-[#FFF9E6] text-[#F2C94C]",
  };
  const rankColor = rankColors[product.rank] ?? "bg-gray-100 text-gray-500";

  // Fallback image jika null
  const imgSrc =
    product.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=FFC2B2&color=FF724C&size=96`;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0",
            rankColor
          )}
        >
          {product.rank}
        </div>
        <img
          src={imgSrc}
          alt={product.name}
          className="h-12 w-12 rounded-xl object-cover shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=FFC2B2&color=FF724C&size=96`;
          }}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
          <p className="text-xs font-medium text-gray-400">
            {product.sold} terjual hari ini
          </p>
        </div>
      </div>
      <p className="text-sm font-black text-primary shrink-0 ml-2">
        {product.revenueFormatted}
      </p>
    </div>
  );
}

function OrderRow({ tx }: { tx: RecentTransaction }) {
  const displayId = tx.transactionNumber || `${tx.id.slice(0, 8)}...`;
  const source = tx.branchName ?? tx.type;

  return (
    <div className="py-4 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-bold text-gray-900">{displayId}</span>
        <span
          className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider",
            getStatusStyle(tx.status)
          )}
        >
          {getStatusLabel(tx.status)}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-medium text-gray-400">
          {source} • {formatTime(tx.createdAt)}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(tx.totalAmount)}
        </span>
      </div>
    </div>
  );
}

function StockProgress({ item }: { item: LowStockItem }) {
  const color = item.status === "Kritis" ? "#EF4444" : "#F2C94C";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-bold text-gray-800">{item.name}</p>
          <p className="text-[10px] font-medium text-gray-400">
            Sisa: {item.stock} {item.unit} • Min: {item.minStock} {item.unit}
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50"
          style={{ color }}
        >
          {item.status}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${item.percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
