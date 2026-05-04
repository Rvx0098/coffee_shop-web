import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} added`);
  };

  return (
    <article className="product-card group" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 overline bg-white/90 backdrop-blur px-2 py-1 rounded-sm" data-testid={`product-category-${product.id}`}>
          {product.category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-heading text-xl text-[color:var(--text-primary)]" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          <span className="font-heading text-lg text-[color:var(--accent)]" data-testid={`product-price-${product.id}`}>
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-5 line-clamp-2">
          {product.description}
        </p>
        <button
          onClick={handleAdd}
          className="btn-primary w-full"
          data-testid={`product-add-${product.id}`}
        >
          <Plus className="w-4 h-4" /> Add to cart
        </button>
      </div>
    </article>
  );
}
