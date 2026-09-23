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

export type TransactionKind = 'sale' | 'purchase' | 'expense';

export interface Transaction {
  id: string;
  transaction_code: string;
  transaction_date: string;
  description: string;
  kind: TransactionKind;
  amount: number;
  created_at: string;
}

export interface MetalStock {
  id: string;
  metal: 'gold' | 'silver';
  weight_kg: number;
  spot_price: number;
  updated_at: string;
}
