import { useEffect, useMemo, useState } from 'react';
import { Search, X, Gem, Filter, Plus, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { JewelryCategory, JewelryItem } from '@/lib/types';
import { formatCurrencyPrecise, formatNumber } from '@/lib/format';
import { useLang } from '@/lib/i18n';
import { uid } from '@/lib/storage';

interface Props {
  items: JewelryItem[];
  setItems: (items: JewelryItem[]) => void;
}

const CATEGORIES: JewelryCategory[] = ['Rings', 'Necklaces', 'Bracelets', 'Earrings'];
const METALS = ['18k Yellow Gold', '18k White Gold', '24k Yellow Gold', 'Platinum', 'Sterling Silver'];

export default function Inventory({ items, setItems }: Props) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<JewelryCategory | 'All'>('All');
  const [metal, setMetal] = useState('All');
  const [priceMax, setPriceMax] = useState(10000);
  const [selected, setSelected] = useState<JewelryItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const categoryLabels: Record<JewelryCategory | 'All', string> = {
    All: t.all,
    Rings: t.rings,
    Necklaces: t.necklaces,
    Bracelets: t.bracelets,
    Earrings: t.earrings,
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (metal !== 'All' && item.metal !== metal) return false;
      if (item.retail_price > priceMax) return false;
      if (query && !item.name.toLowerCase().includes(query.toLowerCase()) && !item.sku.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [items, query, category, metal, priceMax]);

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters + Add button */}
      <div className="card-sheen rounded-2xl border border-white/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input
              placeholder={t.searchNameSku}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Filter className="h-3.5 w-3.5" /> {t.filters}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...CATEGORIES] as (JewelryCategory | 'All')[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-white/5 text-white/50 hover:text-white/80'
                }`}
              >
                {categoryLabels[c]}
              </button>
            ))}
          </div>
          <select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/70 focus:outline-none"
          >
            {['All', ...METALS].map((m) => (
              <option key={m} value={m}>
                {m === 'All' ? t.all : m}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{t.maxPrice} {formatNumber(priceMax)} {t.tnd}</span>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="accent-[#d4af37]"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
          >
            <Plus className="h-4 w-4" /> {t.addItemBtn}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="group overflow-hidden rounded-2xl border border-white/5 bg-[#161618] text-start transition-all hover:border-[#d4af37]/30 hover:gold-glow"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Gem className="h-10 w-10 text-white/15" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
              <span className="absolute end-3 top-3 rounded-lg border border-[#d4af37]/30 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-[#d4af37] backdrop-blur-sm">
                {categoryLabels[item.category]}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-white">{item.name}</p>
                  <p className="text-xs text-white/40">{item.metal}</p>
                </div>
                <p className="font-display text-lg gold-text">{formatCurrencyPrecise(item.retail_price)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <span>{item.carat_weight} {t.ct} · {item.clarity}</span>
                <span className={`rounded-full px-2 py-0.5 ${item.stock_quantity > 5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {item.stock_quantity} {t.inStock}
                </span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/5 bg-[#161618] p-12 text-center">
            <Gem className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-3 text-sm text-white/40">{items.length === 0 ? t.noItems : t.noPieces}</p>
          </div>
        )}
      </div>

      {selected && (
        <ItemDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={() => deleteItem(selected.id)}
        />
      )}

      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onSave={(item) => {
            setItems([item, ...items]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function ItemDrawer({ item, onClose, onDelete }: { item: JewelryItem; onClose: () => void; onDelete: () => void }) {
  const { t } = useLang();
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(item.sku, { width: 120, margin: 1, color: { dark: '#0d0d0e', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [item.sku]);

  const specs: { label: string; value: string }[] = [
    { label: t.totalCaratWeight, value: `${item.carat_weight} ${t.ct}` },
    { label: t.diamondClarity, value: item.clarity },
    { label: t.diamondColor, value: item.color },
    { label: t.metalType, value: item.metal },
    { label: t.totalWeight, value: `${item.total_weight_g} g` },
    { label: t.stockQuantity, value: `${item.stock_quantity} ${t.pcs}` },
    { label: t.sku, value: item.sku },
    { label: t.retailPrice, value: formatCurrencyPrecise(item.retail_price) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-white/10 bg-[#0f0f11] animate-fade-in" style={{ borderInlineStartWidth: 1, borderInlineStartStyle: 'solid' }}>
        <div className="relative aspect-square overflow-hidden bg-black/40">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gem className="h-16 w-16 text-white/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] to-transparent" />
          <button
            onClick={onClose}
            className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/80">{item.category}</span>
          <h2 className="mt-1 font-display text-2xl text-white">{item.name}</h2>
          <p className="mt-1 text-sm text-white/45">{item.metal}</p>
          <p className="mt-4 font-display text-3xl gold-text">{formatCurrencyPrecise(item.retail_price)}</p>

          {qrUrl && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
              <img src={qrUrl} alt="QR" className="h-20 w-20 rounded-lg" />
              <div>
                <p className="text-xs text-white/40">{t.sku}</p>
                <p className="font-mono text-sm text-white/80">{item.sku}</p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-1">
            <p className="text-xs uppercase tracking-wider text-white/40">{t.specifications}</p>
            <div className="mt-2 divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.02]">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-white/50">{s.label}</span>
                  <span className="font-medium text-white/90">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onDelete}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" /> {t.deleteItem}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onSave }: { onClose: () => void; onSave: (item: JewelryItem) => void }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<JewelryCategory>('Rings');
  const [metal, setMetal] = useState(METALS[0]);
  const [caratWeight, setCaratWeight] = useState('');
  const [clarity, setClarity] = useState('');
  const [color, setColor] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [stockQty, setStockQty] = useState('1');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError(t.enterValid);
      return;
    }
    const sku = `AUR-${category.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    onSave({
      id: uid('item'),
      name: name.trim(),
      category,
      metal,
      carat_weight: parseFloat(caratWeight) || 0,
      clarity: clarity || '—',
      color: color || '—',
      total_weight_g: parseFloat(totalWeight) || 0,
      stock_quantity: parseInt(stockQty) || 1,
      retail_price: parseFloat(price) || 0,
      sku,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0f11] p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-white">{t.addItemBtn}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-white/40">{t.itemName}</label>
            <input
              placeholder={t.itemNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemCategory}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as JewelryCategory)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemMetal}</label>
            <select
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
            >
              {METALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemCaratWeight}</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.50"
              value={caratWeight}
              onChange={(e) => setCaratWeight(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemClarity}</label>
            <input
              placeholder="VS1"
              value={clarity}
              onChange={(e) => setClarity(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemColor}</label>
            <input
              placeholder="D"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemTotalWeight}</label>
            <input
              type="number"
              step="0.01"
              placeholder="3.5"
              value={totalWeight}
              onChange={(e) => setTotalWeight(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemStockQty}</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t.itemPrice}</label>
            <input
              type="number"
              step="0.01"
              placeholder="1200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-white/40">{t.itemImage}</label>
            <input
              placeholder={t.itemImagePlaceholder}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-rose-400 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="sm:col-span-2 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-medium text-[#0d0d0e] transition-opacity hover:opacity-90"
          >
            {t.saveItem}
          </button>
        </form>
      </div>
    </div>
  );
}
