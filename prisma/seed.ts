import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 0. Ensure tenant schema exists (Raw SQL)
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS tenant_kopi_senja`);
  
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@umkmflow.com" },
    update: {},
    create: {
      email: "superadmin@umkmflow.com",
      name: "Super Admin UMKM-Flow",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("✅ Super Admin created:", superAdmin.email);

  // 2. Create Sample Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "kedai-kopi-senja" },
    update: {},
    create: {
      name: "Kedai Kopi Senja",
      slug: "kedai-kopi-senja",
      dbSchema: "tenant_kopi_senja", // Schema Name
      whatsappNumber: "628123456789",
      address: "Jl. Merdeka No. 123, Jakarta",
    },
  });

  console.log("✅ Sample Tenant created:", tenant.name);

  // 2.1 Create Domain for Tenant
  const domain = await prisma.domain.upsert({
    where: { domain: "kopisenja.localhost" },
    update: {},
    create: {
      domain: "kopisenja.localhost",
      tenantId: tenant.id,
    },
  });

  console.log("✅ Domain created:", domain.domain);

  // 3. Create Sample Branch
  const branch = await prisma.branch.create({
    data: {
      name: "Pusat Kota",
      tenantId: tenant.id,
      address: "Jl. Merdeka No. 123, Jakarta",
    },
  });

  console.log("✅ Sample Branch created:", branch.name);

  // 4. Create Tenant Admin (Owner UMKM)
  const tenantAdmin = await prisma.user.upsert({
    where: { email: "owner@kopisenja.com" },
    update: {},
    create: {
      email: "owner@kopisenja.com",
      name: "Budi Owner",
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: tenant.id,
      branchId: branch.id,
    },
  });

  console.log("✅ Tenant Admin created:", tenantAdmin.email);

  // 5. Create Sample Products
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Kopi Susu Gula Aren",
        price: 18000,
        description: "Kopi susu kekinian dengan gula aren asli.",
        tenantId: tenant.id,
      },
      {
        name: "Americano",
        price: 15000,
        description: "Espresso dengan air panas.",
        tenantId: tenant.id,
      },
      {
        name: "Croissant Butter",
        price: 22000,
        description: "Roti croissant mentega yang renyah.",
        tenantId: tenant.id,
      },
    ],
  });

  console.log("✅ Sample Products created:", products.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
