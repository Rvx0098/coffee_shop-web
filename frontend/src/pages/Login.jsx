import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IMG = "https://images.unsplash.com/photo-1660144128596-ee0e16e1d100?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function Login() {
  const { login, formatApiError } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) { setErr("Please enter email and password."); return; }
    setBusy(true);
    try {
      const u = await login(email, password);
      nav(u.role === "admin" ? "/admin" : "/");
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || "Login failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" data-testid="login-page">
      <div className="hidden md:block relative">
        <img src={IMG} alt="Cappuccino" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full p-12 flex flex-col justify-end text-white">
          <p className="overline text-[color:var(--accent)] mb-3">Welcome back</p>
          <h2 className="font-heading text-4xl lg:text-5xl leading-tight">Your usual is ready.</h2>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
          <Link to="/" className="font-heading text-2xl">Coffee Bliss</Link>
          <h1 className="font-heading text-3xl mt-6">Sign in</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1 mb-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[color:var(--accent)]" data-testid="go-register">
              Create one
            </Link>
          </p>

          <label className="block mb-4">
            <span className="text-sm text-[color:var(--text-secondary)]">Email</span>
            <input type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" required />
          </label>
          <label className="block mb-5">
            <span className="text-sm text-[color:var(--text-secondary)]">Password</span>
            <input type="password" className="input-field mt-1" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" required />
          </label>

          {err && <p className="text-sm text-red-600 mb-3" data-testid="login-error">{err}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="login-submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-[color:var(--text-muted)] mt-6 text-center">
            Demo admin: admin@coffeebliss.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
