import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateQty, removeItem, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const checkout = async () => {
    if (!user || user === false) {
      setDrawerOpen(false);
      navigate("/login");
      return;
    }
    if (items.length === 0) return;
    setPlacing(true);
    try {
      await api.post("/orders", { items, total });
      clear();
      toast.success("Order placed! We'll have it ready soon.");
      setDrawerOpen(false);
    } catch (e) {
      toast.error("Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setDrawerOpen(false)}
          data-testid="cart-drawer-backdrop"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between p-5 border-b border-[color:var(--border-soft)]">
          <h3 className="font-heading text-2xl">Your Cart</h3>
          <button onClick={() => setDrawerOpen(false)} className="p-2 link-ghost" aria-label="Close" data-testid="cart-close-button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 h-[calc(100vh-220px)] overflow-y-auto space-y-4">
          {items.length === 0 && (
            <div className="text-center py-20 text-[color:var(--text-muted)]" data-testid="cart-empty">
              <p className="font-heading text-xl mb-2">Nothing here yet</p>
              <p className="text-sm">Add something warm to your cart.</p>
            </div>
          )}
          {items.map((i) => (
            <div key={i.product_id} className="flex gap-3" data-testid={`cart-item-${i.product_id}`}>
              <img src={i.image} alt={i.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-[color:var(--text-primary)]">{i.name}</p>
                  <button onClick={() => removeItem(i.product_id)} className="text-[color:var(--text-muted)] hover:text-[color:var(--accent)]" data-testid={`cart-remove-${i.product_id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[color:var(--text-secondary)]">${i.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(i.product_id, i.quantity - 1)} className="w-7 h-7 border border-[color:var(--border-soft)] rounded-full grid place-items-center hover:border-[color:var(--accent)]" data-testid={`cart-qty-dec-${i.product_id}`}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm" data-testid={`cart-qty-${i.product_id}`}>{i.quantity}</span>
                  <button onClick={() => updateQty(i.product_id, i.quantity + 1)} className="w-7 h-7 border border-[color:var(--border-soft)] rounded-full grid place-items-center hover:border-[color:var(--accent)]" data-testid={`cart-qty-inc-${i.product_id}`}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-[color:var(--border-soft)] bg-white">
          <div className="flex justify-between mb-4">
            <span className="text-[color:var(--text-secondary)]">Subtotal</span>
            <span className="font-heading text-xl" data-testid="cart-total">${total.toFixed(2)}</span>
          </div>
          <button onClick={checkout} disabled={items.length === 0 || placing} className="btn-primary w-full" data-testid="cart-checkout-button">
            {placing ? "Placing..." : "Checkout"}
          </button>
        </div>
      </aside>
    </>
  );
}
