"use client";

import { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Plus, 
  Search, 
  RefreshCw,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string | null;
  isActive: boolean;
  createdAt: Date;
};

interface TenantsClientProps {
  tenants: Tenant[];
}

export default function TenantsClient({ tenants }: TenantsClientProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Name");
  const [statusFilter, setStatusFilter] = useState("All");

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corporate Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all corporate tenants and their configurations
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#C3272B] hover:bg-[#A92226] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
          <Plus className="w-5 h-5" />
          Add Corporate
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            
            {/* Search Type Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button 
                onClick={() => setActiveTab("Code")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === "Code" ? "bg-white text-[#C3272B] shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Code
              </button>
              <button 
                onClick={() => setActiveTab("Name")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === "Name" ? "bg-white text-[#C3272B] shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Name
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-4 pr-10 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C3272B]/20 focus:border-[#C3272B]"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-3 ml-0 sm:ml-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setStatusFilter("All")}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    statusFilter === "All" ? "bg-white text-[#C3272B] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter("Active")}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    statusFilter === "Active" ? "bg-white text-[#C3272B] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Active
                </button>
                <button 
                  onClick={() => setStatusFilter("Inactive")}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    statusFilter === "Inactive" ? "bg-white text-[#C3272B] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              Total Results: <span className="font-bold text-slate-900">{tenants.length}</span>
            </div>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">NO</th>
                <th className="px-6 py-4">CODE</th>
                <th className="px-6 py-4">CORPORATE NAME</th>
                <th className="px-6 py-4">PRIMARY DOMAIN</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">JOIN DATE</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant, index) => {
                const code = tenant.slug.substring(0, 3).toUpperCase();
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                        {code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-red-50 text-[#C3272B]">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 w-fit rounded-full text-slate-500 text-xs">
                        {tenant.slug}.localhost
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.isActive ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ACTIVE
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 w-fit bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          INACTIVE
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(tenant.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No corporate tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
