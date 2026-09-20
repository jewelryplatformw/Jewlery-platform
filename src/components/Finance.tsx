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
import { ArrowDownLeft, ArrowUpRight, Plus, Percent, Trash2, X } from 'lucide-react';
import type { Transaction, TransactionKind } from '@/lib/types';
import { formatCurrency, formatCurrencyPrecise, formatDate } from '@/lib/format';
import { useLang } from '@/lib/i18n';
import { uid } from '@/lib/storage';

interface Props {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
}

export default function Finance({ transactions, setTransactions }: Props) {
  const { t } = useLang();
  const [showAdd, setShowAdd] = useState(false);

  const summary = useMemo(() => {
    const revenue = transactions.filter((tx) => tx.kind === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expenses = transactions.filter((tx) => tx.kind === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const net = revenue - expenses;
    const margin = revenue > 0 ? (net / revenue) * 100 : 0;
    return { revenue, expenses, net, margin };
  }, [transactions]);

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; income: number; expense: number }>();
    for (const tx of transactions) {
      const key = tx.date;
      const entry = byDate.get(key) ?? { date: key, income: 0, expense: 0 };
      if (tx.kind === 'income') entry.income += tx.amount;
      else entry.expense += tx.amount;
      byDate.set(key, entry);
    }
    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [transactions]);

  const deleteTx = (id: string) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

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
          {chartData.length > 0 ? (
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
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/30">{t.noTransactions}</div>
          )}
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
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
          >
            <Plus className="h-4 w-4" /> {t.addTransaction}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40" style={{ textAlign: 'start' }}>
                <th className="px-3 py-3 font-medium">{t.txDate}</th>
                <th className="px-3 py-3 font-medium">{t.txDescription}</th>
                <th className="px-3 py-3 font-medium">{t.txType}</th>
                <th className="px-3 py-3 font-medium text-end">{t.txAmount}</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white/70">{formatDate(tx.date)}</td>
                  <td className="px-3 py-3 text-white/90">{tx.description}</td>
                  <td className="px-3 py-3">
                    <KindBadge kind={tx.kind} />
                  </td>
                  <td className={`px-3 py-3 text-end font-semibold ${tx.kind === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.kind === 'income' ? '+' : '−'}
                    {formatCurrencyPrecise(tx.amount)}
                  </td>
                  <td className="px-3 py-3 text-end">
                    <button
                      onClick={() => deleteTx(tx.id)}
                      className="grid h-7 w-7 place-items-center rounded-md border border-white/5 text-white/40 transition-colors hover:border-rose-500/20 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onSave={(tx) => {
            setTransactions([tx, ...transactions]);
            setShowAdd(false);
          }}
        />
      )}
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
    income: { label: t.incomeKind, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    expense: { label: t.expenseKind, cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };
  const c = config[kind];
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${c.cls}`}>{c.label}</span>;
}

function AddTransactionModal({ onClose, onSave }: { onClose: () => void; onSave: (tx: Transaction) => void }) {
  const { t } = useLang();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('income');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description || !amt || amt <= 0) {
      setError(t.enterValid);
      return;
    }
    onSave({
      id: uid('tx'),
      description,
      kind,
      amount: amt,
      date,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f11] p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-white">{t.addTransaction}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(['income', 'expense'] as TransactionKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  kind === k
                    ? k === 'income'
                      ? 'border-transparent bg-emerald-500/15 text-emerald-400'
                      : 'border-transparent bg-rose-500/15 text-rose-400'
                    : 'border-white/10 bg-black/20 text-white/50 hover:text-white/80'
                }`}
              >
                {k === 'income' ? t.incomeKind : t.expenseKind}
              </button>
            ))}
          </div>
          <input
            placeholder={t.descPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              placeholder={t.amountPlaceholder}
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d0d0e] px-3 py-2.5 text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none [color-scheme:dark]"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-medium text-[#0d0d0e] transition-opacity hover:opacity-90"
          >
            {t.saveTransaction}
          </button>
        </form>
      </div>
    </div>
  );
}
