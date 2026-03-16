import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // 0. Ensure tenant schema exists (Raw SQL)
    await prisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS tenant_kopi_senja`
    );

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
        settings: {
          posTaxPercent: 11,
          posServiceChargePercent: 5,
        },
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

    // 4.1 Create Cashier (Staff Kasir)
    const cashier = await prisma.user.upsert({
      where: { email: "kasir@kopisenja.com" },
      update: {},
      create: {
        email: "kasir@kopisenja.com",
        name: "Kasir Kedai Senja",
        password: hashedPassword,
        role: Role.STAFF,
        tenantId: tenant.id,
        branchId: branch.id,
      },
    });

    console.log("✅ Cashier created:", cashier.email);

    // 5. Create Sample Ingredients
    const milk = await prisma.ingredient.create({
      data: {
        name: "Susu Full Cream",
        unit: "ml",
        stock: 1000,
        averageCostPerUnit: 20, // Rp 20 per ml
        lastPurchasePrice: 20,
        tenantId: tenant.id,
      },
    });

    const beans = await prisma.ingredient.create({
      data: {
        name: "Biji Kopi Arabica",
        unit: "gr",
        stock: 500,
        averageCostPerUnit: 300, // Rp 300 per gr
        lastPurchasePrice: 300,
        tenantId: tenant.id,
      },
    });

    console.log("✅ Sample Ingredients created");

    // 5.1 Create Packaging Templates
    await prisma.ingredientPackaging.createMany({
      data: [
        {
          name: "Botol Kecil",
          conversionValue: 100,
          ingredientId: milk.id,
          tenantId: tenant.id,
        },
        {
          name: "Karton Besar",
          conversionValue: 1000,
          ingredientId: milk.id,
          tenantId: tenant.id,
        },
        {
          name: "Pack 250gr",
          conversionValue: 250,
          ingredientId: beans.id,
          tenantId: tenant.id,
        },
      ],
    });

    console.log("✅ Sample Packagings created");

    // 6. Create Sample Products with Recipes
    const kopiSusu = await prisma.product.create({
      data: {
        name: "Kopi Susu Gula Aren",
        price: 18000,
        description: "Kopi susu kekinian dengan gula aren asli.",
        tenantId: tenant.id,
        categoryId: undefined, // Will be set later or manual
      },
    });

    await prisma.recipe.createMany({
      data: [
        {
          productId: kopiSusu.id,
          ingredientId: beans.id,
          quantity: 15, // 15gr kopi
        },
        {
          productId: kopiSusu.id,
          ingredientId: milk.id,
          quantity: 100, // 100ml susu
        },
      ],
    });

    const americano = await prisma.product.create({
      data: {
        name: "Americano",
        price: 15000,
        description: "Espresso dengan air panas.",
        tenantId: tenant.id,
      },
    });

    await prisma.recipe.create({
      data: {
        productId: americano.id,
        ingredientId: beans.id,
        quantity: 18, // 18gr kopi
      },
    });

    console.log("✅ Sample Products & Recipes created");
  } catch (err: unknown) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
