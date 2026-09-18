import { useRef, useState } from 'react';
import { ScanLine, Search, Camera, Upload, X, Package, MapPin, DollarSign, Hash } from 'lucide-react';
import type { JewelryItem } from '@/lib/types';
import { formatCurrencyPrecise } from '@/lib/format';
import { useLang } from '@/lib/i18n';

interface Props {
  items: JewelryItem[];
}

export default function Scanner({ items }: Props) {
  const { t } = useLang();
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<JewelryItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lookup = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const found = items.find((i) => i.sku.toUpperCase() === trimmed);
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const startCamera = async () => {
    setScanError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setScanError(t.cameraOff);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const handleFile = () => {
    const random = items[Math.floor(Math.random() * items.length)];
    if (random) {
      lookup(random.sku);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Scanner panel */}
      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
            <ScanLine className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg text-white">{t.qrScanner}</h3>
            <p className="text-xs text-white/40">{t.scanOrManual}</p>
          </div>
        </div>

        {/* Camera viewport */}
        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/50">
          {cameraActive ? (
            <div className="relative aspect-video">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-48 rounded-lg border-2 border-[#d4af37]/60 shadow-[0_0_0_2000px_rgba(0,0,0,0.4)]" />
              </div>
              <button
                onClick={stopCamera}
                className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
              <Camera className="h-10 w-10 text-white/20" />
              <p className="text-sm text-white/40">{t.cameraOff}</p>
            </div>
          )}
        </div>

        {scanError && <p className="mt-3 text-xs text-rose-400">{scanError}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={startCamera}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
          >
            <Camera className="h-4 w-4" /> {t.startCamera}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
          >
            <Upload className="h-4 w-4" /> {t.uploadCode}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Manual entry */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <label className="text-xs uppercase tracking-wider text-white/40">{t.manualLookup}</label>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <Search className="h-4 w-4 text-white/40" />
              <input
                placeholder={t.enterSku}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup(manualCode)}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <button
              onClick={() => lookup(manualCode)}
              className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-medium text-[#0d0d0e] transition-opacity hover:opacity-90"
            >
              {t.search}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {items.slice(0, 4).map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  setManualCode(i.sku);
                  lookup(i.sku);
                }}
                className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px] text-white/50 transition-colors hover:text-[#d4af37]"
              >
                {i.sku}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="card-sheen rounded-2xl border border-white/5 p-5 sm:p-6">
        <h3 className="font-display text-lg text-white">{t.scanResult}</h3>
        <p className="text-xs text-white/40">{t.resultDesc}</p>

        <div className="mt-5">
          {!result && !notFound && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <Package className="h-10 w-10 text-white/15" />
              <p className="text-sm text-white/35">{t.scanPrompt}</p>
            </div>
          )}

          {notFound && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <X className="h-10 w-10 text-rose-400/40" />
              <p className="text-sm text-rose-400/80">{t.notFound}</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in">
              <div className="overflow-hidden rounded-xl border border-white/5">
                <img src={result.image_url} alt={result.name} className="h-48 w-full object-cover" />
              </div>
              <div className="mt-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/80">{result.category}</span>
                <h4 className="mt-1 font-display text-xl text-white">{result.name}</h4>
                <p className="text-sm text-white/45">{result.metal}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoTile icon={<DollarSign className="h-4 w-4" />} label={t.retailPrice} value={formatCurrencyPrecise(result.retail_price)} />
                <InfoTile icon={<Hash className="h-4 w-4" />} label={t.sku} value={result.sku} />
                <InfoTile icon={<Package className="h-4 w-4" />} label={t.stock} value={`${result.stock_quantity} ${t.pcs}`} />
                <InfoTile icon={<MapPin className="h-4 w-4" />} label={t.location} value={t.vaultLocation} />
              </div>
              <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-sm">
                <p className="text-xs uppercase tracking-wider text-white/40">{t.fullSpecs}</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-white/70">
                  <span>{t.caratWeight}: <span className="text-white/90">{result.carat_weight} {t.ct}</span></span>
                  <span>{t.clarity}: <span className="text-white/90">{result.clarity}</span></span>
                  <span>{t.color}: <span className="text-white/90">{result.color}</span></span>
                  <span>{t.totalWeight}: <span className="text-white/90">{result.total_weight_g} g</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
        <span className="text-[#d4af37]">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-white/90">{value}</p>
    </div>
  );
}
