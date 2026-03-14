import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { NextResponse } from "next/server";
import { deductStockByRecipe } from "@/lib/inventory";

// POST /api/inventory/deduct
// Manually trigger stock deduction for a PENDING transaction
export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    // Pastikan user login dan memiliki tenant aktif
    const { tenant } = await requireTenant();

    // 1. Ambil detail transaksi
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId, tenantId: tenant.id },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Transaksi sudah diproses sebelumnya" },
        { status: 400 }
      );
    }

    // 2. Gunakan Transaction untuk update stok (Atomic)
    await prisma.$transaction(async (tx) => {
      for (const item of transaction.items) {
        await deductStockByRecipe(
          item.productId,
          item.quantity,
          tenant.id,
          transaction.id,
          tx
        );
      }

      // Update status transaksi menjadi COMPLETED
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });
    });

    return NextResponse.json({
      message: "Stok berhasil dikurangi dan status diperbarui",
    });
  } catch (error: unknown) {
    console.error("Deduction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gagal mengurangi stok",
      },
      { status: 500 }
    );
  }
}
