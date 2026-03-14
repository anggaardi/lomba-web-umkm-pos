"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type TenantSettingsFormProps = {
  initialTaxPercent: number;
  initialServiceChargePercent: number;
  initialReceiptHeader?: string;
  initialReceiptFooter?: string;
};

export function TenantSettingsForm({
  initialTaxPercent,
  initialServiceChargePercent,
  initialReceiptHeader = "",
  initialReceiptFooter = "Terima kasih atas kunjungan Anda!",
}: TenantSettingsFormProps) {
  const [taxPercent, setTaxPercent] = useState(initialTaxPercent);
  const [servicePercent, setServicePercent] = useState(
    initialServiceChargePercent
  );
  const [receiptHeader, setReceiptHeader] = useState(initialReceiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(initialReceiptFooter);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/tenant/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posTaxPercent: taxPercent,
          posServiceChargePercent: servicePercent,
          receiptHeader,
          receiptFooter,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Gagal menyimpan pengaturan");
      }

      setSuccess("Pengaturan berhasil disimpan.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan pengaturan";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-800">
          Pajak Penjualan (%)
        </label>
        <p className="text-xs text-gray-700 mb-1 font-medium">
          Contoh: 10 untuk 10%. Nilai ini akan otomatis diterapkan di POS (kasir
          tidak bisa mengubah persentase, hanya mengaktifkan/nonaktifkan).
        </p>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={taxPercent}
          onChange={(e) => setTaxPercent(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-800">
          Service Charge (%)
        </label>
        <p className="text-xs text-gray-700 mb-1 font-medium">
          Contoh: 5 untuk 5%. Kasir hanya bisa mengurangi/mematikan service
          charge per transaksi, tidak bisa menambah di atas nilai ini.
        </p>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={servicePercent}
          onChange={(e) => setServicePercent(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="pt-4 border-t">
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
          Pengaturan Struk Belanja
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800">
              Header Struk (Opsional)
            </label>
            <p className="text-xs text-gray-700 mb-1 font-medium">
              Pesan tambahan di bawah alamat toko (misal: &quot;Slogan Toko&quot;).
            </p>
            <input
              type="text"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              placeholder="Contoh: Rasakan sensasi kopi asli"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800">
              Footer Struk
            </label>
            <p className="text-xs text-gray-700 mb-1 font-medium">
              Pesan penutup di bagian paling bawah struk.
            </p>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
      >
        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Simpan Pengaturan
      </button>
    </form>
  );
}

