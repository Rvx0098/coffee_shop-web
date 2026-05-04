import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "beverages", label: "Beverages" },
  { id: "desserts", label: "Desserts" },
];

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/products${category !== "all" ? `?category=${category}` : ""}`)
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="pt-28" data-testid="menu-page">
      <section className="container-bliss py-12 text-center">
        <p className="overline mb-3">Our Menu</p>
        <h1 className="font-heading text-5xl sm:text-6xl mb-4">Brewed. Baked. Blissful.</h1>
        <p className="text-[color:var(--text-secondary)] max-w-xl mx-auto">
          Everything we serve is crafted in small batches, daily. Explore our signature coffees, thoughtful beverages, and house-baked desserts.
        </p>
      </section>

      <section className="container-bliss">
        <div className="flex flex-wrap gap-3 justify-center mb-10" data-testid="menu-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`cat-pill ${category === c.id ? "active" : ""}`}
              data-testid={`category-${c.id}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[color:var(--text-muted)] py-20">Brewing your menu…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-[color:var(--text-muted)] py-20">No items in this category yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12" data-testid="menu-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
