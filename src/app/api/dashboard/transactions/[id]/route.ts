import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit(20, 60_000);



export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await limiter(_req);
    if (rateLimitResponse) return rateLimitResponse;

    const { user, tenant } = await requireTenant();
    const { id } = await params;

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Hanya tenant (ADMIN/STAFF) yang dapat mengakses detail transaksi" },
        { status: 403 }
      );
    }

    const tx = await prisma.transaction.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
        branch: { select: { name: true } },
      },
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Compute subtotal from items
    const subtotal = tx.items.reduce(
      (sum, item) => sum + Number(item.priceAtTime) * item.quantity,
      0
    );

    const detail = {
      id: tx.id,
      createdAt: tx.createdAt.toISOString(),
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      type: tx.type,
      totalAmount: Number(tx.totalAmount),
      branchName: tx.branch?.name ?? null,
      cashierName: null,
      items: tx.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        subtotal: Number(item.priceAtTime) * item.quantity,
      })),
      breakdown: {
        subtotal,
      },
    };

    return NextResponse.json({ transaction: detail });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
