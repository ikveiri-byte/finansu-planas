"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletCards, Mail, LockKeyhole, CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CardWaves from "@/components/CardWaves";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Neteisingas el. paštas arba slaptažodis.");
      return;
    }
    router.replace("/menuo");
    router.refresh();
  }

  const fieldWrapStyle = {
    border: "1.5px solid var(--line)",
    borderRadius: "var(--radius-control)",
    background: "var(--surface)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "4px 4px 4px 4px",
  } as const;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--app-bg)" }}>
      <div className="w-full max-w-[500px] mx-auto flex flex-col flex-1">
        <div className="app-hero relative overflow-hidden" style={{ borderRadius: "0 0 var(--radius-panel) var(--radius-panel)", padding: "56px 28px 64px" }}>
          <CardWaves opacity={0.18} />
          <div className="relative z-10">
            <span
              className="flex items-center justify-center rounded-card mb-6"
              style={{ width: 68, height: 68, background: "rgba(255,255,255,0.12)" }}
            >
              <WalletCards size={32} strokeWidth={1.7} color="#fff" aria-hidden="true" />
            </span>
            <h1 className="text-[40px] font-bold text-white leading-none mb-3">Finansai</h1>
            <p className="text-[15px]" style={{ color: "rgba(255,255,255,.75)" }}>Prisijunk, kad pamatytum savo mėnesį.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="app-surface flex-1"
          style={{ borderRadius: "var(--radius-panel) var(--radius-panel) 0 0", marginTop: -28, padding: "32px 24px", position: "relative", zIndex: 10 }}
        >
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--navy-900)" }}>El. paštas</label>
          <div style={fieldWrapStyle} className="mb-5">
            <span className="flex items-center justify-center rounded-[10px] flex-shrink-0" style={{ width: 40, height: 40, background: "var(--line-soft)", color: "var(--blue-700)" }}>
              <Mail size={17} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none"
              style={{ fontSize: 14, color: "var(--text)", minHeight: 48, paddingRight: 12 }}
              aria-label="El. paštas"
            />
          </div>

          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--navy-900)" }}>Slaptažodis</label>
          <div style={fieldWrapStyle} className="mb-5">
            <span className="flex items-center justify-center rounded-[10px] flex-shrink-0" style={{ width: 40, height: 40, background: "var(--line-soft)", color: "var(--blue-700)" }}>
              <LockKeyhole size={17} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none"
              style={{ fontSize: 14, color: "var(--text)", minHeight: 48, paddingRight: 12 }}
              aria-label="Slaptažodis"
            />
          </div>

          {error && (
            <p
              className="flex items-start gap-2 text-sm mb-5 rounded-control px-3.5 py-3"
              style={{ color: "var(--danger)", background: "var(--danger-soft)" }}
            >
              <CircleAlert size={17} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-control text-white font-semibold disabled:opacity-50 app-focusable"
            style={{ background: "linear-gradient(135deg, var(--blue-700), var(--blue-500))", minHeight: 52, fontSize: 15 }}
          >
            {loading ? "Jungiamasi…" : "Prisijungti"}
          </button>
        </form>
      </div>
    </main>
  );
}
