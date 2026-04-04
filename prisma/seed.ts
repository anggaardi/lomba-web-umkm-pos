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

    // 5. Create Sample Ingredients with sufficient stock for testing
    const milk = await prisma.ingredient.create({
      data: {
        name: "Susu Full Cream",
        unit: "ml",
        stock: 10000, // 10 liters
        averageCostPerUnit: 20,
        lastPurchasePrice: 20,
        minStock: 1000,
        tenantId: tenant.id,
      },
    });

    const beans = await prisma.ingredient.create({
      data: {
        name: "Biji Kopi Arabica",
        unit: "gr",
        stock: 5000, // 5 kg
        averageCostPerUnit: 300,
        lastPurchasePrice: 300,
        minStock: 500,
        tenantId: tenant.id,
      },
    });

    const sugar = await prisma.ingredient.create({
      data: {
        name: "Gula Aren",
        unit: "gr",
        stock: 3000,
        averageCostPerUnit: 50,
        lastPurchasePrice: 50,
        minStock: 300,
        tenantId: tenant.id,
      },
    });

    const chocolate = await prisma.ingredient.create({
      data: {
        name: "Cokelat Bubuk",
        unit: "gr",
        stock: 2000,
        averageCostPerUnit: 100,
        lastPurchasePrice: 100,
        minStock: 200,
        tenantId: tenant.id,
      },
    });

    const matcha = await prisma.ingredient.create({
      data: {
        name: "Matcha Powder",
        unit: "gr",
        stock: 1500,
        averageCostPerUnit: 200,
        lastPurchasePrice: 200,
        minStock: 150,
        tenantId: tenant.id,
      },
    });

    const cream = await prisma.ingredient.create({
      data: {
        name: "Whipped Cream",
        unit: "ml",
        stock: 2000,
        averageCostPerUnit: 30,
        lastPurchasePrice: 30,
        minStock: 200,
        tenantId: tenant.id,
      },
    });

    const ice = await prisma.ingredient.create({
      data: {
        name: "Es Batu",
        unit: "gr",
        stock: 10000,
        averageCostPerUnit: 5,
        lastPurchasePrice: 5,
        minStock: 1000,
        tenantId: tenant.id,
      },
    });

    const tea = await prisma.ingredient.create({
      data: {
        name: "Teh Hitam",
        unit: "gr",
        stock: 2000,
        averageCostPerUnit: 80,
        lastPurchasePrice: 80,
        minStock: 200,
        tenantId: tenant.id,
      },
    });

    console.log("✅ Sample Ingredients created with sufficient stock");

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
        {
          name: "Pack 500gr",
          conversionValue: 500,
          ingredientId: sugar.id,
          tenantId: tenant.id,
        },
      ],
    });

    console.log("✅ Sample Packagings created");

    // 5.2 Create Product Categories
    const coffeeCategory = await prisma.category.create({
      data: {
        name: "Kopi",
        tenantId: tenant.id,
      },
    });

    const nonCoffeeCategory = await prisma.category.create({
      data: {
        name: "Non-Kopi",
        tenantId: tenant.id,
      },
    });

    const snackCategory = await prisma.category.create({
      data: {
        name: "Snack",
        tenantId: tenant.id,
      },
    });

    console.log("✅ Product Categories created");

    // 6. Create Sample Products with Recipes
    // Coffee Products
    const kopiSusu = await prisma.product.create({
      data: {
        name: "Kopi Susu Gula Aren",
        price: 18000,
        description: "Kopi susu kekinian dengan gula aren asli.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: kopiSusu.id, ingredientId: beans.id, quantity: 15 },
        { productId: kopiSusu.id, ingredientId: milk.id, quantity: 100 },
        { productId: kopiSusu.id, ingredientId: sugar.id, quantity: 20 },
        { productId: kopiSusu.id, ingredientId: ice.id, quantity: 150 },
      ],
    });

    const americano = await prisma.product.create({
      data: {
        name: "Americano",
        price: 15000,
        description: "Espresso dengan air panas.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400",
      },
    });

    await prisma.recipe.create({
      data: {
        productId: americano.id,
        ingredientId: beans.id,
        quantity: 18,
      },
    });

    const cappuccino = await prisma.product.create({
      data: {
        name: "Cappuccino",
        price: 22000,
        description: "Espresso dengan susu foam yang creamy.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: cappuccino.id, ingredientId: beans.id, quantity: 18 },
        { productId: cappuccino.id, ingredientId: milk.id, quantity: 120 },
        { productId: cappuccino.id, ingredientId: cream.id, quantity: 30 },
      ],
    });

    const latte = await prisma.product.create({
      data: {
        name: "Caffe Latte",
        price: 20000,
        description: "Espresso dengan susu steamed yang lembut.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: latte.id, ingredientId: beans.id, quantity: 18 },
        { productId: latte.id, ingredientId: milk.id, quantity: 150 },
      ],
    });

    const mocha = await prisma.product.create({
      data: {
        name: "Mocha",
        price: 25000,
        description: "Perpaduan espresso, cokelat, dan susu.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: mocha.id, ingredientId: beans.id, quantity: 18 },
        { productId: mocha.id, ingredientId: milk.id, quantity: 120 },
        { productId: mocha.id, ingredientId: chocolate.id, quantity: 30 },
        { productId: mocha.id, ingredientId: cream.id, quantity: 20 },
      ],
    });

    const espresso = await prisma.product.create({
      data: {
        name: "Espresso",
        price: 12000,
        description: "Shot espresso murni yang kuat.",
        tenantId: tenant.id,
        categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
      },
    });

    await prisma.recipe.create({
      data: {
        productId: espresso.id,
        ingredientId: beans.id,
        quantity: 20,
      },
    });

    // Non-Coffee Products
    const matchaLatte = await prisma.product.create({
      data: {
        name: "Matcha Latte",
        price: 23000,
        description: "Matcha premium dengan susu.",
        tenantId: tenant.id,
        categoryId: nonCoffeeCategory.id,
        image: "https://images.unsplash.com/photo-1536013564743-5e0c7c0f5f8e?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: matchaLatte.id, ingredientId: matcha.id, quantity: 15 },
        { productId: matchaLatte.id, ingredientId: milk.id, quantity: 150 },
        { productId: matchaLatte.id, ingredientId: sugar.id, quantity: 15 },
        { productId: matchaLatte.id, ingredientId: ice.id, quantity: 150 },
      ],
    });

    const chocolateMilk = await prisma.product.create({
      data: {
        name: "Chocolate Milk",
        price: 18000,
        description: "Susu cokelat yang creamy.",
        tenantId: tenant.id,
        categoryId: nonCoffeeCategory.id,
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: chocolateMilk.id, ingredientId: chocolate.id, quantity: 30 },
        { productId: chocolateMilk.id, ingredientId: milk.id, quantity: 200 },
        { productId: chocolateMilk.id, ingredientId: sugar.id, quantity: 20 },
        { productId: chocolateMilk.id, ingredientId: ice.id, quantity: 150 },
      ],
    });

    const iceTea = await prisma.product.create({
      data: {
        name: "Ice Tea",
        price: 10000,
        description: "Teh manis dingin yang segar.",
        tenantId: tenant.id,
        categoryId: nonCoffeeCategory.id,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: iceTea.id, ingredientId: tea.id, quantity: 5 },
        { productId: iceTea.id, ingredientId: sugar.id, quantity: 25 },
        { productId: iceTea.id, ingredientId: ice.id, quantity: 200 },
      ],
    });

    const milkTea = await prisma.product.create({
      data: {
        name: "Milk Tea",
        price: 15000,
        description: "Teh susu yang creamy.",
        tenantId: tenant.id,
        categoryId: nonCoffeeCategory.id,
        image: "https://images.unsplash.com/photo-1558857563-b1d9d8c7e4f3?w=400",
      },
    });

    await prisma.recipe.createMany({
      data: [
        { productId: milkTea.id, ingredientId: tea.id, quantity: 5 },
        { productId: milkTea.id, ingredientId: milk.id, quantity: 100 },
        { productId: milkTea.id, ingredientId: sugar.id, quantity: 20 },
        { productId: milkTea.id, ingredientId: ice.id, quantity: 150 },
      ],
    });

    // Snack Products (no recipes needed)
    await prisma.product.createMany({
      data: [
        {
          name: "Croissant",
          price: 15000,
          description: "Croissant butter yang renyah.",
          tenantId: tenant.id,
          categoryId: snackCategory.id,
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
        },
        {
          name: "Donut",
          price: 12000,
          description: "Donut manis dengan topping cokelat.",
          tenantId: tenant.id,
          categoryId: snackCategory.id,
          image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
        },
        {
          name: "Sandwich",
          price: 20000,
          description: "Sandwich isi ayam dan sayuran.",
          tenantId: tenant.id,
          categoryId: snackCategory.id,
          image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
        },
      ],
    });

    console.log("✅ Sample Products & Recipes created (15 products total)");
  } catch (err: unknown) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
