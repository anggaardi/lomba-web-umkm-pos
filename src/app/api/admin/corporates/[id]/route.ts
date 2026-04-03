import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { requireRole, handleAuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

const updateSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(3).optional(),
  whatsappNumber: z.string().min(10).optional(),
});

// PATCH /api/admin/corporates/[id] — Update tenant (toggle aktif, dll.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(Role.SUPER_ADMIN);
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const tenant = await prisma.tenant.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        whatsappNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ tenant });
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(Role.SUPER_ADMIN);
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { tenantId: id } }),
      prisma.transactionItem.deleteMany({
        where: { transaction: { tenantId: id } },
      }),
      prisma.transaction.deleteMany({ where: { tenantId: id } }),
      prisma.orderIntent.deleteMany({ where: { tenantId: id } }),
      prisma.recipe.deleteMany({
        where: { product: { tenantId: id } },
      }),
      prisma.product.deleteMany({ where: { tenantId: id } }),
      prisma.category.deleteMany({ where: { tenantId: id } }),
      prisma.ingredientPackaging.deleteMany({ where: { tenantId: id } }),
      prisma.ingredient.deleteMany({ where: { tenantId: id } }),
      prisma.user.deleteMany({ where: { tenantId: id } }),
      prisma.branch.deleteMany({ where: { tenantId: id } }),
      prisma.domain.deleteMany({ where: { tenantId: id } }),
      prisma.tenant.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Corporate berhasil dihapus" });
  } catch (error) {
    return handleAuthError(error);
  }
}
