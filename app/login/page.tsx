"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

  const inputStyle = { border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" } as const;

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#f1f5f9" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl p-8" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <h1 className="text-2xl font-bold text-[#111] mb-1">Finansai</h1>
        <p className="text-muted text-sm mb-6">Prisijunk, kad pamatytum savo mėnesį.</p>

        <label className="block text-xs text-muted mb-1">El. paštas</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4" style={inputStyle} />

        <label className="block text-xs text-muted mb-1">Slaptažodis</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4" style={inputStyle} />

        {error && <p className="text-sm mb-4" style={{ color: "#dc2626" }}>{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-xl text-white font-semibold py-2.5 disabled:opacity-50" style={{ background: "#3b82f6" }}>
          {loading ? "Jungiamasi…" : "Prisijungti"}
        </button>
      </form>
    </main>
  );
}
