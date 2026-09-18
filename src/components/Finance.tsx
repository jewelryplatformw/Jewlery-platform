import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Plus, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { JewelryItem, Transaction, TransactionKind } from '@/lib/types';
import { formatCurrency, formatCurrencyPrecise, formatDate } from '@/lib/format';
import { useLang } from '@/lib/i18n';

interface Props {
  transactions: Transaction[];
  items: JewelryItem[];
  onReload: () => void;
}

export default function Finance({ transactions, items, onReload }: Props) {
  const { t } = useLang();
  const [showAdd, setShowAdd] = useState(false);

  const summary = useMemo(() => {
    const revenue = transactions.filter((tx) => tx.kind === 'sale').reduce((s, tx) => s + tx.amount, 0);
    const expenses = transactions
      .filter((tx) => tx.kind === 'expense' || tx.kind === 'purchase')
      .reduce((s, tx) => s + tx.amount, 0);
    const net = revenue - expenses;
    const margin = revenue > 0 ? (net / revenue) * 100 : 0;
    return { revenue, expenses, net, margin };
  }, [transactions]);

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; income: number; expense: number }>();
    for (const tx of transactions) {
      const key = tx.transaction_date;
      const entry = byDate.get(key) ?? { date: key, income: 0, expense: 0 };
      if (tx.kind === 'sale') entry.income += tx.amount;
      else entry.expense += tx.amount;
      byDate.set(key, entry);
    }
    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={t.totalRevenue}
          value={formatCurrency(summary.revenue)}
          subtitle={t.moneyIn}
          icon={<ArrowUpRight className="h-4 w-4" />}
          tone="up"
        />
        <MetricCard
          label={t.totalExpenses}
          value={formatCurrency(summary.expenses)}
          subtitle={t.moneyOut}
          icon={<ArrowDownLeft className="h-4 w-4" />}
          tone="down"
        />
        <MetricCard
          label={t.netProfitMargin}
          value={`${summary.margin.toFixed(1)}%`}
          subtitle={formatCurrency(summary.net)}
          icon={<Percent className="h-4 w-4" />}
          tone={summary.net >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Chart */}
      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">{t.cashFlowTrend}</h3>
            <p className="text-xs text-white/40">{t.cashFlowDesc}</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> {t.income}
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> {t.expense}
            </span>
          </div>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatDate(v)}
              />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip
                contentStyle={{
                  background: '#161618',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#e7e3da',
                }}
                labelFormatter={(v) => formatDate(String(v))}
                formatter={(v: number, name) => [formatCurrencyPrecise(v), name === 'income' ? t.income : t.expense]}
              />
              <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="expense" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={16} />
              <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions table */}
      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">{t.recentTransactions}</h3>
            <p className="text-xs text-white/40">{transactions.length} {t.records}</p>
          </div>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
          >
            <Plus className="h-4 w-4" /> {t.addTransaction}
          </button>
        </div>

        {showAdd && (
          <AddTransactionForm
            onDone={() => {
              setShowAdd(false);
              onReload();
            }}
          />
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40" style={{ textAlign: 'start' }}>
                <th className="px-3 py-3 font-medium">{t.txId}</th>
                <th className="px-3 py-3 font-medium">{t.txDate}</th>
                <th className="px-3 py-3 font-medium">{t.txDescription}</th>
                <th className="px-3 py-3 font-medium">{t.txType}</th>
                <th className="px-3 py-3 font-medium text-end">{t.txAmount}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-mono text-xs text-white/50">{tx.transaction_code}</td>
                  <td className="px-3 py-3 text-white/70">{formatDate(tx.transaction_date)}</td>
                  <td className="px-3 py-3 text-white/90">{tx.description}</td>
                  <td className="px-3 py-3">
                    <KindBadge kind={tx.kind} />
                  </td>
                  <td className={`px-3 py-3 text-end font-semibold ${tx.kind === 'sale' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.kind === 'sale' ? '+' : '−'}
                    {formatCurrencyPrecise(tx.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-white/40">
                    {t.noTransactions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  tone,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: 'up' | 'down';
}) {
  const accent = tone === 'up' ? '#34d399' : '#fb7185';
  return (
    <div className="card-sheen rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
      <p className="mt-1 text-xs text-white/45">{subtitle}</p>
    </div>
  );
}

function KindBadge({ kind }: { kind: TransactionKind }) {
  const { t } = useLang();
  const config: Record<TransactionKind, { label: string; cls: string }> = {
    sale: { label: t.sale, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    purchase: { label: t.purchase, cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    expense: { label: t.expenseKind, cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };
  const c = config[kind];
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${c.cls}`}>{c.label}</span>;
}

function AddTransactionForm({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('sale');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const amt = parseFloat(amount);
    if (!description || !amt || amt <= 0) {
      setError(t.enterValid);
      setSaving(false);
      return;
    }
    const code = `AUR-${Math.floor(2400 + Math.random() * 600)}`;
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({ description, amount: amt, kind, transaction_code: code, transaction_date: new Date().toISOString().slice(0, 10) });
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-xl border border-white/5 bg-black/20 p-4 sm:grid-cols-4">
      <input
        placeholder={t.descPlaceholder}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none sm:col-span-2"
      />
      <input
        placeholder={t.amountPlaceholder}
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as TransactionKind)}
        className="rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2 text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
      >
        <option value="sale">{t.sale}</option>
        <option value="purchase">{t.purchase}</option>
        <option value="expense">{t.expenseKind}</option>
      </select>
      {error && <p className="text-xs text-rose-400 sm:col-span-4">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-medium text-[#0d0d0e] transition-opacity hover:opacity-90 disabled:opacity-50 sm:col-span-4"
      >
        {saving ? t.saving : t.saveTransaction}
      </button>
    </form>
  );
}
