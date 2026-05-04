import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IMG = "https://images.unsplash.com/photo-1660144128607-7111bfaa5613?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function Register() {
  const { register, formatApiError } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password) { setErr("Please fill every field."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      nav("/");
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || "Registration failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" data-testid="register-page">
      <div className="flex items-center justify-center p-8 order-2 md:order-1">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="register-form">
          <Link to="/" className="font-heading text-2xl">Coffee Bliss</Link>
          <h1 className="font-heading text-3xl mt-6">Create your account</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1 mb-6">
            Already a regular?{" "}
            <Link to="/login" className="text-[color:var(--accent)]" data-testid="go-login">Sign in</Link>
          </p>

          <label className="block mb-4">
            <span className="text-sm text-[color:var(--text-secondary)]">Name</span>
            <input className="input-field mt-1" value={form.name} onChange={change("name")} data-testid="register-name" required />
          </label>
          <label className="block mb-4">
            <span className="text-sm text-[color:var(--text-secondary)]">Email</span>
            <input type="email" className="input-field mt-1" value={form.email} onChange={change("email")} data-testid="register-email" required />
          </label>
          <label className="block mb-4">
            <span className="text-sm text-[color:var(--text-secondary)]">Password</span>
            <input type="password" className="input-field mt-1" value={form.password} onChange={change("password")} data-testid="register-password" required />
          </label>
          <label className="block mb-5">
            <span className="text-sm text-[color:var(--text-secondary)]">Confirm password</span>
            <input type="password" className="input-field mt-1" value={form.confirm} onChange={change("confirm")} data-testid="register-confirm" required />
          </label>

          {err && <p className="text-sm text-red-600 mb-3" data-testid="register-error">{err}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="register-submit">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
      <div className="hidden md:block relative order-1 md:order-2">
        <img src={IMG} alt="Latte" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full p-12 flex flex-col justify-end text-white">
          <p className="overline text-[color:var(--accent)] mb-3">Join the regulars</p>
          <h2 className="font-heading text-4xl lg:text-5xl leading-tight">A cafe that knows your order.</h2>
        </div>
      </div>
    </div>
  );
}
