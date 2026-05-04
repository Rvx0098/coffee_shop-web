import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Navigate } from "react-router-dom";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", price: "", category: "coffee", image: "", featured: false };

export default function Admin() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {}
  };

  if (loading) return <div className="pt-28 text-center">Checking access…</div>;
  if (!user || user === false) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const change = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.description || !form.image || !form.price) {
      setErr("All fields are required.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/products", { ...form, price: parseFloat(form.price) });
      toast.success("Product added");
      setForm(EMPTY);
      refresh();
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || "Could not add.");
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Removed");
      refresh();
    } catch { toast.error("Could not remove."); }
  };

  return (
    <div className="pt-28 pb-16" data-testid="admin-page">
      <section className="container-bliss">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="overline mb-2">Dashboard</p>
            <h1 className="font-heading text-4xl">Menu management</h1>
          </div>
          <span className="text-sm text-[color:var(--text-secondary)]">
            Signed in as <span className="font-medium">{user.email}</span>
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={create} className="testimonial-card lg:col-span-1 self-start" data-testid="admin-product-form">
            <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[color:var(--accent)]" /> Add product
            </h2>
            <label className="block mb-3">
              <span className="text-sm">Name</span>
              <input className="input-field mt-1" value={form.name} onChange={change("name")} data-testid="admin-name" />
            </label>
            <label className="block mb-3">
              <span className="text-sm">Description</span>
              <textarea rows="3" className="input-field mt-1" value={form.description} onChange={change("description")} data-testid="admin-desc" />
            </label>
            <label className="block mb-3">
              <span className="text-sm">Price (USD)</span>
              <input type="number" step="0.01" className="input-field mt-1" value={form.price} onChange={change("price")} data-testid="admin-price" />
            </label>
            <label className="block mb-3">
              <span className="text-sm">Category</span>
              <select className="input-field mt-1" value={form.category} onChange={change("category")} data-testid="admin-category">
                <option value="coffee">Coffee</option>
                <option value="beverages">Beverages</option>
                <option value="desserts">Desserts</option>
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm">Image URL</span>
              <input className="input-field mt-1" value={form.image} onChange={change("image")} data-testid="admin-image" />
            </label>
            <label className="flex items-center gap-2 mb-4 text-sm">
              <input type="checkbox" checked={form.featured} onChange={change("featured")} data-testid="admin-featured" />
              Featured on home page
            </label>
            {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="admin-submit">
              {busy ? "Adding…" : "Add to menu"}
            </button>
          </form>

          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[color:var(--border-soft)] overflow-hidden" data-testid="admin-product-list">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--surface-alt)] text-left">
                <tr>
                  <th className="p-3 font-medium">Item</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[color:var(--border-soft)]" data-testid={`admin-row-${p.id}`}>
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-[color:var(--text-muted)] line-clamp-1 max-w-xs">{p.description}</p>
                      </div>
                    </td>
                    <td className="p-3 capitalize text-[color:var(--text-secondary)]">{p.category}</td>
                    <td className="p-3">${p.price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => remove(p.id)} className="text-[color:var(--text-muted)] hover:text-red-600" data-testid={`admin-delete-${p.id}`} aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-[color:var(--text-muted)]">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
