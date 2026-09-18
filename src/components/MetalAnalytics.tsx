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
  metalStock: MetalStock[];
}

type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';

const TIMEFRAMES: Timeframe[] = ['1H', '1D', '1W', '1M', '1Y'];

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
  spot,
  accent,
  seed,
}: {
  metal: 'gold' | 'silver';
  label: string;
  spot: number;
  accent: string;
  seed: number;
}) {
  const { t } = useLang();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
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
            <p className="text-sm text-white/50">{label} {t.spotPrice}</p>
            <p className="font-display text-2xl text-white">{formatCurrencyPrecise(spot)}</p>
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
              <linearGradient id={`grad-${metal}`} x1="0" y1="0" x2="0" y2="1">
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
              domain={['dataMin - 5', 'dataMax + 5']}
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
              formatter={(v: number) => [formatCurrencyPrecise(v), t.spotPrice]}
            />
            <Area type="monotone" dataKey="price" stroke={accent} strokeWidth={2} fill={`url(#grad-${metal})`} />
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

export default function MetalAnalytics({ metalStock }: Props) {
  const { t } = useLang();
  const gold = metalStock.find((m) => m.metal === 'gold');
  const silver = metalStock.find((m) => m.metal === 'silver');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {gold && <MetalCard metal="gold" label={t.goldLabel} spot={gold.spot_price} accent="#d4af37" seed={42} />}
        {silver && <MetalCard metal="silver" label={t.silverLabel} spot={silver.spot_price} accent="#94a3b8" seed={88} />}
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
            <LineChart data={generateSeries(78, 40, 2.5, 7)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[70, 86]} />
              <Tooltip
                contentStyle={{
                  background: '#161618',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#e7e3da',
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#d4af37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
