import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    // Pastikan user login dan memiliki tenant aktif
    const { tenant } = await requireTenant();

    // 1. Ambil detail transaksi dan item yang dibeli
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId, tenantId: tenant.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipes: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // 2. Gunakan Transaction untuk update stok (Atomic)
    await prisma.$transaction(async (tx) => {
      for (const item of transaction.items) {
        // Cek apakah produk punya resep
        if (item.product.recipes.length > 0) {
          for (const recipe of item.product.recipes) {
            const deductionAmount = recipe.quantity * item.quantity;

            // Update stok bahan baku
            await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: {
                stock: {
                  decrement: deductionAmount,
                },
              },
            });
          }
        }
      }

      // Update status transaksi jika perlu
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });
    });

    return NextResponse.json({ message: "Stok berhasil dikurangi (Smart Recipe)" });
  } catch (error) {
    console.error("Deduction error:", error);
    return NextResponse.json({ error: "Gagal mengurangi stok" }, { status: 500 });
  }
}
