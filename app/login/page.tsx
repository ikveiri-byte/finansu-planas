"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
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

  const field =
    "app-focusable w-full min-h-[50px] rounded-control border border-line bg-sunken-2 px-3.5 text-[15px] text-ink outline-none";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col gap-3">
          <span className="block h-10 w-10 rounded-[14px] bg-accent" aria-hidden="true" />
          <h1 className="app-display text-[38px] leading-none">Finansai</h1>
          <p className="text-[15px] text-ink-2">Prisijunk, kad pamatytum savo mėnesį.</p>
        </div>

        <form onSubmit={handleSubmit} className="app-card rounded-panel px-6 py-7">
          <label htmlFor="pastas" className="mb-2 block text-[13px] font-bold text-ink-2">
            El. paštas
          </label>
          <input
            id="pastas"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} mb-5`}
          />

          <label htmlFor="slaptazodis" className="mb-2 block text-[13px] font-bold text-ink-2">
            Slaptažodis
          </label>
          <input
            id="slaptazodis"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} mb-5`}
          />

          {error && (
            <p
              className="mb-5 flex items-start gap-2 rounded-control px-3.5 py-3 text-[13.5px]"
              style={{ color: "var(--danger)", background: "var(--danger-soft)" }}
            >
              <CircleAlert
                size={17}
                strokeWidth={1.9}
                className="mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="app-focusable min-h-[52px] w-full rounded-control bg-ink text-[15px] font-bold text-card disabled:opacity-50"
          >
            {loading ? "Jungiamasi…" : "Prisijungti"}
          </button>
        </form>
      </div>
    </main>
  );
}
