import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient; 
  centralPool: pg.Pool;
  tenantPools: Map<string, PrismaClient>;
};

// 1. Central Connection (Public Schema)
const centralPool = globalForPrisma.centralPool || new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
if (process.env.NODE_ENV !== "production") globalForPrisma.centralPool = centralPool;

const centralAdapter = new PrismaPg(centralPool);
export const centralPrisma = new PrismaClient({ adapter: centralAdapter });

// 2. Cache for Tenant Clients
if (!globalForPrisma.tenantPools) {
  globalForPrisma.tenantPools = new Map();
}

/**
 * Mendapatkan Prisma Client khusus untuk tenant tertentu (schema terpisah)
 */
export function getTenantPrisma(dbSchema: string) {
  // Jika sudah ada di cache, kembalikan
  if (globalForPrisma.tenantPools.has(dbSchema)) {
    return globalForPrisma.tenantPools.get(dbSchema)!;
  }

  // Buat pool baru dengan search_path spesifik schema tenant
  // Di PostgreSQL, kita bisa menambahkan ?schema= di connection string
  // Tapi untuk adapter-pg, lebih aman menggunakan pool terpisah
  const pool = new pg.Pool({
    connectionString: `${process.env.DATABASE_URL}?schema=${dbSchema}`,
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Simpan ke cache
  globalForPrisma.tenantPools.set(dbSchema, client);
  return client;
}

// Backward compatibility (Default to public)
export const prisma = centralPrisma;
