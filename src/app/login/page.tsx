"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
    } else {
      window.location.assign("/");
    }

    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signUpError) {
      setError(signUpError.message.includes("anonymous")
        ? "Email registration is not enabled in Supabase yet. Enable the Email provider under Authentication > Sign In / Providers."
        : signUpError.message);
    }
    else setMessage("Check your email to confirm your account, then come back to sign in.");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark"><Sparkles size={18} /></span><strong>habora</strong></div>
        <p className="eyebrow">Your personal space</p>
        <h1>Keep life&apos;s details close.</h1>
        <p className="auth-copy">Sign in to see what needs your attention and keep your household moving calmly.</p>
        <form onSubmit={mode === "signin" ? handleSubmit : (event) => { event.preventDefault(); void handleSignUp(); }} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete="current-password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status"><CheckCircle2 size={15} />{message}</p>}
          <button className="primary-button auth-submit" disabled={loading}>{loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={16} /></button>
        </form>
        <button className="auth-signup" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} disabled={loading}>
          {mode === "signin" ? "Create a new account" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}