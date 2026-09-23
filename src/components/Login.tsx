import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';

interface Props {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: Props) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(t.loginError);
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError(t.loginError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src="/glow-gallery-mark.svg" alt="Glow Gallery" className="h-16 w-auto" />
          <div className="text-center">
            <h1 className="font-display text-2xl gold-text">{t.brand}</h1>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/40 mt-1">{t.brandTagline}</p>
          </div>
        </div>

        {/* Login card */}
        <div className="card-sheen rounded-2xl border border-white/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg text-white">{t.loginTitle}</h2>
              <p className="text-xs text-white/40">{t.loginSubtitle}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                {t.loginEmail}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 transition-colors focus-within:border-[#d4af37]/40">
                <Mail className="h-4 w-4 text-white/40 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.loginEmailPlaceholder}
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                {t.loginPassword}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 transition-colors focus-within:border-[#d4af37]/40">
                <Lock className="h-4 w-4 text-white/40 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.loginPasswordPlaceholder}
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-white/40 transition-colors hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#0d0d0e] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t.loginSigningIn : t.loginButton}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/25">
          {t.brand} · {t.adminLabel}
        </p>
      </div>
    </div>
  );
}
