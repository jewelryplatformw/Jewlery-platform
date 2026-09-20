export type JewelryCategory = 'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings';

export interface JewelryItem {
  id: string;
  name: string;
  category: JewelryCategory;
  metal: string;
  carat_weight: number;
  clarity: string;
  color: string;
  total_weight_g: number;
  stock_quantity: number;
  retail_price: number;
  sku: string;
  image_url: string;
  created_at: string;
}

export type TransactionKind = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  kind: TransactionKind;
  amount: number;
  date: string;
  created_at: string;
}

export interface MetalStock {
  id: string;
  metal: 'gold' | 'silver';
  weight_kg: number;
  spot_price: number;
  updated_at: string;
}
