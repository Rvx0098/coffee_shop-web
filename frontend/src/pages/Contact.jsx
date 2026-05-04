import { useState } from "react";
import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { api, formatApiError } from "../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErr("Please fill in every field.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/contact", form);
      toast.success("Thanks! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || "Could not send.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-28" data-testid="contact-page">
      <section className="section">
        <div className="container-bliss grid lg:grid-cols-2 gap-12">
          {/* Left: info */}
          <div>
            <p className="overline mb-3">Say hello</p>
            <h1 className="font-heading text-5xl sm:text-6xl mb-6">Come find us.</h1>
            <p className="text-[color:var(--text-secondary)] leading-relaxed mb-10 max-w-lg">
              Stop by for an espresso, or send us a note. We love hearing from people who love good coffee.
            </p>

            <ul className="space-y-6">
              <li className="flex gap-4" data-testid="contact-address">
                <MapPin className="w-5 h-5 text-[color:var(--accent)] mt-1" />
                <div>
                  <p className="font-medium">Our Cafe</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">221 Maple Lane, Brookline, MA 02446</p>
                </div>
              </li>
              <li className="flex gap-4" data-testid="contact-phone">
                <Phone className="w-5 h-5 text-[color:var(--accent)] mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">+1 (617) 555-0127</p>
                </div>
              </li>
              <li className="flex gap-4" data-testid="contact-email">
                <Mail className="w-5 h-5 text-[color:var(--accent)] mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">hello@coffeebliss.com</p>
                </div>
              </li>
              <li className="flex gap-4" data-testid="contact-hours">
                <Clock className="w-5 h-5 text-[color:var(--accent)] mt-1" />
                <div>
                  <p className="font-medium">Opening hours</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">
                    Mon – Fri: 7am – 7pm<br />
                    Sat – Sun: 8am – 8pm
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-10 overflow-hidden rounded-xl border border-[color:var(--border-soft)] aspect-[16/9]" data-testid="map-placeholder">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Map"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: form */}
          <form onSubmit={submit} className="testimonial-card self-start" data-testid="contact-form">
            <h2 className="font-heading text-3xl mb-1">Send a note</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-6">We typically reply within a day.</p>

            <label className="block mb-4">
              <span className="text-sm text-[color:var(--text-secondary)]">Name</span>
              <input className="input-field mt-1" value={form.name} onChange={change("name")} data-testid="contact-name" required />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-[color:var(--text-secondary)]">Email</span>
              <input type="email" className="input-field mt-1" value={form.email} onChange={change("email")} data-testid="contact-email-input" required />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-[color:var(--text-secondary)]">Message</span>
              <textarea rows="5" className="input-field mt-1" value={form.message} onChange={change("message")} data-testid="contact-message" required />
            </label>

            {err && <p className="text-sm text-red-600 mb-3" data-testid="contact-error">{err}</p>}

            <button type="submit" className="btn-primary w-full" disabled={busy} data-testid="contact-submit">
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
