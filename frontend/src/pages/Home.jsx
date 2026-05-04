import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Coffee, Award } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";

const HERO = "https://images.unsplash.com/photo-1718552160371-82f3b1cf6e09?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setFeatured(r.data.slice(0, 3))).catch(() => {});
    api.get("/testimonials").then((r) => setTestimonials(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
        <img src={HERO} alt="Warm cafe interior" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 h-full container-bliss flex flex-col justify-end pb-24">
          <p className="overline text-[color:var(--accent)] mb-4 fade-up" data-testid="hero-overline">Small batch · roasted in Brookline</p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] max-w-3xl fade-up" style={{ animationDelay: "0.1s" }} data-testid="hero-title">
            Coffee, made with <em className="italic text-[color:var(--accent)]">intention.</em>
          </h1>
          <p className="text-white/85 text-lg max-w-xl mt-6 leading-relaxed fade-up" style={{ animationDelay: "0.2s" }}>
            A quiet corner of the city for slow mornings, serious espresso, and pastries that taste like home.
          </p>
          <div className="flex gap-3 mt-8 fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/menu" className="btn-primary" data-testid="hero-cta-menu">
              Explore Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="btn-secondary" style={{ borderColor: "rgba(255,255,255,0.7)", color: "white" }} data-testid="hero-cta-story">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" data-testid="values-section">
        <div className="container-bliss grid md:grid-cols-3 gap-8">
          {[
            { icon: Leaf, title: "Ethically sourced", body: "Direct trade beans from smallholder farms in Yirgacheffe, Huila, and Sidamo." },
            { icon: Coffee, title: "Roasted daily", body: "Small-batch roasted on-site every morning so your cup is never more than 48 hours old." },
            { icon: Award, title: "Barista-crafted", body: "World-class specialty training. Every drink dialed-in to the gram and the second." },
          ].map((v, i) => (
            <div key={i} className="p-8" data-testid={`value-card-${i}`}>
              <v.icon className="w-8 h-8 text-[color:var(--accent)] mb-4" />
              <h3 className="font-heading text-2xl mb-2">{v.title}</h3>
              <p className="text-[color:var(--text-secondary)] leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section bg-[color:var(--surface-alt)]" data-testid="featured-section">
        <div className="container-bliss">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="overline mb-2">Signature picks</p>
              <h2 className="font-heading text-4xl sm:text-5xl">What we're pouring</h2>
            </div>
            <Link to="/menu" className="link-ghost hidden md:inline-flex items-center gap-2 text-sm" data-testid="featured-see-all">
              See full menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" data-testid="testimonials-section">
        <div className="container-bliss">
          <div className="text-center mb-12">
            <p className="overline mb-2">Kind words</p>
            <h2 className="font-heading text-4xl sm:text-5xl">Loved by regulars</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card" data-testid={`testimonial-${t.id}`}>
                <StarRating rating={t.rating} />
                <p className="font-heading italic text-lg text-[color:var(--text-primary)] mt-4 leading-snug">
                  “{t.comment}”
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-[color:var(--text-muted)]">Regular since 2023</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
