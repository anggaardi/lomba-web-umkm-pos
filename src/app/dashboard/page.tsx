export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type {
  DashboardStats,
  ChartPoint,
  TopProduct,
  RecentTransaction,
  LowStockItem,
} from "./DashboardClient";
import DashboardClient from "./DashboardClient";


const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getWIBDayRange(daysAgo = 0): { start: Date; end: Date } {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const wibMs = Date.now() + WIB_OFFSET_MS;
  const wibDate = new Date(wibMs);
  const startOfDayWib =
    Date.UTC(
      wibDate.getUTCFullYear(),
      wibDate.getUTCMonth(),
      wibDate.getUTCDate() - daysAgo,
      0, 0, 0, 0
    ) - WIB_OFFSET_MS;
  return {
    start: new Date(startOfDayWib),
    end: new Date(startOfDayWib + 24 * 60 * 60 * 1000 - 1),
  };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000)
    return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}


function getFilterChartDays(filter: string) {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWibMs = Date.now() + WIB_OFFSET_MS;
  const wibDate = new Date(nowWibMs);
  const year = wibDate.getUTCFullYear();
  const month = wibDate.getUTCMonth();
  const date = wibDate.getUTCDate();
  
  if (filter === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return months.map((label, index) => ({
      start: new Date(Date.UTC(year, index, 1, 0, 0, 0, 0) - WIB_OFFSET_MS),
      end: new Date(Date.UTC(year, index + 1, 0, 23, 59, 59, 999) - WIB_OFFSET_MS),
      label,
    }));
  }
  
  if (filter === "month") {
    // 4 weeks of the current month
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const startDay = i * 7 + 1;
      const endDay = i === 3 ? daysInMonth : (i + 1) * 7;
      weeks.push({
        start: new Date(Date.UTC(year, month, startDay, 0, 0, 0, 0) - WIB_OFFSET_MS),
        end: new Date(Date.UTC(year, month, endDay, 23, 59, 59, 999) - WIB_OFFSET_MS),
        label: `Mg ${i + 1}`,
      });
    }
    return weeks;
  }
  
  if (filter === "today") {
    // blocks of 4 hours
    const blocks = [
      { startH: 0, endH: 3, label: "00-04" },
      { startH: 4, endH: 7, label: "04-08" },
      { startH: 8, endH: 11, label: "08-12" },
      { startH: 12, endH: 15, label: "12-16" },
      { startH: 16, endH: 19, label: "16-20" },
      { startH: 20, endH: 23, label: "20-24" },
    ];
    return blocks.map(b => ({
      start: new Date(Date.UTC(year, month, date, b.startH, 0, 0, 0) - WIB_OFFSET_MS),
      end: new Date(Date.UTC(year, month, date, b.endH, 59, 59, 999) - WIB_OFFSET_MS),
      label: b.label
    }));
  }
  
  // default: 7days
  return Array.from({ length: 7 }, (_, i) => {
    const range = getWIBDayRange(6 - i);
    return { ...range, label: DAY_LABELS[range.start.getDay()] };
  });
}

async function getDashboardData(tenantId: string, filter: string = "7days") {
  const today = getWIBDayRange(0);
  const yesterday = getWIBDayRange(1);
  const chartDays = getFilterChartDays(filter);

  const [
    salesToday,
    salesYesterday,
    ordersToday,
    ordersYesterday,
    salesPerDay,
    topProductsRaw,
    recentTransactions,
    allIngredients,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: today.start, lte: today.end },
      },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.aggregate({  
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: yesterday.start, lte: yesterday.end },
      },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.count({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: today.start, lte: today.end },
      },
    }),
    prisma.transaction.count({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: yesterday.start, lte: yesterday.end },
      },
    }),
    prisma.transaction.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: chartDays[0].start, lte: chartDays[chartDays.length - 1].end },
      },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        transaction: {
          tenantId,
          status: "COMPLETED",
          createdAt: { gte: today.start, lte: today.end },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 3,
    }),
    prisma.transaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        transactionNumber: true,
        totalAmount: true,
        status: true,
        type: true,
        paymentMethod: true,
        createdAt: true,
        branch: { select: { name: true } },
      },
    }),
    prisma.ingredient.findMany({
      where: { tenantId },
      select: { id: true, name: true, stock: true, minStock: true, unit: true },
    }),
  ]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalSalesToday = salesToday._sum.totalAmount?.toNumber() ?? 0;
  const totalSalesYesterday = salesYesterday._sum.totalAmount?.toNumber() ?? 0;
  const avgOrderValue =
    ordersToday > 0 ? totalSalesToday / ordersToday : 0;
  const salesTrendPercent =
    totalSalesYesterday === 0
      ? null
      : Math.round(
          ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100
        );
  const ordersTrendCount = ordersToday - ordersYesterday;

  const lowStockItems: LowStockItem[] = allIngredients
    .filter((i) => i.stock < i.minStock) // Filter di JS (trap #5)
    .sort((a, b) => {
      const ratioA = a.minStock === 0 ? 1 : a.stock / a.minStock;
      const ratioB = b.minStock === 0 ? 1 : b.stock / b.minStock;
      return ratioA - ratioB;
    })
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      name: i.name,
      stock: i.stock,
      minStock: i.minStock,
      unit: i.unit,
      percent:
        i.minStock === 0
          ? 100
          : Math.min(Math.round((i.stock / i.minStock) * 100), 100),
      status:
        i.minStock === 0
          ? "Aman"
          : i.stock / i.minStock < 0.5
          ? "Kritis"
          : "Menipis",
    }));

  const lowStockCount = allIngredients.filter((i) => i.stock < i.minStock).length;

  const chartData: ChartPoint[] = chartDays.map((dayRange) => {
    const dayTotal = salesPerDay
      .filter((tx) => {
        const ts = tx.createdAt.getTime();
        return ts >= dayRange.start.getTime() && ts <= dayRange.end.getTime();
      })
      .reduce((sum, tx) => sum + tx.totalAmount.toNumber(), 0); // Decimal → number

    return {
      label: (dayRange as any).label || DAY_LABELS[dayRange.start.getDay()],
      total: dayTotal,
      totalMillions: parseFloat((dayTotal / 1_000_000).toFixed(2)),
    };
  });

  const productIds = topProductsRaw.map((r) => r.productId);
  const productDetails =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, image: true, price: true },
        })
      : [];

  const productMap = new Map(productDetails.map((p) => [p.id, p]));

  const topProducts: TopProduct[] = topProductsRaw.map((r, idx) => {
    const product = productMap.get(r.productId);
    const qtySold = r._sum.quantity ?? 0;
    const revenue = (product?.price.toNumber() ?? 0) * qtySold; // Decimal → number
    return {
      rank: idx + 1,
      productId: r.productId,
      name: product?.name ?? "Produk Dihapus",
      image: product?.image ?? null,
      sold: qtySold,
      revenue,
      revenueFormatted: `Rp ${revenue.toLocaleString("id-ID")}`,
    };
  });

    const recentTx: RecentTransaction[] = recentTransactions.map((tx) => ({
    id: tx.id,
    transactionNumber: tx.transactionNumber,
    totalAmount: tx.totalAmount.toNumber(), // Decimal → number
    status: tx.status,
    type: tx.type,
    paymentMethod: tx.paymentMethod,
    createdAt: tx.createdAt.toISOString(), // Date → string
    branchName: tx.branch?.name ?? null,
  }));

  const stats: DashboardStats = {
    totalSalesToday,
    totalSalesTodayFormatted: formatCompact(totalSalesToday),
    totalOrdersToday: ordersToday,
    avgOrderValue,
    avgOrderValueFormatted: formatCompact(avgOrderValue),
    salesTrendPercent,
    ordersTrendCount,
    lowStockCount,
  };

  return { stats, chartData, topProducts, recentTransactions: recentTx, lowStockItems };
}


type DashboardPageProps = {
  searchParams?: Promise<{ filter?: string }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as any)?.tenantId as string | undefined;
  const tenantSlug = (session?.user as any)?.tenantSlug as string | undefined;
  const userName = session?.user?.name ?? null;

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const filter = resolvedSearchParams.filter || "7days";

  if (!tenantId) {
    return (
      <DashboardClient
        tenantSlug={tenantSlug ?? null}
        userName={userName}
        filter={filter}
        stats={{
          totalSalesToday: 0,
          totalSalesTodayFormatted: "Rp 0",
          totalOrdersToday: 0,
          avgOrderValue: 0,
          avgOrderValueFormatted: "Rp 0",
          salesTrendPercent: null,
          ordersTrendCount: 0,
          lowStockCount: 0,
        }}
        chartData={[]}
        topProducts={[]}
        recentTransactions={[]}
        lowStockItems={[]}
      />
    );
  }

  const { stats, chartData, topProducts, recentTransactions, lowStockItems } =
    await getDashboardData(tenantId, filter);

  return (
    <DashboardClient
      tenantSlug={tenantSlug ?? null}
      userName={userName}
      filter={filter}
      stats={stats}
      chartData={chartData}
      topProducts={topProducts}
      recentTransactions={recentTransactions}
      lowStockItems={lowStockItems}
    />
  );
}
