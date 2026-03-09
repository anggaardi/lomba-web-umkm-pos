import { centralPrisma, getTenantPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MarketplaceUI from "@/components/marketplace/MarketplaceUI";

export default async function TenantStorefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Cari Tenant di Central DB
  const tenant = await centralPrisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) {
    notFound();
  }

  // 2. Ambil Data Bisnis (Gunakan centralPrisma untuk sekarang karena data ada di public)
  const products = await centralPrisma.product.findMany({
    where: { tenantId: tenant.id, isAvailable: true },
  });

  return (
    <MarketplaceUI 
      tenant={{
        id: tenant.id,
        name: tenant.name,
        whatsappNumber: tenant.whatsappNumber,
        address: tenant.address,
        slug: tenant.slug
      }} 
      initialProducts={products.map(p => ({
        ...p,
        price: Number(p.price)
      }))} 
    />
  );
}
