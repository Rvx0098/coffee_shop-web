import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu as MenuIcon, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setDrawerOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "py-5"
      }`}
      data-testid="main-navbar"
    >
      <div className="container-bliss flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <span className="w-9 h-9 rounded-full bg-[color:var(--mocha)] text-[color:var(--bg)] grid place-items-center font-heading text-xl">
            b
          </span>
          <span className="font-heading text-2xl tracking-tight">Coffee Bliss</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${
                  isActive ? "text-[color:var(--accent)]" : "link-ghost"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 link-ghost"
            aria-label="Cart"
            data-testid="nav-cart-button"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-1 -right-1 text-[10px] bg-[color:var(--accent)] text-white rounded-full w-5 h-5 grid place-items-center"
              >
                {count}
              </span>
            )}
          </button>

          {user && user !== false ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-xs px-3 py-1.5 rounded-full bg-[color:var(--mocha)] text-white"
                  data-testid="nav-admin-link"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-[color:var(--text-secondary)]" data-testid="nav-user-name">
                {user.name}
              </span>
              <button onClick={() => { logout(); navigate("/"); }} className="p-2 link-ghost" data-testid="nav-logout-button" aria-label="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 text-sm link-ghost"
              data-testid="nav-login-link"
            >
              <User className="w-4 h-4" /> Sign in
            </Link>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass mt-3 border-t border-[color:var(--border-soft)]">
          <div className="container-bliss py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="py-2 link-ghost"
                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Link>
            ))}
            {user && user !== false ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="py-2 link-ghost">Admin</Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="text-left py-2 link-ghost">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2 link-ghost">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
