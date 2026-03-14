import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { deductStockByRecipe, restoreStockByTransaction } from "@/lib/inventory";

type PosItemInput = {
  productId: string;
  quantity: number;
};

type CreatePosRequest = {
  items: PosItemInput[];
  paymentMethod: string; // contoh: CASH, QRIS, DEBIT
  branchId?: string | null;
  applyTax?: boolean;
  applyServiceCharge?: boolean;
};

// POST /api/pos/transactions
// Membuat transaksi POS baru untuk tenant (ADMIN/STAFF), bukan SUPER_ADMIN.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePosRequest;
    const { items, paymentMethod, branchId, applyTax, applyServiceCharge } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Daftar item tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "paymentMethod wajib diisi" },
        { status: 400 }
      );
    }

    const { user, tenant } = await requireTenant();

    // POS hanya untuk user tenant (ADMIN/STAFF), bukan SUPER_ADMIN platform
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "POS hanya dapat diakses oleh tenant (ADMIN/STAFF)" },
        { status: 403 }
      );
    }

    // Tentukan branch (outlet) yang dipakai transaksi
    let resolvedBranchId: string | null = null;

    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: branchId,
          tenantId: tenant.id,
        },
        select: { id: true },
      });

      if (!branch) {
        return NextResponse.json(
          { error: "Branch/outlet tidak valid untuk tenant ini" },
          { status: 400 }
        );
      }

      resolvedBranchId = branch.id;
    } else if (user.branchId) {
      // fallback: gunakan branch default dari user (kasir)
      resolvedBranchId = user.branchId;
    }

    // Validasi input item
    const sanitizedItems = items.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        item.productId.trim() !== "" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "Semua item tidak valid atau quantity <= 0" },
        { status: 400 }
      );
    }

    const productIds = [...new Set(sanitizedItems.map((i) => i.productId))];

    // Ambil harga produk dari tabel Product, difilter tenant_id (multi-tenant safe)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId: tenant.id,
        isAvailable: true,
      },
      select: {
        id: true,
        price: true,
        name: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "Beberapa produk tidak ditemukan atau tidak aktif untuk tenant ini",
        },
        { status: 400 }
      );
    }

    const productMap = new Map(
      products.map((p) => [p.id, { price: p.price, name: p.name }])
    );

    // Hitung subtotal dan siapkan data TransactionItem
    let subtotal = 0;
    const transactionItemsData = sanitizedItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Produk tidak ditemukan saat mapping item POS");
      }

      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price,
      };
    });

    // Ambil konfigurasi pajak & service dari tenant.settings (diatur owner)
    type TenantSettings = {
      posTaxPercent?: number;
      posServiceChargePercent?: number;
    };
    
    const settings = (tenant as { settings?: TenantSettings }).settings;

    const taxPercent =
      typeof settings?.posTaxPercent === "number"
        ? settings.posTaxPercent
        : 0;
    const servicePercent =
      typeof settings?.posServiceChargePercent === "number"
        ? settings.posServiceChargePercent
        : 0;

    const shouldApplyTax = !!applyTax && taxPercent > 0;
    const shouldApplyService = !!applyServiceCharge && servicePercent > 0;

    const serviceChargeAmount = shouldApplyService
      ? (subtotal * servicePercent) / 100
      : 0;

    // Tax basis mengikuti dokumentasi: Taxable Amount = Net Subtotal + Service Charge
    const taxableAmount = subtotal + serviceChargeAmount;
    const taxAmount = shouldApplyTax ? (taxableAmount * taxPercent) / 100 : 0;

    const totalAmount = taxableAmount + taxAmount;

    // Buat transaksi POS dalam 1 operasi (Atomic: Transaction + TransactionItems + Stock Deduction)
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          tenantId: tenant.id,
          branchId: resolvedBranchId,
          totalAmount,
          paymentMethod,
          type: "OFFLINE",
          status: "COMPLETED", // Langsung completed karena stok dikurangi
          items: {
            create: transactionItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Deduct Stock based on recipes
      for (const item of sanitizedItems) {
        await deductStockByRecipe(
          item.productId,
          item.quantity,
          tenant.id,
          newTransaction.id,
          tx
        );
      }

      return newTransaction;
    });

    return NextResponse.json(
      {
        message: "Transaksi POS berhasil dibuat dan stok dikurangi",
        transaction,
        breakdown: {
          subtotal,
          taxableAmount,
          taxPercent,
          taxAmount,
          servicePercent,
          serviceChargeAmount,
          totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POS transaction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat transaksi POS" },
      { status: 500 }
    );
  }
}

// PATCH /api/pos/transactions/[id]
// Handle VOID transaction
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, tenant } = await requireTenant();
    const { id: transactionId } = await params;
    const { action } = await req.json();

    if (action !== "VOID") {
      return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
    }

    // Hanya ADMIN/STAFF yang bisa void
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya tenant yang dapat mengakses" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if transaction is already VOIDED
      const current = await tx.transaction.findUnique({
        where: { id: transactionId, tenantId: tenant.id },
      });

      if (!current) throw new Error("Transaksi tidak ditemukan.");
      if (current.status === "VOIDED") throw new Error("Transaksi sudah di-void sebelumnya.");

      // 2. Update status to VOIDED
      const updated = await tx.transaction.update({
        where: { id: transactionId, tenantId: tenant.id },
        data: { status: "VOIDED" },
      });

      // 3. Restore stock
      await restoreStockByTransaction(transactionId, tenant.id, tx);

      return updated;
    });

    return NextResponse.json({ message: "Transaksi berhasil di-void dan stok dikembalikan", transaction: result });
  } catch (error: unknown) {
    console.error("VOID transaction error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal melakukan void" }, { status: 400 });
  }
}


// GET /api/pos/transactions
// Mengambil daftar transaksi POS milik tenant (hanya ADMIN/STAFF).
export async function GET(req: Request) {
  try {
    const { user, tenant } = await requireTenant();

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Hanya tenant (ADMIN/STAFF) yang dapat mengakses POS" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit") ?? "20";
    const offsetParam = searchParams.get("offset") ?? "0";

    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 50);
    const offset = Math.max(Number(offsetParam) || 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        branch: true,
      },
    });

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    console.error("POS transactions list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengambil daftar transaksi POS" },
      { status: 500 }
    );
  }
}

