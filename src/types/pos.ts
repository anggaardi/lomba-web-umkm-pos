export type PosProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId?: string | null;
  recipes: {
    ingredientId: string;
    quantity: number;
  }[];
};

export type PosIngredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
};

export type PosBranch = {
  id: string;
  name: string;
  address: string;
};

export type PosCategory = {
  id: string;
  name: string;
  image?: string | null;
};

export type PosConfig = {
  taxPercent: number;
  serviceChargePercent: number;
  receiptHeader?: string;
  receiptFooter?: string;
};

export type CartItem = {
  product: PosProduct;
  quantity: number;
};

export type LastTransaction = {
  id: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  totalAmount: number;
  paymentMethod: string;
  amountReceived: number;
  changeAmount: number;
  createdAt: string;
};

export type PosClientProps = {
  initialProducts: PosProduct[];
  categories: PosCategory[];
  ingredients: PosIngredient[];
  branches: PosBranch[];
  defaultBranchId: string;
  posConfig: PosConfig;
  tenant: {
    name: string;
    address: string;
    whatsappNumber: string;
  };
};
