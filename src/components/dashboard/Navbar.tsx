"use client";

import { Bell, Search, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-16 w-full border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="Search transactions, products..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l ml-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">UMKM Owner</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold border border-blue-200">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
