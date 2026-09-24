import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  LineChart as LineChartIcon,
  Wallet,
  Gem,
  Layers,
  ScanLine,
  Receipt,
  Search,
  Menu,
  X,
  Languages,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import MetalAnalytics from '@/components/MetalAnalytics';
import Finance from '@/components/Finance';
import Inventory from '@/components/Inventory';
import MetalStock from '@/components/MetalStock';
import Scanner from '@/components/Scanner';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import Login from '@/components/Login';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { JewelryItem, MetalStock as MetalStockType, Transaction } from '@/lib/types';
import { LangContext, translations, type Lang } from '@/lib/i18n';

type SectionId = 'metals' | 'finance' | 'inventory' | 'stock' | 'scanner' | 'invoice';

interface NavItem {
  id: SectionId;
  labelKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
  icon: typeof LineChartIcon;
}

const NAV: NavItem[] = [
  { id: 'metals', labelKey: 'navMetals', descKey: 'navMetalsDesc', icon: LineChartIcon },
  { id: 'finance', labelKey: 'navFinance', descKey: 'navFinanceDesc', icon: Wallet },
  { id: 'inventory', labelKey: 'navInventory', descKey: 'navInventoryDesc', icon: Gem },
  { id: 'stock', labelKey: 'navStock', descKey: 'navStockDesc', icon: Layers },
  { id: 'scanner', labelKey: 'navScanner', descKey: 'navScannerDesc', icon: ScanLine },
  { id: 'invoice', labelKey: 'navInvoice', descKey: 'navInvoiceDesc', icon: Receipt },
];

const LANG_KEY = 'glow-gallery-lang';

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'en';
}

function App() {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [active, setActive] = useState<SectionId>('metals');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [items, setItems] = useState<JewelryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metalStock, setMetalStock] = useState<MetalStockType[]>([]);
  const [loading, setLoading] = useState(true);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsSettled, txSettled, stockSettled] = await Promise.allSettled([
        supabase.from('jewelry_items').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('metal_stock').select('*'),
      ]);
      if (itemsSettled.status === 'fulfilled' && itemsSettled.value.data) {
        setItems(itemsSettled.value.data as JewelryItem[]);
      }
      if (txSettled.status === 'fulfilled' && txSettled.value.data) {
        setTransactions(txSettled.value.data as Transaction[]);
      }
      if (stockSettled.status === 'fulfilled' && stockSettled.value.data) {
        setMetalStock(stockSettled.value.data as MetalStockType[]);
      }
      [itemsSettled, txSettled, stockSettled].forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`Supabase fetch failed [${['items', 'tx', 'stock'][i]}]:`, r.reason);
        }
      });
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void loadData();
  }, [session]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const closeMobileNav = () => setMobileNavOpen(false);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore write failure
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const activeItem = useMemo(() => NAV.find((n) => n.id === active) ?? NAV[0], [active]);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
            <ShieldCheck className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="font-display text-xl text-white mb-3">Configuration missing</h1>
          <p className="text-sm text-white/50">
            The app can't reach its database because required environment variables are not set.
            Please verify the deployment configuration and reload.
          </p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <LangContext.Provider value={{ lang, setLang, t, dir }}>
        <Login onSuccess={() => setSession} />
        <div className="fixed bottom-4 end-4 z-50">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#0f0f11]/80 px-3.5 py-2 text-sm font-medium text-[#d4af37] backdrop-blur-xl transition-colors hover:bg-[#d4af37]/20"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span>{t.langToggle}</span>
          </button>
        </div>
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      <div className="min-h-screen bg-[#0d0d0e] text-[#e7e3da] flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-40 h-screen w-72 shrink-0 border-white/5 bg-[#0f0f11] transition-transform duration-300 ${
            dir === 'rtl' ? 'right-0 border-l border-r-0' : 'left-0 border-r'
          } ${
            mobileNavOpen
              ? 'translate-x-0'
              : dir === 'rtl'
                ? 'translate-x-full lg:translate-x-0'
                : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex items-center gap-3">
                <img src="/glow-gallery-mark.svg" alt="Glow Gallery" className="h-11 w-auto" />
                <div>
                  <p className="font-display text-lg leading-none gold-text">{t.brand}</p>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">{t.brandTagline}</p>
                </div>
              </div>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  closeMobileNav();
                }}
                onTouchEnd={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  closeMobileNav();
                }}
                onClick={closeMobileNav}
                className="relative z-50 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                aria-label={t.closeNav}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 px-3 py-2">
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActive(item.id);
                      closeMobileNav();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                      dir === 'rtl' ? 'text-right' : 'text-left'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-[#d4af37]/15 to-transparent text-white'
                        : 'text-white/55 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37]'
                          : 'border-white/5 bg-white/5 text-white/60 group-hover:text-white/90'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{t[item.labelKey]}</span>
                      <span className="text-[11px] text-white/35">{t[item.descKey]}</span>
                    </span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse-soft ms-auto" />}
                  </button>
                );
              })}
            </nav>

            <div className="px-6 py-5 border-t border-white/5">
              <div className="rounded-xl border border-white/5 bg-[#0d0d0e] p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#d4af37]/80">{t.marketStatus}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                  <span className="text-sm text-white/80">{t.marketLive}</span>
                </div>
                <p className="mt-2 text-[11px] text-white/35">{t.marketNote}</p>
              </div>
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileNav}
          />
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0d0d0e]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="lg:hidden text-white/60 hover:text-white"
                  aria-label={t.openNav}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="font-display text-xl text-white sm:text-2xl">{t[activeItem.labelKey]}</h1>
                  <p className="text-xs text-white/40">{t[activeItem.descKey]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 sm:flex">
                  <Search className="h-4 w-4 text-white/40" />
                  <input
                    placeholder={t.searchPlaceholder}
                    className="w-56 bg-transparent text-sm text-white/80 placeholder:text-white/30 focus:outline-none"
                  />
                  <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">⌘K</kbd>
                </div>
                <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 sm:flex">
                  <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-xs font-medium text-white/60">{t.adminLabel}</span>
                </div>
                <button
                  onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                  className="flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
                  aria-label="Toggle language"
                >
                  <Languages className="h-4 w-4" />
                  <span>{t.langToggle}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={t.logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
                  <p className="text-sm text-white/40">{t.loadingData}</p>
                </div>
              </div>
            ) : (
              <div key={active} className="animate-fade-in">
                {active === 'metals' && <MetalAnalytics metalStock={metalStock} />}
                {active === 'finance' && (
                  <Finance transactions={transactions} items={items} onReload={loadData} />
                )}
                {active === 'inventory' && <Inventory items={items} onReload={loadData} />}
                {active === 'stock' && <MetalStock metalStock={metalStock} />}
                {active === 'scanner' && <Scanner items={items} />}
                {active === 'invoice' && <InvoiceGenerator metalStock={metalStock} />}
              </div>
            )}
          </main>
        </div>
      </div>
    </LangContext.Provider>
  );
}

export default App;
