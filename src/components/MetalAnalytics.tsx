import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MetalStock } from '@/lib/types';
import { formatCurrencyPrecise, formatNumber } from '@/lib/format';
import { useLang } from '@/lib/i18n';

interface Props {
  metalStock?: MetalStock[];
}

type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';
type Purity = '24K' | '18K';

const TIMEFRAMES: Timeframe[] = ['1H', '1D', '1W', '1M', '1Y'];

const TROY_OZ_TO_G = 31.1035;
const USD_TO_TND = 3.11;

function generateSeries(base: number, points: number, volatility: number, seed: number) {
  const data: { time: string; price: number }[] = [];
  let value = base;
  let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const noise = (s / 233280 - 0.5) * volatility;
    value = Math.max(value + noise, base * 0.6);
    data.push({ time: `T${i}`, price: Number(value.toFixed(2)) });
  }
  return data;
}

function MetalCard({
  metal,
  label,
  spot24k,
  accent,
  seed,
  purity,
}: {
  metal: 'gold' | 'silver';
  label: string;
  spot24k: number;
  accent: string;
  seed: number;
  purity: Purity;
}) {
  const { t } = useLang();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  const purityFactor = metal === 'gold' && purity === '18K' ? 18 / 24 : 1;
  const spot = spot24k * purityFactor;

  const [series, setSeries] = useState(() => generateSeries(spot, 48, spot * 0.012, seed));

  useEffect(() => {
    const config: Record<Timeframe, { points: number; vol: number }> = {
      '1H': { points: 60, vol: spot * 0.004 },
      '1D': { points: 48, vol: spot * 0.012 },
      '1W': { points: 56, vol: spot * 0.03 },
      '1M': { points: 60, vol: spot * 0.06 },
      '1Y': { points: 52, vol: spot * 0.14 },
    };
    const cfg = config[timeframe];
    setSeries(generateSeries(spot, cfg.points, cfg.vol, seed + timeframe.charCodeAt(0)));
  }, [timeframe, spot, seed]);

  const high = useMemo(() => Math.max(...series.map((d) => d.price)), [series]);
  const low = useMemo(() => Math.min(...series.map((d) => d.price)), [series]);
  const change = series.length > 1 ? series[series.length - 1].price - series[0].price : 0;
  const changePct = series.length > 1 ? (change / series[0].price) * 100 : 0;
  const isUp = change >= 0;

  return (
    <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-xl border"
            style={{ borderColor: `${accent}40`, background: `${accent}12` }}
          >
            <span className="font-display text-lg" style={{ color: accent }}>
              {metal === 'gold' ? 'Au' : 'Ag'}
            </span>
          </div>
          <div>
            <p className="text-sm text-white/50">
              {label} {t.spotPrice} · {metal === 'gold' ? purity : '24K'}
            </p>
            <p className="font-display text-2xl text-white">{formatCurrencyPrecise(spot)}</p>
            <p className="text-[10px] text-white/30">
              {t.conversionNote}: 1 oz = {TROY_OZ_TO_G}g · 1 USD = {USD_TO_TND} {t.tnd}
            </p>
            <div className={`mt-1 flex items-center gap-1 text-xs ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>
                {isUp ? '+' : ''}
                {change.toFixed(2)} ({isUp ? '+' : ''}
                {changePct.toFixed(2)}%)
              </span>
              <span className="text-white/30">{t.today}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/5 bg-black/30 p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeframe === tf ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${metal}-${purity}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(v) => formatNumber(Number(v), 0)}
            />
            <Tooltip
              contentStyle={{
                background: '#161618',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: 12,
                fontSize: 12,
                color: '#e7e3da',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
              formatter={(v: number) => [formatCurrencyPrecise(v), `${t.spotPrice} · ${metal === 'gold' ? purity : '24K'}`]}
            />
            <Area type="monotone" dataKey="price" stroke={accent} strokeWidth={2} fill={`url(#grad-${metal}-${purity})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label={t.dayHigh} value={formatCurrencyPrecise(high)} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="up" />
        <Stat label={t.dayLow} value={formatCurrencyPrecise(low)} icon={<TrendingDown className="h-3.5 w-3.5" />} tone="down" />
        <Stat
          label={t.sentiment}
          value={isUp ? t.bullish : t.bearish}
          icon={<Activity className="h-3.5 w-3.5" />}
          tone={isUp ? 'up' : 'down'}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: 'up' | 'down' }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
        <span className={tone === 'up' ? 'text-emerald-400' : 'text-rose-400'}>{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-white/90">{value}</p>
    </div>
  );
}

export default function MetalAnalytics({ metalStock = [] }: Props) {
  const { t } = useLang();
  const [purity, setPurity] = useState<Purity>('24K');
  
  const stockArray = Array.isArray(metalStock) ? metalStock : [];
  const gold = stockArray.find((m) => m.metal === 'gold');
  const silver = stockArray.find((m) => m.metal === 'silver');

  const gold24k = gold?.spot_price ?? 412.00;
  const silver24k = silver?.spot_price ?? 4.50;
  const gold18k = gold24k * (18 / 24);

  const ratio = silver24k > 0 ? gold24k / silver24k : 0;

  return (
    <div className="space-y-6">
      {/* بطاقات أسعار الذهب والفضة المباشرة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-amber-400 text-sm font-medium">ذهب عيار 24</div>
          <div className="text-2xl font-bold text-white mt-1">{gold24k.toFixed(2)} د.ت</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-amber-300 text-sm font-medium">ذهب عيار 18</div>
          <div className="text-2xl font-bold text-white mt-1">{gold18k.toFixed(2)} د.ت</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-400/20 bg-slate-400/5">
          <div className="text-slate-300 text-sm font-medium">فضة نقية</div>
          <div className="text-2xl font-bold text-white mt-1">{silver24k.toFixed(2)} د.ت</div>
        </div>
      </div>
      
      {/* Purity toggle */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-white/40">{t.purityLabel}</span>
        <div className="flex gap-1 rounded-lg border border-white/5 bg-black/30 p-1">
          {(['24K', '18K'] as Purity[]).map((p) => (
            <button
              key={p}
              onClick={() => setPurity(p)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                purity === p ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {purity === '18K' && (
          <span className="text-xs text-white/30">
            24K: {formatCurrencyPrecise(gold24k)} → 18K: {formatCurrencyPrecise(gold18k)}
          </span>
        )}
      </div>

      {/* الرسوم البيانية - تظهر دائماً */}
      <div className="grid gap-6 xl:grid-cols-2">
        <MetalCard metal="gold" label={t.goldLabel} spot24k={gold24k} accent="#d4af37" seed={42} purity={purity} />
        <MetalCard metal="silver" label={t.silverLabel} spot24k={silver24k} accent="#94a3b8" seed={88} purity={purity} />
      </div>

      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">{t.ratio}</h3>
            <p className="text-xs text-white/40">{t.ratioDesc}</p>
          </div>
          <span className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#d4af37]">
            {t.live}
          </span>
        </div>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generateSeries(ratio, 40, ratio * 0.03, 7)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  background: '#161618',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#e7e3da',
                }}
                formatter={(v: number) => [formatNumber(v, 1), t.ratio]}
              />
              <Line type="monotone" dataKey="price" stroke="#d4af37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
