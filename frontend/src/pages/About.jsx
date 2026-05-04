const TEAM = [
  {
    name: "Imani Clarke",
    role: "Head Roaster",
    img: "https://images.unsplash.com/photo-1672462478040-a5920e2c23d8?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    name: "Daniel Moreau",
    role: "Lead Barista",
    img: "https://images.unsplash.com/photo-1635088047149-0d698fb5f849?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    name: "Giulia Ferrari",
    role: "Pastry Chef",
    img: "https://images.unsplash.com/photo-1592234789031-94bf65f630ed?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
];

export default function About() {
  return (
    <div className="pt-28" data-testid="about-page">
      {/* Story */}
      <section className="section">
        <div className="container-bliss grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <p className="overline mb-3">Our Story</p>
            <h1 className="font-heading text-5xl sm:text-6xl leading-[1.05] mb-6">
              A neighborhood cafe, built on <em className="italic text-[color:var(--accent)]">obsession</em> with good coffee.
            </h1>
            <p className="text-[color:var(--text-secondary)] leading-relaxed mb-4">
              Coffee Bliss was born from a tiny roaster in a Brookline garage in 2019. What started as a weekend hobby has become a quiet favorite, where regulars know the baristas by name and the baristas know exactly how you take your cappuccino.
            </p>
            <p className="text-[color:var(--text-secondary)] leading-relaxed">
              We believe good coffee is a daily act of care — for the farmers who grew it, the hands that roasted it, and the person holding the cup.
            </p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1669131196146-898b2dd8ab1d?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="Cafe"
              className="rounded-xl aspect-[3/4] object-cover w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1718552160371-82f3b1cf6e09?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="Coffee"
              className="rounded-xl aspect-[3/4] object-cover w-full mt-8"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-[color:var(--surface-alt)]">
        <div className="container-bliss grid md:grid-cols-2 gap-10">
          <div className="p-8">
            <p className="overline mb-2">Mission</p>
            <h2 className="font-heading text-3xl mb-4">Brew with purpose.</h2>
            <p className="text-[color:var(--text-secondary)] leading-relaxed">
              To source coffee transparently, roast it with skill, and serve it in a space that feels like a deep breath.
            </p>
          </div>
          <div className="p-8">
            <p className="overline mb-2">Vision</p>
            <h2 className="font-heading text-3xl mb-4">A cafe on every quiet street.</h2>
            <p className="text-[color:var(--text-secondary)] leading-relaxed">
              To build small, soulful cafes that reinvest in their neighborhoods and the farmers who make our craft possible.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container-bliss">
          <div className="text-center mb-12">
            <p className="overline mb-2">The team</p>
            <h2 className="font-heading text-4xl sm:text-5xl">People behind the cup</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map((m, i) => (
              <div key={i} className="text-center" data-testid={`team-member-${i}`}>
                <div className="overflow-hidden rounded-2xl mb-4">
                  <img src={m.img} alt={m.name} className="aspect-[4/5] w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="font-heading text-2xl">{m.name}</h3>
                <p className="text-sm text-[color:var(--accent)] uppercase tracking-widest">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
