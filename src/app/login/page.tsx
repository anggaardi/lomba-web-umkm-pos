"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-md">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">UMKM-Flow</h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke dashboard bisnismu
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all`}
                placeholder="email@bisnis.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  errors.password ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"
                } placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-blue-500 transition-all`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
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
              {isLoading ? "Sedang Masuk..." : "Masuk Sekarang"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline">
                Daftar UMKM Baru
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
