import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, requireTenant } from "@/lib/auth";
import { PosClientWrapper } from "@/components/dashboard/PosClientWrapper";

export default async function PosPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  // POS hanya relevan untuk tenant (ADMIN/STAFF), bukan SUPER_ADMIN
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { tenant, user } = await requireTenant();

  const [products, categories, ingredients, branches] = await Promise.all([
    prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        isAvailable: true,
      },
      include: {
        recipes: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.category.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.ingredient.findMany({
      where: {
        tenantId: tenant.id,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        unit: true,
      },
    }),
    prisma.branch.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const mappedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address || "",
  }));

  let mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image: p.image,
    categoryId: p.categoryId,
    recipes: p.recipes.map((r) => ({
      ingredientId: r.ingredientId,
      quantity: r.quantity,
    })),
  }));

  // Tambahkan duplikasi produk agar lebih banyak untuk tes scrolling & sticky
  if (mappedProducts.length > 0 && mappedProducts.length < 20) {
    const dummyCopies: typeof mappedProducts = [];
    for (let i = 1; i <= 6; i++) {
      mappedProducts.forEach(p => {
        dummyCopies.push({
          ...p,
          id: `${p.id}-dummy-${i}`,
          name: `${p.name} (Copy ${i})`
        });
      });
    }
    mappedProducts = [...mappedProducts, ...dummyCopies];
  }

  const mappedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    image: c.image,
  }));

  type TenantSettings = {
    posTaxPercent?: number;
    posServiceChargePercent?: number;
    receiptHeader?: string;
    receiptFooter?: string;
  };

  const settings = (tenant as { settings?: TenantSettings }).settings;

  const posConfig = {
    taxPercent:
      typeof settings?.posTaxPercent === "number" ? settings.posTaxPercent : 0,
    serviceChargePercent:
      typeof settings?.posServiceChargePercent === "number"
        ? settings.posServiceChargePercent
        : 0,
    receiptHeader: settings?.receiptHeader || "",
    receiptFooter: settings?.receiptFooter || "Terima kasih atas kunjungan Anda!",
  };

  return (
    <div className="space-y-6">
      <PosClientWrapper
        initialProducts={mappedProducts}
        categories={mappedCategories}
        ingredients={ingredients}
        branches={mappedBranches}
        defaultBranchId={user.branchId || mappedBranches[0]?.id || ""}
        posConfig={posConfig}
        tenant={{
          name: tenant.name,
          address: tenant.address || "",
          whatsappNumber: tenant.whatsappNumber,
        }}
      />
    </div>
  );
}

