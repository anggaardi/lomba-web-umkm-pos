import { redirect } from "next/navigation";
import { getCurrentSession, requireTenant } from "@/lib/auth";
import { TenantSettingsForm } from "@/components/dashboard/TenantSettingsForm";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  // Hanya tenant (ADMIN/OWNER) yang punya pengaturan ini
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { tenant, user } = await requireTenant();

  if (user.role !== "ADMIN") {
    // Staff tidak boleh mengubah pengaturan pajak/service
    redirect("/dashboard/pos");
  }

  type TenantSettings = {
    posTaxPercent?: number;
    posServiceChargePercent?: number;
    receiptHeader?: string;
    receiptFooter?: string;
  };

  const settings = (tenant as { settings?: TenantSettings }).settings;

  const initialTaxPercent =
    typeof settings?.posTaxPercent === "number" ? settings.posTaxPercent : 0;
  const initialServiceChargePercent =
    typeof settings?.posServiceChargePercent === "number"
      ? settings.posServiceChargePercent
      : 0;
  const initialReceiptHeader = settings?.receiptHeader || "";
  const initialReceiptFooter = settings?.receiptFooter || "Terima kasih atas kunjungan Anda!";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pengaturan Pajak & Service
        </h1>
        <p className="text-sm text-gray-500">
          Atur persentase pajak dan service charge yang akan digunakan di POS
          kasir. Hanya owner (ADMIN) yang bisa mengubah nilai ini.
        </p>
      </div>

      <TenantSettingsForm
        initialTaxPercent={initialTaxPercent}
        initialServiceChargePercent={initialServiceChargePercent}
        initialReceiptHeader={initialReceiptHeader}
        initialReceiptFooter={initialReceiptFooter}
      />
    </div>
  );
}

