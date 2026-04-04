"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen font-sans">
      {/* Left Column - Image */}
      <div className="hidden lg:block lg:w-[65%] bg-gray-100 relative">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
          alt="Scenic beach view"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-[35%] flex flex-col justify-center bg-white text-gray-900">
        <div className="w-full max-w-[340px] mx-auto px-6 py-8">
          
          {/* Logo Section */}
          <div className="mb-6 text-center">
            <h2 className="text-base font-bold text-gray-800 tracking-wide pb-4 border-b border-gray-100">
              logo
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] text-gray-600 mb-1"
                >
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={`block w-full border-b ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } py-1 focus:outline-none focus:border-primary placeholder-gray-400 italic text-sm transition-colors mb-1 bg-transparent`}
                  placeholder="email"
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] text-gray-600 mb-1"
                >
                  Password
                </label>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`block w-full bg-[#fdfce1] py-2 px-3 text-lg tracking-[0.2em] outline-none ${
                    errors.password ? "ring-1 ring-red-500" : ""
                  }`}
                  placeholder="••••••••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Show Password toggle */}
              <div className="flex items-center mt-2">
                <input
                  id="showPassword"
                  type="checkbox"
                  className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label
                  htmlFor="showPassword"
                  className="ml-2 block text-[12px] font-medium text-black"
                >
                  Show Password
                </label>
              </div>

              {/* Links */}
              <div className="flex flex-col items-end space-y-1 pt-1">
                <a
                  href="#"
                  className="text-[11px] text-primary/70 hover:text-primary transition-colors"
                >
                  Forgot password?
                </a>
                <a
                  href="#"
                  className="text-[13px] font-medium text-primary hover:text-primary-dark underline-offset-4 underline decoration-primary transition-colors"
                >
                  Login with OTP
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center py-2 px-10 rounded-lg shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : null}
                Login
              </button>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center mt-5">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                By <a href="#" className="text-primary">logging in</a> and <a href="#" className="text-primary">signing up</a> , you agree to our{" "}
                <br />
                <a href="#" className="text-primary">Privacy Policy</a> and <a href="#" className="text-primary">Terms & Conditions</a>
              </p>
            </div>

        

            {/* Divider */}
            <div className="my-5 flex items-center justify-center">
              <div className="border-t border-gray-200 grow" />
              <span className="px-3 text-[11px] text-gray-400">or</span>
              <div className="border-t border-gray-200 grow" />
            </div>

            {/* Sign Up */}
            <div className="text-center">
              <p className="text-[11px] text-gray-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary-dark transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
            
            {/* Copyright */}
            <div className="mt-8 text-center">
              <p className="text-[9px] text-gray-400 font-light">
                Copyright © PT. Omni Hotelier Internasional 2026
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
