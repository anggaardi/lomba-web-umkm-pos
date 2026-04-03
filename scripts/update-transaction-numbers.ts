import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateTransactionNumbers() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    for (const tenant of tenants) {
      console.log(`\nMemproses tenant: ${tenant.name}`);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          tenantId: tenant.id,
          transactionNumber: null,
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      console.log(`Ditemukan ${transactions.length} transaksi tanpa nomor`);

      for (let i = 0; i < transactions.length; i++) {
        const transactionNumber = `TRX-${(i + 1).toString().padStart(3, "0")}`;
        await prisma.transaction.update({
          where: { id: transactions[i].id },
          data: { transactionNumber },
        });
        console.log(`  Updated: ${transactions[i].id} -> ${transactionNumber}`);
      }
    }

    console.log("\n✅ Selesai mengupdate nomor transaksi");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTransactionNumbers();
