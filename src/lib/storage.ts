import type { JewelryItem, MetalStock, Transaction } from '@/lib/types';

const KEYS = {
  items: 'glow-gallery-items',
  transactions: 'glow-gallery-transactions',
  metalStock: 'glow-gallery-metal-stock',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failure in restricted environments
  }
}

export const storage = {
  loadItems: (): JewelryItem[] => load<JewelryItem[]>(KEYS.items, []),
  saveItems: (items: JewelryItem[]): void => save(KEYS.items, items),

  loadTransactions: (): Transaction[] => load<Transaction[]>(KEYS.transactions, []),
  saveTransactions: (txs: Transaction[]): void => save(KEYS.transactions, txs),

  loadMetalStock: (): MetalStock[] => {
    const defaults: MetalStock[] = [
      { id: 'gold', metal: 'gold', weight_kg: 0, spot_price: 412.0, updated_at: new Date().toISOString() },
      { id: 'silver', metal: 'silver', weight_kg: 0, spot_price: 4.5, updated_at: new Date().toISOString() },
    ];
    return load<MetalStock[]>(KEYS.metalStock, defaults);
  },
  saveMetalStock: (stock: MetalStock[]): void => save(KEYS.metalStock, stock),
};

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
