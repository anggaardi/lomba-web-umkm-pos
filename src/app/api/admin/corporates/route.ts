import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { requireRole, handleAuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

const createCorporateSchema = z.object({
  shopName: z.string().min(3, "Nama toko minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung"
    ),
  whatsappNumber: z.string().min(10, "Nomor WhatsApp tidak valid"),
  adminName: z.string().min(2, "Nama admin minimal 2 karakter"),
  adminEmail: z.string().email("Email tidak valid"),
  adminPassword: z.string().min(6, "Password minimal 6 karakter"),
});

// GET /api/admin/corporates — List all tenants (SUPER_ADMIN only)
export async function GET() {
  try {
    await requireRole(Role.SUPER_ADMIN);

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsappNumber: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/admin/corporates — Create new corporate tenant (SUPER_ADMIN only)
export async function POST(req: Request) {
  try {
    await requireRole(Role.SUPER_ADMIN);

    const body = await req.json();
    const { shopName, slug, whatsappNumber, adminName, adminEmail, adminPassword } =
      createCorporateSchema.parse(body);

    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      return NextResponse.json(
        { message: "Slug sudah digunakan oleh tenant lain" },
        { status: 400 }
      );
    }

    // Cek apakah email admin sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email admin sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const dbSchema = `tenant_${slug.replace(/-/g, "_")}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: shopName,
          slug,
          dbSchema,
          whatsappNumber,
          settings: {
            posTaxPercent: 11,
            posServiceChargePercent: 5,
          },
        },
      });

      await tx.domain.create({
        data: {
          domain: `${slug}.umkmflow.com`,
          tenantId: tenant.id,
        },
      });

      const branch = await tx.branch.create({
        data: {
          name: "Pusat",
          tenantId: tenant.id,
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          tenantId: tenant.id,
          branchId: branch.id,
        },
      });

      return { tenant, user };
    });

    return NextResponse.json(
      {
        message: "Corporate berhasil dibuat",
        tenantId: result.tenant.id,
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          whatsappNumber: result.tenant.whatsappNumber,
          isActive: result.tenant.isActive,
          createdAt: result.tenant.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    return handleAuthError(error);
  }
}
