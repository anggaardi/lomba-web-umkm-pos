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


async function getDashboardData(tenantId: string) {
  const today = getWIBDayRange(0);
  const yesterday = getWIBDayRange(1);
  const chartDays = Array.from({ length: 7 }, (_, i) => getWIBDayRange(6 - i));

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
        createdAt: { gte: chartDays[0].start, lte: chartDays[6].end },
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
  // Trap #1: Prisma.Decimal → number
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
      label: DAY_LABELS[dayRange.start.getDay()],
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


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as any)?.tenantId as string | undefined;
  const tenantSlug = (session?.user as any)?.tenantSlug as string | undefined;
  const userName = session?.user?.name ?? null;

  if (!tenantId) {
    return (
      <DashboardClient
        tenantSlug={tenantSlug ?? null}
        userName={userName}
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
    await getDashboardData(tenantId);

  return (
    <DashboardClient
      tenantSlug={tenantSlug ?? null}
      userName={userName}
      stats={stats}
      chartData={chartData}
      topProducts={topProducts}
      recentTransactions={recentTransactions}
      lowStockItems={lowStockItems}
    />
  );
}
