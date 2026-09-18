import { useMemo, useState } from 'react';
import { Search, X, Gem, Filter } from 'lucide-react';
import type { JewelryCategory, JewelryItem } from '@/lib/types';
import { formatCurrencyPrecise, formatNumber } from '@/lib/format';
import { useLang } from '@/lib/i18n';

interface Props {
  items: JewelryItem[];
  onReload: () => void;
}

export default function Inventory({ items }: Props) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<JewelryCategory | 'All'>('All');
  const [metal, setMetal] = useState('All');
  const [priceMax, setPriceMax] = useState(10000);
  const [selected, setSelected] = useState<JewelryItem | null>(null);

  const categoryLabels: Record<JewelryCategory | 'All', string> = {
    All: t.all,
    Rings: t.rings,
    Necklaces: t.necklaces,
    Bracelets: t.bracelets,
    Earrings: t.earrings,
  };

  const CATEGORIES: (JewelryCategory | 'All')[] = ['All', 'Rings', 'Necklaces', 'Bracelets', 'Earrings'];
  const METALS = ['All', '18k Yellow Gold', '18k White Gold', 'Platinum', 'Sterling Silver'];

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

  return (
    <div className="space-y-6">
      {/* Filters */}
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
            {CATEGORIES.map((c) => (
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
            {METALS.map((m) => (
              <option key={m} value={m}>
                {m === 'All' ? t.all : m}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{t.maxPrice} ${formatNumber(priceMax)}</span>
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
              <img
                src={item.image_url}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
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
            <p className="mt-3 text-sm text-white/40">{t.noPieces}</p>
          </div>
        )}
      </div>

      {selected && <ItemDrawer item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ItemDrawer({ item, onClose }: { item: JewelryItem; onClose: () => void }) {
  const { t } = useLang();

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
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 py-2.5 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20">
              {t.editDetails}
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10">
              {t.viewHistory}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
