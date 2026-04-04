import { useState } from "react";
import type { CartItem, LastTransaction } from "@/types/pos";

export function usePosState(defaultBranchId: string, posConfig: { taxPercent: number; serviceChargePercent: number }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultBranchId);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "DEBIT">("CASH");
  const [applyTax, setApplyTax] = useState(posConfig.taxPercent > 0);
  const [applyService, setApplyService] = useState(posConfig.serviceChargePercent > 0);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<LastTransaction | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "AWAY" | "GRAB">("DINE_IN");
  const [isNewOrderPanelCollapsed, setIsNewOrderPanelCollapsed] = useState(false);

  return {
    cart,
    setCart,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedBranchId,
    setSelectedBranchId,
    paymentMethod,
    setPaymentMethod,
    applyTax,
    setApplyTax,
    applyService,
    setApplyService,
    amountReceived,
    setAmountReceived,
    showReceipt,
    setShowReceipt,
    showPaymentModal,
    setShowPaymentModal,
    lastTransaction,
    setLastTransaction,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    orderType,
    setOrderType,
    isNewOrderPanelCollapsed,
    setIsNewOrderPanelCollapsed,
  };
}
