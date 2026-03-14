import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

type TenantSettingsPayload = {
  posTaxPercent?: number;
  posServiceChargePercent?: number;
  receiptHeader?: string;
  receiptFooter?: string;
};

function normalizePercent(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  if (num > 100) return 100;
  return Number(num.toFixed(2));
}

// GET /api/tenant/settings
export async function GET() {
  try {
    const { tenant, user } = await requireTenant();

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya owner (ADMIN) yang boleh melihat pengaturan tenant" },
        { status: 403 }
      );
    }

    const settings = (tenant as { settings?: TenantSettingsPayload }).settings;

    return NextResponse.json({
      posTaxPercent: settings?.posTaxPercent ?? 0,
      posServiceChargePercent: settings?.posServiceChargePercent ?? 0,
      receiptHeader: settings?.receiptHeader ?? "",
      receiptFooter: settings?.receiptFooter ?? "Terima kasih atas kunjungan Anda!",
    });
  } catch (error) {
    console.error("Tenant settings GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan tenant" },
      { status: 500 }
    );
  }
}

// POST /api/tenant/settings
// Mengatur pajak & service charge POS (hanya owner/ADMIN).
export async function POST(req: Request) {
  try {
    const { tenant, user } = await requireTenant();

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya owner (ADMIN) yang boleh mengatur pajak & service" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as TenantSettingsPayload;

    const posTaxPercent = normalizePercent(body.posTaxPercent);
    const posServiceChargePercent = normalizePercent(
      body.posServiceChargePercent
    );
    const receiptHeader = body.receiptHeader || "";
    const receiptFooter = body.receiptFooter || "Terima kasih atas kunjungan Anda!";

    const existingSettings =
      (tenant as { settings?: TenantSettingsPayload }).settings ?? {};

    const newSettings: TenantSettingsPayload = {
      ...existingSettings,
      posTaxPercent,
      posServiceChargePercent,
      receiptHeader,
      receiptFooter,
    };

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        settings: newSettings,
      },
    });

    return NextResponse.json(
      {
        message: "Pengaturan pajak & service berhasil disimpan",
        posTaxPercent,
        posServiceChargePercent,
        receiptHeader,
        receiptFooter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tenant settings POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan tenant" },
      { status: 500 }
    );
  }
}

