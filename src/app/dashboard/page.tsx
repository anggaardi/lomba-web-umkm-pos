"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  TrendingUp, 
  FileText, 
  Banknote, 
  Package,
  TrendingDown,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data for the chart
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
    <div className="space-y-8 pb-10">
      {/* Original Header Style */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {session?.user?.name || "User"}
          </h1>
          {tenantSlug ? (
            <Link
              href={`/s/${tenantSlug}`}
              target="_blank"
              className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-all"
            >
              Lihat Toko Online
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <span className="flex items-center text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-lg">
              Toko Online
              <ExternalLink className="ml-2 h-4 w-4" />
            </span>
          )}
        </div>
        <p className="text-gray-600 font-medium italic">
          Kelola bisnis Anda dengan ringkasan performa hari ini.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Penjualan Hari Ini"
          value="2,4jt"
          trend="+12% vs kemarin"
          trendUp={true}
          icon={TrendingUp}
          iconBg="bg-[#FFEFEB]"
          iconColor="text-[#FF724C]"
        />
        <StatCard 
          label="Total Order Hari Ini"
          value="47"
          trend="+8 order vs kemarin"
          trendUp={true}
          icon={FileText}
          iconBg="bg-[#E7F7EF]"
          iconColor="text-[#27AE60]"
        />
        <StatCard 
          label="Rata-rata per Order"
          value="Rp 51k"
          trend="+5% vs kemarin"
          trendUp={true}
          icon={Banknote}
          iconBg="bg-[#FFF9E6]"
          iconColor="text-[#F2C94C]"
        />
        <StatCard 
          label="Bahan Hampir Habis"
          value="3"
          trend="Perlu restock"
          trendUp={false}
          isAlert={true}
          icon={Package}
          iconBg="bg-[#EBF2FF]"
          iconColor="text-[#2F80ED]"
        />
      </div>

      {/* Middle Grid: Sales Chart & Top Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1A1A1A]">
              Penjualan <span className="text-[#FF724C]">7 Hari</span> Terakhir
            </h3>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Juta IDR</span>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barGap={0}
                barCategoryGap="15%"
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#9CA3AF", fontSize: 13, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.active ? "#FF724C" : "#FFD8CC"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center space-x-12 mt-8 pt-6 border-t border-gray-50">
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

        {/* Top Menu Selection */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Menu Terlaris</h3>
          </div>
          <div className="space-y-5">
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
      </div>

      {/* Bottom Grid: Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Order Terbaru</h3>
            <button className="px-4 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              Lihat Semua
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <OrderRow id="#ORD-047" source="GrabFood" time="13:10" items="3 item" total="Rp 161.280" status="Batal" statusType="error" />
                <OrderRow id="#ORD-046" source="Dine In" time="13:45" items="3 item" total="Rp 161.280" status="Selesai" statusType="success" />
                <OrderRow id="#ORD-045" source="Take Away" time="13:38" items="3 item" total="Rp 161.280" status="Paid" statusType="warning" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alert Section */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
              <h3 className="text-xl font-bold text-[#1A1A1A]">Alert Stok</h3>
            </div>
            <button className="px-4 py-1.5 text-xs font-bold text-[#FF724C] border border-[#FF724C] rounded-lg hover:bg-[#FFEFEB] transition-colors">
              Kelola
            </button>
          </div>

          <div className="bg-[#FFF9E6] p-4 rounded-2xl flex items-start space-x-3 mb-6">
            <div className="mt-1">
              <Lightbulb className="h-5 w-5 text-[#F2C94C]" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              <span className="font-bold">Rekomendasi:</span> Restock <span className="font-bold">Terigu</span> dalam 2 hari. Estimasi: <span className="font-bold">5 kg</span>
            </p>
          </div>

          <div className="space-y-6">
            <StockItem name="Terigu" sisa="1.2 kg" min="3 kg" percent={40} status="Kritis" statusColor="text-red-500 bg-red-50" barColor="bg-red-500" />
            <StockItem name="Minyak goreng" sisa="0.8 L" min="2 L" percent={30} status="Kritis" statusColor="text-red-500 bg-red-50" barColor="bg-red-500" />
            <StockItem name="Daging Sapi" sisa="1.5 kg" min="2 kg" percent={70} status="Menipis" statusColor="text-yellow-500 bg-yellow-50" barColor="bg-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, trend, trendUp, icon: Icon, iconBg, iconColor, isAlert }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-start space-x-4">
      <div className={cn("p-4 rounded-2xl", iconBg)}>
        <Icon className={cn("h-7 w-7", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1 leading-tight">{label}</p>
        <p className="text-3xl font-black text-[#1A1A1A] mb-1">{value}</p>
        <div className={cn(
          "flex items-center text-xs font-bold",
          isAlert ? "text-red-500" : (trendUp ? "text-[#27AE60]" : "text-gray-400")
        )}>
          {isAlert ? <AlertTriangle className="h-3 w-3 mr-1" /> : (trendUp ? "↑" : "↓")} {trend}
        </div>
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
    <div className="flex items-center justify-between group">
      <div className="flex items-center space-x-4">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm", getRankColor(rank))}>
          {rank}
        </div>
        <img src={image} alt={name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
        <div>
          <p className="font-bold text-[#1A1A1A]">{name}</p>
          <p className="text-xs font-medium text-gray-400">{sold} terjual hari ini</p>
        </div>
      </div>
      <p className="font-bold text-[#FF724C]">{revenue}</p>
    </div>
  );
}

function OrderRow({ id, source, time, items, total, status, statusType }: any) {
  const getStatusStyle = (type: string) => {
    switch(type) {
      case "error": return "bg-red-50 text-red-500";
      case "success": return "bg-green-50 text-green-500";
      case "warning": return "bg-[#FFF9E6] text-[#F2C94C]";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <tr>
      <td className="py-4">
        <p className="font-bold text-[#1A1A1A]">{id}</p>
        <p className="text-xs font-medium text-gray-400">{source} • {time}</p>
      </td>
      <td className="py-4 text-sm font-bold text-gray-600">{items}</td>
      <td className="py-4 text-sm font-bold text-[#1A1A1A]">{total}</td>
      <td className="py-4 text-right">
        <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold", getStatusStyle(statusType))}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function StockItem({ name, sisa, min, percent, status, statusColor, barColor }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#1A1A1A]">{name}</p>
          <p className="text-xs font-medium text-gray-400">Sisa: {sisa} • Min: {min}</p>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusColor)}>
          {status}
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500", barColor)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

