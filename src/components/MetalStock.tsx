import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Scale } from 'lucide-react';
import type { MetalStock } from '@/lib/types';
import { formatCurrency, formatCurrencyPrecise, formatNumber } from '@/lib/format';
import { useLang } from '@/lib/i18n';

interface Props {
  metalStock: MetalStock[];
}

function generateUsage(base: number, points: number, seed: number) {
  const data: { time: string; usage: number }[] = [];
  let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    data.push({ time: `W${i + 1}`, usage: Number((base * (0.3 + (s / 233280) * 0.7)).toFixed(2)) });
  }
  return data;
}

export default function MetalStockView({ metalStock }: Props) {
  const { t } = useLang();
  const gold = metalStock.find((m) => m.metal === 'gold');
  const silver = metalStock.find((m) => m.metal === 'silver');

  const totalValue = useMemo(() => {
    const g = gold ? gold.weight_kg * 1000 * gold.spot_price : 0;
    const s = silver ? silver.weight_kg * 1000 * silver.spot_price : 0;
    return g + s;
  }, [gold, silver]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-sheen rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-white/40">{t.totalReserveValue}</p>
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <Scale className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl gold-text">{formatCurrency(totalValue)}</p>
          <p className="mt-1 text-xs text-white/45">{t.liveValuation}</p>
        </div>
        <MetalSummary
          label={t.physicalGold}
          weight={gold?.weight_kg ?? 0}
          spot={gold?.spot_price ?? 0}
          accent="#d4af37"
          symbol="Au"
        />
        <MetalSummary
          label={t.physicalSilver}
          weight={silver?.weight_kg ?? 0}
          spot={silver?.spot_price ?? 0}
          accent="#94a3b8"
          symbol="Ag"
        />
      </div>

      {/* Usage chart */}
      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">{t.metalConsumption}</h3>
            <p className="text-xs text-white/40">{t.consumptionDesc}</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d4af37]" /> {t.goldGram}
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> {t.silverGram}
            </span>
          </div>
        </div>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateUsage(120, 12, 17)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usage-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#161618',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#e7e3da',
                }}
                formatter={(v: number) => [`${formatNumber(v, 1)} g`, t.consumed]}
              />
              <Area type="monotone" dataKey="usage" stroke="#d4af37" strokeWidth={2} fill="url(#usage-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetalSummary({
  label,
  weight,
  spot,
  accent,
  symbol,
}: {
  label: string;
  weight: number;
  spot: number;
  accent: string;
  symbol: string;
}) {
  const { t } = useLang();
  const value = weight * 1000 * spot;
  return (
    <div className="card-sheen rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg border text-xs font-display"
          style={{ borderColor: `${accent}40`, background: `${accent}12`, color: accent }}
        >
          {symbol}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-white">{formatNumber(weight, 2)} {t.kg}</p>
      <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-xs">
        <div className="flex justify-between text-white/50">
          <span>{t.spotPricePerOz}</span>
          <span className="text-white/80">{formatCurrencyPrecise(spot)}/oz</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span>{t.liveValuationLabel}</span>
          <span className="font-medium" style={{ color: accent }}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    </div>
  );
}
