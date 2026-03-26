"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  TrendingUp, 
  FileText, 
  Banknote, 
  Package,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

// Original Mock data for the chart
const chartData = [
  { name: "Sen", value: 4 },
  { name: "Sel", value: 6 },
  { name: "Rab", value: 3 },
  { name: "Kam", value: 5 },
  { name: "Jum", value: 9, active: true },
  { name: "Sab", value: 8 },
  { name: "Min", value: 10 },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const tenantSlug = (session?.user as any)?.tenantSlug;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 px-4 lg:px-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Selamat Datang, {session?.user?.name || "User"}
          </h1>
          <p className="text-gray-600 font-medium italic text-sm lg:text-base">
            Kelola bisnis Anda dengan ringkasan performa hari ini.
          </p>
        </div>
        {tenantSlug ? (
          <Link
            href={`/s/${tenantSlug}`}
            target="_blank"
            className="flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-3 rounded-xl transition-all w-full lg:w-auto"
          >
            Lihat Toko Online
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-100 px-4 py-3 rounded-xl w-full lg:w-auto">
            Toko Online
            <ExternalLink className="ml-2 h-4 w-4" />
          </span>
        )}
      </div>

      {/* Stats Section - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
        <StatCard 
          label="Total Penjualan Hari Ini"
          value="2,4jt"
          trend="+12% vs kemarin"
          trendUp={true}
          icon={TrendingUp}
          color="#FF724C"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        <StatCard 
          label="Total Order Hari Ini"
          value="47"
          trend="+8 order vs kemarin"
          trendUp={true}
          icon={FileText}
          color="#27AE60"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        <StatCard 
          label="Rata-rata per Order"
          value="Rp 51k"
          trend="+5% vs kemarin"
          trendUp={true}
          icon={Banknote}
          color="#F2C94C"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
        <StatCard 
          label="Bahan Hampir Habis"
          value="3"
          trend="Perlu restock"
          trendUp={false}
          isAlert={true}
          icon={Package}
          color="#2F80ED"
          className="min-w-[200px] lg:min-w-0 shrink-0"
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">
        
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs font-semibold text-gray-400">Juta IDR</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#9CA3AF", fontSize: 13, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip cursor={{ fill: '#F3F4F6', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.active ? "#FF724C" : "#FFC2B2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center space-x-12 mt-8 pt-6 border-t border-gray-50 flex-wrap gap-y-4 lg:flex-nowrap">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Minggu ini</p>
              <p className="text-3xl font-black text-[#FF724C]">Rp 15,5jt</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Jam Tersibuk</p>
              <p className="text-3xl font-black text-[#1A1A1A]">12:00–14:00</p>
            </div>
          </div>
        </div>

        {/* Menu Terlaris */}
        <div className="lg:col-span-4 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Menu Terlaris</h3>
          </div>
          <div className="space-y-6">
            <TopMenuItem 
              rank={1} 
              name="Beef Burger" 
              sold={142} 
              revenue="Rp 4.970.000" 
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=100&h=100&auto=format&fit=crop"
            />
            <TopMenuItem 
              rank={2} 
              name="Pepperoni Pizza" 
              sold={142} 
              revenue="Rp 7.742.000" 
              image="https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=100&h=100&auto=format&fit=crop"
            />
            <TopMenuItem 
              rank={3} 
              name="Orange Juice" 
              sold={142} 
              revenue="Rp 3.420.000" 
              image="https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=100&h=100&auto=format&fit=crop"
            />
          </div>
        </div>

        {/* Order Terbaru */}
        <div className="lg:col-span-12 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Order Terbaru</h3>
            <button className="px-4 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              Lihat Semua
            </button>
          </div>
          
          <div className="divide-y divide-gray-50">
            <OrderMobileRow id="#ORD-047" source="GrabFood" time="13:10" total="Rp 161.280" status="Batal" statusType="error" />
            <OrderMobileRow id="#ORD-046" source="Dine In" time="13:45" total="Rp 161.280" status="Selesai" statusType="success" />
            <OrderMobileRow id="#ORD-045" source="Take Away" time="13:38" total="Rp 161.280" status="Paid" statusType="warning" />
          </div>
        </div>

        {/* Stock Alert Section */}
        <div className="lg:col-span-12 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Alert Stok</h3>
            </div>
            <button className="px-4 py-1.5 text-xs font-bold text-[#FF724C] border border-[#FF724C] rounded-lg hover:bg-[#FFEFEB] transition-colors">
              Kelola
            </button>
          </div>

          <div className="bg-[#FFF9E6] p-4 rounded-2xl flex items-start space-x-3 mb-6">
            <Lightbulb className="h-5 w-5 text-[#F2C94C] shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-gray-700">
              <span className="font-bold">Rekomendasi:</span> Restock <span className="font-bold">Terigu</span> dalam 2 hari. Estimasi: <span className="font-bold">5 kg</span>
            </p>
          </div>

          <div className="space-y-6">
            <StockProgress name="Terigu" sisa="1.2 kg" min="3 kg" percent={40} status="Kritis" color="#EF4444" />
            <StockProgress name="Minyak goreng" sisa="0.8 L" min="2 L" percent={30} status="Kritis" color="#EF4444" />
            <StockProgress name="Daging Sapi" sisa="1.5 kg" min="2 kg" percent={70} status="Menipis" color="#F2C94C" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Redesigned Components
function StatCard({ label, value, trend, trendUp, icon: Icon, color, isAlert, className }: any) {
  return (
    <div className={cn("bg-white p-5 rounded-4xl shadow-sm border border-gray-100 flex flex-col", className)}>
      <div className="mb-4">
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
        <p className={cn(
          "text-[10px] font-bold",
          isAlert ? "text-red-500" : (trendUp ? "text-[#22C55E]" : "text-gray-400")
        )}>
          {trend}
        </p>
      </div>
    </div>
  );
}

function StockProgress({ name, sisa, min, percent, status, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-bold text-gray-800">{name}</p>
          <p className="text-[10px] font-medium text-gray-400">Sisa: {sisa} • Min: {min}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50" style={{ color }}>{status}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000" 
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function TopMenuItem({ rank, name, sold, revenue, image }: any) {
  const getRankColor = (r: number) => {
    switch(r) {
      case 1: return "bg-[#FFEFEB] text-[#FF724C]";
      case 2: return "bg-gray-50 text-gray-400";
      case 3: return "bg-[#FFF9E6] text-[#F2C94C]";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]", getRankColor(rank))}>
          {rank}
        </div>
        <img src={image} alt={name} className="h-12 w-12 rounded-xl object-cover shadow-sm" />
        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-xs font-medium text-gray-400">{sold} terjual hari ini</p>
        </div>
      </div>
      <p className="text-sm font-black text-[#FF724C]">{revenue}</p>
    </div>
  );
}

function OrderMobileRow({ id, source, time, total, status, statusType }: any) {
  const getStatusStyle = (type: string) => {
    switch(type) {
      case "error": return "bg-red-50 text-red-500 border-red-100";
      case "success": return "bg-green-50 text-green-500 border-green-100";
      case "warning": return "bg-[#FFF9E6] text-[#F2C94C] border-yellow-100";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="py-4 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-bold text-gray-900">{id}</span>
        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider", getStatusStyle(statusType))}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-medium text-gray-400">{source} • {time}</span>
        <span className="text-sm font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
}

