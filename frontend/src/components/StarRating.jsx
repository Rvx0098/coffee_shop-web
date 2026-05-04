import { Star } from "lucide-react";

export default function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`} data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "fill-[color:var(--accent)] text-[color:var(--accent)]" : "text-[color:var(--border-soft)]"
          }`}
        />
      ))}
    </div>
  );
}
