import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customerName, customerWhatsapp, totalAmount, orderDetails } = await req.json();

    // Ambil tenant dari session, bukan dari body request
    const { tenant } = await requireTenant();

    const orderIntent = await prisma.orderIntent.create({
      data: {
        customerName,
        customerWhatsapp,
        totalAmount,
        orderDetails, // JSON berisi { productId, quantity, price }
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ 
      message: "Order intent recorded", 
      orderId: orderIntent.id 
    }, { status: 201 });
  } catch (error) {
    console.error("Order intent error:", error);
    return NextResponse.json({ error: "Gagal mencatat pesanan" }, { status: 500 });
  }
}
