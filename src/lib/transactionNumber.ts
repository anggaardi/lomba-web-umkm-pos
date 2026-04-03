import { prisma } from "@/lib/prisma";

export async function generateTransactionNumber(tenantId: string): Promise<string> {
  const result = await prisma.$queryRaw<Array<{ transactionNumber: string | null }>>`
    SELECT "transactionNumber" 
    FROM "Transaction" 
    WHERE "tenantId" = ${tenantId} 
      AND "transactionNumber" IS NOT NULL
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;

  let nextNumber = 1;
  
  if (result.length > 0 && result[0].transactionNumber) {
    const match = result[0].transactionNumber.match(/TRX-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `TRX-${nextNumber.toString().padStart(3, "0")}`;
}
