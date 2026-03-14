import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const { name, image } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        image: image || null,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function GET() {
  try {
    const { tenant } = await requireTenant();
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return handleAuthError(error);
  }
}
