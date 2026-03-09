import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  shopName: z.string().min(3, "Nama toko minimal 3 karakter"),
  whatsappNumber: z.string().min(10, "Nomor WhatsApp tidak valid"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, shopName, whatsappNumber } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = shopName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    const dbSchema = `tenant_${slug.replace(/-/g, "_")}`; // Format schema name

    // Create Tenant and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: shopName,
          slug,
          dbSchema,
          whatsappNumber,
        },
      });

      // Also create default domain
      await tx.domain.create({
        data: {
          domain: `${slug}.umkmflow.com`, // Default subdomain
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
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
          tenantId: tenant.id,
          branchId: branch.id,
        },
      });

      return { user, tenant };
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: result.user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
