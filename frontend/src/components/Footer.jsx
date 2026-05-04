import { Instagram, Twitter, Facebook, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[color:var(--mocha)] text-[color:var(--bg)] mt-20" data-testid="site-footer">
      <div className="container-bliss py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-6 h-6 text-[color:var(--accent)]" />
            <span className="font-heading text-2xl">Coffee Bliss</span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            Small-batch roasts and quiet mornings. Brewed with intention, served with care.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-lg mb-4">Visit</h4>
          <p className="text-sm opacity-80 leading-relaxed">
            221 Maple Lane<br />
            Brookline, MA 02446<br />
            +1 (617) 555-0127
          </p>
        </div>

        <div>
          <h4 className="font-heading text-lg mb-4">Explore</h4>
          <ul className="text-sm space-y-2 opacity-80">
            <li><Link to="/menu" className="hover:text-[color:var(--accent)]">Menu</Link></li>
            <li><Link to="/about" className="hover:text-[color:var(--accent)]">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-[color:var(--accent)]">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-lg mb-4">Follow</h4>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="hover:text-[color:var(--accent)]" data-testid="social-instagram"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-[color:var(--accent)]" data-testid="social-twitter"><Twitter className="w-5 h-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-[color:var(--accent)]" data-testid="social-facebook"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-bliss py-5 text-xs opacity-70 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Coffee Bliss. All rights reserved.</span>
          <span>Brewed in small batches, daily.</span>
        </div>
      </div>
    </footer>
  );
}
