import { ShoppingCart, ChevronDown, Utensils, ShoppingBag, Bike } from "lucide-react";

export function NewOrderPanel({
  isCollapsed,
  onToggleCollapse,
  tableNumber,
  onTableNumberChange,
  customerName,
  onCustomerNameChange,
  orderType,
  onOrderTypeChange,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  tableNumber: string;
  onTableNumberChange: (value: string) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  orderType: "DINE_IN" | "AWAY" | "GRAB";
  onOrderTypeChange: (type: "DINE_IN" | "AWAY" | "GRAB") => void;
}) {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-lg overflow-hidden border border-gray-50 shrink-0">
      <button
        onClick={onToggleCollapse}
        className="w-full bg-linear-to-r from-orange-400 to-orange-500 p-4 text-white text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              New Order
            </h3>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isCollapsed ? "max-h-0" : "max-h-[400px]"
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Table
              </label>
              <input
                type="text"
                placeholder="No Table"
                value={tableNumber}
                onChange={(e) => onTableNumberChange(e.target.value)}
                className="w-full bg-orange-50 border-0 rounded-lg px-3 py-2 text-xs font-bold text-orange-600 placeholder:text-orange-200 focus:ring-1 focus:ring-orange-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Customer"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                className="w-full bg-orange-50 border-0 rounded-lg px-3 py-2 text-xs font-bold text-orange-600 placeholder:text-orange-200 focus:ring-1 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
              Order Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "DINE_IN", label: "Dine in", icon: Utensils },
                { id: "AWAY", label: "Away", icon: ShoppingBag },
                { id: "GRAB", label: "Grab", icon: Bike },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    onOrderTypeChange(type.id as "DINE_IN" | "AWAY" | "GRAB");
                    onToggleCollapse();
                  }}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${
                    orderType === type.id
                      ? "bg-orange-50 border-orange-200 text-orange-500 shadow-sm"
                      : "bg-white border-gray-100 text-gray-400 hover:border-orange-100 hover:bg-orange-50/30"
                  }`}
                >
                  <type.icon
                    className={`h-3.5 w-3.5 mb-1 ${
                      orderType === type.id ? "text-orange-500" : "text-gray-400"
                    }`}
                  />
                  <span className="text-[9px] font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
