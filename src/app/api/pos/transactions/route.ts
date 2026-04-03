import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { deductStockByRecipe, TransactionClient } from "@/lib/inventory";
import { createPosRequestSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import { generateTransactionNumber } from "@/lib/transactionNumber";

// POST: 20 req/min (write), GET: 30 req/min (read)
const writeLimit = rateLimit(20, 60_000);
const readLimit = rateLimit(30, 60_000);

// POST /api/pos/transactions
// Membuat transaksi POS baru untuk tenant (ADMIN/STAFF), bukan SUPER_ADMIN.
export async function POST(req: Request) {
  try {
    const rateLimitResponse = await writeLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    
    // Zod Validation (Medium issue #3)
    const validation = createPosRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { items, paymentMethod, branchId, applyTax, applyServiceCharge } = validation.data;

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

    const productIds = [...new Set(items.map((i) => i.productId))];

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
    const transactionItemsData = items.map((item) => {
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

    // Generate nomor transaksi singkat
    const transactionNumber = await generateTransactionNumber(tenant.id);

    // Buat transaksi POS dalam 1 operasi (Atomic: Transaction + TransactionItems + Stock Deduction)
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          tenantId: tenant.id,
          branchId: resolvedBranchId,
          transactionNumber,
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
      for (const item of items) {
        await deductStockByRecipe(
          item.productId,
          item.quantity,
          tenant.id,
          newTransaction.id,
          tx as TransactionClient
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
      {
        error:
          error instanceof Error ? error.message : "Gagal memproses transaksi",
      },
      { status: 500 }
    );
  }
}

// GET /api/pos/transactions
// Mengambil riwayat transaksi tenant dengan pagination
export async function GET(req: Request) {
  try {
    const rateLimitResponse = await readLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const { user, tenant } = await requireTenant();

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "POS hanya dapat diakses oleh tenant (ADMIN/STAFF)" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Pagination: limit clamped 1–100, page minimum 1
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;
    const branchId = searchParams.get("branchId");

    const whereClause = {
      tenantId: tenant.id,
      ...(branchId ? { branchId } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}
