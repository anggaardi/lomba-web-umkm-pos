import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    const { name, image } = await req.json();
    const { id } = await params;

    const category = await prisma.category.update({
      where: { id, tenantId: tenant.id },
      data: {
        name,
        image: image || undefined,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    const { id } = await params;

    await prisma.category.delete({
      where: { id, tenantId: tenant.id },
    });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    return handleAuthError(error);
  }
}
