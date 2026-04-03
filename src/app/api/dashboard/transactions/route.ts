import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import type { TransactionStatus } from "@/types/transaction";

const limiter = rateLimit(30, 60_000);



export async function GET(req: Request) {
  try {
    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;

    const { user, tenant } = await requireTenant();

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Hanya tenant (ADMIN/STAFF) yang dapat mengakses riwayat transaksi" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);


    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    const statusParam = searchParams.get("status") as TransactionStatus | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") ?? "";

    const whereClause = {
      tenantId: tenant.id,
      ...(statusParam ? { status: statusParam } : {}),
      ...(search ? { id: { contains: search, mode: "insensitive" as const } } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          createdAt: true,
          status: true,
          paymentMethod: true,
          type: true,
          totalAmount: true,
          branch: { select: { name: true } },
        },
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    const serialized = transactions.map((tx) => ({
      id: tx.id,
      createdAt: tx.createdAt.toISOString(),
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      type: tx.type,
      totalAmount: Number(tx.totalAmount),
      branchName: tx.branch?.name ?? null,
    }));

    return NextResponse.json({
      transactions: serialized,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
