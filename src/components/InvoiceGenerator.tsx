import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  User,
  Phone,
  Calendar,
  Check,
  Scale,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useLang } from '@/lib/i18n';
import type { MetalStock } from '@/lib/types';

interface PresetService {
  id: string;
  name: string;
  nameAr: string;
  price: number | null;
  variable: boolean;
}

const PRESET_SERVICES: PresetService[] = [
  { id: 'svc-1', name: 'قصان أسامي', nameAr: 'قصان أسامي', price: 6, variable: false },
  { id: 'svc-2', name: 'متيف فيها تصورة', nameAr: 'متيف فيها تصورة', price: 10, variable: false },
  { id: 'svc-3', name: 'النحاس اية الكرسي', nameAr: 'النحاس اية الكرسي', price: 6, variable: false },
  { id: 'svc-4', name: 'البرسلي تصور عليها العنين', nameAr: 'البرسلي تصور عليها العنين', price: 8, variable: false },
  { id: 'svc-5', name: 'اللحمة', nameAr: 'اللحمة', price: 2, variable: false },
  { id: 'svc-6', name: 'التكبير بالفضة النمرو', nameAr: 'التكبير بالفضة النمرو', price: 2, variable: false },
  { id: 'svc-7', name: 'الحلقة', nameAr: 'الحلقة', price: 2, variable: false },
  { id: 'svc-8', name: 'تنظيف [Polissage]', nameAr: 'تنظيف [Polissage]', price: 3, variable: false },
  { id: 'svc-9', name: 'التطليع والقطعة', nameAr: 'التطليع والقطعة', price: 4, variable: true },
];

interface InvoiceItem {
  uid: string;
  name: string;
  qty: number;
  price: number;
}

interface Props {
  metalStock: MetalStock[];
}

const DEFAULT_GOLD_RATE = 412.00;
const DEFAULT_SILVER_RATE = 4.50;

function generateInvoiceId(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `GG-${ts}`;
}

export default function InvoiceGenerator({ metalStock }: Props) {
  const { t, lang } = useLang();
  const [invoiceId] = useState(generateInvoiceId);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Counterweight (Mizan) state
  const [mizanMetal, setMizanMetal] = useState<'gold' | 'silver'>('gold');
  const [mizanWeight, setMizanWeight] = useState('');
  const [mizanRate, setMizanRate] = useState('');

  const goldRate = useMemo(() => {
    const g = metalStock.find((m) => m.metal === 'gold');
    return g?.spot_price ?? DEFAULT_GOLD_RATE;
  }, [metalStock]);

  const silverRate = useMemo(() => {
    const s = metalStock.find((m) => m.metal === 'silver');
    return s?.spot_price ?? DEFAULT_SILVER_RATE;
  }, [metalStock]);

  const activeRate = mizanMetal === 'gold' ? goldRate : silverRate;
  const currentRate = mizanRate === '' ? activeRate : parseFloat(mizanRate) || 0;
  const weightNum = parseFloat(mizanWeight) || 0;
  const mizanTotal = weightNum * currentRate;

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0), [items]);
  const discountNum = Math.max(0, parseFloat(discount) || 0);
  const total = Math.max(0, subtotal - discountNum);

  const addPresetService = (svc: PresetService) => {
    const uid = `${svc.id}-${Date.now()}`;
    const price = svc.variable ? (svc.price ?? 0) : (svc.price ?? 0);
    setItems((prev) => [...prev, { uid, name: svc.name, qty: 1, price }]);
  };

  const addMizanItem = () => {
    if (weightNum <= 0) return;
    const label = mizanMetal === 'gold' ? t.mizanGold : t.mizanSilver;
    const desc = `${label} (${weightNum}${t.mizanGram})`;
    setItems((prev) => [...prev, { uid: `mizan-${Date.now()}`, name: desc, qty: 1, price: Number(mizanTotal.toFixed(2)) }]);
    setMizanWeight('');
    setMizanRate('');
  };

  const addCustomItem = () => {
    if (!customName.trim()) return;
    const price = parseFloat(customPrice) || 0;
    setItems((prev) => [...prev, { uid: `custom-${Date.now()}`, name: customName.trim(), qty: 1, price }]);
    setCustomName('');
    setCustomPrice('');
  };

  const removeItem = (uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid));
  };

  const updateQty = (uid: string, qty: number) => {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, qty: Math.max(1, qty) } : item)));
  };

  const updatePrice = (uid: string, price: number) => {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, price: Math.max(0, price) } : item)));
  };

  const reset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
    setDiscount('0');
    setMizanWeight('');
    setMizanRate('');
    setInvoiceDate(new Date().toISOString().slice(0, 16));
  };

  useEffect(() => {
    const payload = JSON.stringify({ id: invoiceId, customer: customerName, total, date: invoiceDate });
    QRCode.toDataURL(payload, { width: 160, margin: 1, color: { dark: '#0d0d0e', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [invoiceId, customerName, total, invoiceDate]);

  const handlePrint = () => {
    window.print();
  };

  const formatTND = (value: number): string =>
    `${value.toFixed(2)} ${t.tnd}`;

  const formattedDate = useMemo(() => {
    const d = new Date(invoiceDate);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-TN' : 'en-TN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }, [invoiceDate, lang]);

  return (
    <div className="space-y-6">
      {/* Builder area — hidden on print */}
      <div className="print:hidden space-y-6">
        {/* Header actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-white">{t.invoiceTitle}</h2>
            <p className="text-xs text-white/40">{t.invoiceSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" /> {t.resetInvoice}
            </button>
            <button
              onClick={handlePrint}
              disabled={items.length === 0}
              className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-medium text-[#0d0d0e] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Printer className="h-4 w-4" /> {t.printInvoice}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Customer info + Services + Mizan */}
          <div className="space-y-6">
            {/* Customer info */}
            <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
              <h3 className="font-display text-base text-white">{t.customerInfo}</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
                  <User className="h-4 w-4 text-white/40 shrink-0" />
                  <input
                    placeholder={t.customerNamePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
                  <Phone className="h-4 w-4 text-white/40 shrink-0" />
                  <input
                    placeholder={t.customerPhonePlaceholder}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-white/40 shrink-0" />
                  <input
                    type="datetime-local"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Services list */}
            <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
              <h3 className="font-display text-base text-white">{t.servicesList}</h3>
              <p className="text-xs text-white/40">{t.servicesDesc}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {PRESET_SERVICES.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => addPresetService(svc)}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 text-start transition-all hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37] opacity-0 transition-opacity group-hover:opacity-100">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-white/80">{svc.name}</span>
                    </span>
                    <span className="text-xs font-medium text-white/50">
                      {svc.variable ? t.variablePrice : `${svc.price} ${t.tnd}`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mizan (Counterweight) calculator */}
              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                    <Scale className="h-4 w-4" />
                  </span>
                  <p className="font-display text-sm text-white">{t.mizanTitle}</p>
                </div>

                {/* Metal selector */}
                <div className="mt-3 flex gap-2">
                  {(['gold', 'silver'] as const).map((m) => {
                    const isSel = mizanMetal === m;
                    const accent = m === 'gold' ? '#d4af37' : '#94a3b8';
                    const label = m === 'gold' ? t.mizanGold : t.mizanSilver;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setMizanMetal(m);
                          setMizanRate('');
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          isSel
                            ? 'border-transparent text-[#0d0d0e]'
                            : 'border-white/10 bg-black/20 text-white/60 hover:text-white/90'
                        }`}
                        style={isSel ? { background: accent } : undefined}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Weight + rate inputs */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-white/40">{t.mizanWeight}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={mizanWeight}
                      onChange={(e) => setMizanWeight(e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-white/40">
                      {t.mizanRate}{' '}
                      <span className="text-white/25">({t.mizanRateHint}: {activeRate.toFixed(2)})</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={mizanRate}
                      onChange={(e) => setMizanRate(e.target.value)}
                      placeholder={activeRate.toFixed(2)}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculated total + add button */}
                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
                  <div>
                    <p className="text-[11px] text-white/40">{t.mizanCalc}</p>
                    <p className="font-display text-lg gold-text">
                      {weightNum > 0
                        ? `${weightNum}${t.mizanGram} × ${currentRate.toFixed(2)} = ${formatTND(mizanTotal)}`
                        : `— ${t.tnd}`}
                    </p>
                  </div>
                  <button
                    onClick={addMizanItem}
                    disabled={weightNum <= 0}
                    className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" /> {t.mizanAdd}
                  </button>
                </div>
              </div>

              {/* Custom item */}
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="text-xs uppercase tracking-wider text-white/40">{t.addCustomItem}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    placeholder={t.customItemName}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                    className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
                  />
                  <input
                    placeholder={t.customItemPrice}
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                    className="w-28 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-[#d4af37]/40 focus:outline-none"
                  />
                  <button
                    onClick={addCustomItem}
                    className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
                  >
                    <Plus className="h-4 w-4" /> {t.addItem}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Items table + Summary */}
          <div className="space-y-6">
            <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
              <h3 className="font-display text-base text-white">{t.colService}</h3>
              <div className="mt-4 space-y-2">
                {items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/35">{t.noItemsSelected}</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.uid}
                      className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-2.5"
                    >
                      <span className="flex-1 text-sm text-white/80">{item.name}</span>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateQty(item.uid, parseInt(e.target.value) || 1)}
                        className="w-16 rounded-md border border-white/10 bg-[#0d0d0e] px-2 py-1.5 text-center text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={item.price}
                        onChange={(e) => updatePrice(item.uid, parseFloat(e.target.value) || 0)}
                        className="w-20 rounded-md border border-white/10 bg-[#0d0d0e] px-2 py-1.5 text-center text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
                      />
                      <span className="w-20 text-end text-sm font-medium text-[#d4af37]">
                        {formatTND(item.qty * item.price)}
                      </span>
                      <button
                        onClick={() => removeItem(item.uid)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-white/5 text-white/40 transition-colors hover:border-rose-500/20 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>{t.subtotal}</span>
                  <span className="text-white/80">{formatTND(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-white/50">
                  <span>{t.discount}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder={t.discountPlaceholder}
                      className="w-24 rounded-md border border-white/10 bg-[#0d0d0e] px-2 py-1.5 text-end text-sm text-white/90 focus:border-[#d4af37]/40 focus:outline-none"
                    />
                    <span className="text-xs">{t.tnd}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-display text-base text-white">{t.totalAmount}</span>
                  <span className="font-display text-xl gold-text">{formatTND(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable invoice — only visible on print */}
      <div ref={printRef} className="hidden print:block" id="printable-invoice">
        <PrintableInvoice
          invoiceId={invoiceId}
          customerName={customerName}
          customerPhone={customerPhone}
          formattedDate={formattedDate}
          items={items}
          subtotal={subtotal}
          discount={discountNum}
          total={total}
          qrDataUrl={qrDataUrl}
          t={t}
        />
      </div>
    </div>
  );
}

function PrintableInvoice({
  invoiceId,
  customerName,
  customerPhone,
  formattedDate,
  items,
  subtotal,
  discount,
  total,
  qrDataUrl,
  t,
}: {
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  formattedDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  qrDataUrl: string;
  t: ReturnType<typeof useLang>['t'];
}) {
  const formatTND = (value: number): string => `${value.toFixed(2)} ${t.tnd}`;

  return (
    <div className="invoice-page" dir="rtl">
      {/* Header */}
      <div className="invoice-header">
        <div className="invoice-brand">
          <img src="/glow-gallery-mark.svg" alt="Glow Gallery" className="invoice-logo" />
          <div>
            <h1 className="invoice-brand-name">جلو غاليري / Glow Gallery</h1>
            <p className="invoice-brand-sub">{t.invoiceAddress} · {t.invoicePhone}: +216 00 000 000</p>
          </div>
        </div>
        <div className="invoice-meta">
          <p className="invoice-id-label">{t.invoiceId}</p>
          <p className="invoice-id-value">{invoiceId}</p>
          <p className="invoice-date">{formattedDate}</p>
        </div>
      </div>

      <div className="invoice-divider" />

      {/* Customer */}
      <div className="invoice-customer">
        <p className="invoice-section-label">{t.customerInfo}</p>
        <p className="invoice-customer-name">{customerName || '—'}</p>
        {customerPhone && <p className="invoice-customer-phone">{t.invoicePhone}: {customerPhone}</p>}
      </div>

      {/* Items table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="text-start">{t.colService}</th>
            <th className="text-center">{t.colQty}</th>
            <th className="text-center">{t.colPrice}</th>
            <th className="text-end">{t.colTotal}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.uid}>
              <td>{item.name}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-center">{formatTND(item.price)}</td>
              <td className="text-end">{formatTND(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="invoice-totals">
        <div className="invoice-total-row">
          <span>{t.subtotal}</span>
          <span>{formatTND(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="invoice-total-row">
            <span>{t.discount}</span>
            <span>−{formatTND(discount)}</span>
          </div>
        )}
        <div className="invoice-grand-total">
          <span>{t.totalAmount}</span>
          <span>{formatTND(total)}</span>
        </div>
      </div>

      {/* Footer with QR */}
      <div className="invoice-footer">
        {qrDataUrl && (
          <div className="invoice-qr">
            <img src={qrDataUrl} alt="QR" className="invoice-qr-img" />
            <p className="invoice-qr-label">{t.scanToVerify}</p>
          </div>
        )}
        <p className="invoice-thanks">{t.invoiceThankYou}</p>
      </div>
    </div>
  );
}
