"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  shopName: z.string().min(3, "Nama UMKM minimal 3 karakter"),
  whatsappNumber: z.string().min(10, "Nomor WhatsApp tidak valid (misal: 628123...)"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Gagal melakukan registrasi");
      } else {
        router.push("/login?registered=true");
      }
    } catch (_err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-md">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">UMKM-Flow</h2>
          <p className="mt-2 text-sm text-gray-600">
            Daftarkan UMKM-mu dan mulai digitalisasi sekarang!
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Owner</label>
              <input
                {...register("name")}
                className={`block w-full px-4 py-2.5 rounded-lg border ${
                  errors.name ? "border-red-300 ring-red-50" : "border-gray-300 ring-blue-50"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm`}
                placeholder="Budi Setiawan"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                className={`block w-full px-4 py-2.5 rounded-lg border ${
                  errors.email ? "border-red-300 ring-red-50" : "border-gray-300 ring-blue-50"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm`}
                placeholder="email@bisnis.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register("password")}
                type="password"
                className={`block w-full px-4 py-2.5 rounded-lg border ${
                  errors.password ? "border-red-300 ring-red-50" : "border-gray-300 ring-blue-50"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama UMKM / Kedai</label>
              <input
                {...register("shopName")}
                className={`block w-full px-4 py-2.5 rounded-lg border ${
                  errors.shopName ? "border-red-300 ring-red-50" : "border-gray-300 ring-blue-50"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm`}
                placeholder="Kopi Senja Utama"
              />
              {errors.shopName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.shopName.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp Bisnis (Format: 628...)</label>
              <input
                {...register("whatsappNumber")}
                className={`block w-full px-4 py-2.5 rounded-lg border ${
                  errors.whatsappNumber ? "border-red-300 ring-red-50" : "border-gray-300 ring-blue-50"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm`}
                placeholder="628123456789"
              />
              {errors.whatsappNumber && <p className="mt-1 text-xs text-red-600 font-medium">{errors.whatsappNumber.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {isLoading ? "Memproses Registrasi..." : "Daftar Sekarang"}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline">
                Masuk ke Dashboard
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
