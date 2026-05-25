import { Link } from 'react-router-dom';
import { ArrowRight, Award, Building2, Gem, Handshake, MapPinned, Palette, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import './About.css';

const AWARDS = [
  { year: '2024', title: 'Regional Choice Tile Retailer' },
  { year: '2025', title: 'Outstanding Digital Tile Store' },
  { year: '2026', title: 'Preferred Home Finish Supplier' }
];

const PROMISES = [
  { icon: <Gem size={28} />, title: 'Product Superiority', text: 'Carefully selected ceramic, porcelain, glass, natural stone, and decorative tiles for long-lasting interiors.' },
  { icon: <Palette size={28} />, title: 'Widest Selection', text: 'Curated styles for kitchens, baths, living spaces, accents, and commercial surfaces.' },
  { icon: <Handshake size={28} />, title: 'Helpful Guidance', text: 'Practical support from selection to checkout, including quantity planning and order assistance.' },
  { icon: <MapPinned size={28} />, title: 'Local Accessibility', text: 'A Legazpi and Daraga-focused operation built to serve homes, designers, contractors, and growing businesses.' }
];

const METRICS = [
  { value: '8+', label: 'years sourcing tiles' },
  { value: '1,200+', label: 'customer projects served' },
  { value: '5', label: 'specialty tile categories' },
  { value: '24-48h', label: 'typical order coordination' }
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <video autoPlay muted loop playsInline className="about-hero-video">
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <span className="about-eyebrow">About TileMatch</span>
          <h1>Helping every space find the tile that fits.</h1>
          <p>TileMatch is a Philippine tile retailer focused on practical style, dependable sourcing, and a smoother way to shop for quality finishes online.</p>
          <div className="about-hero-actions">
            <Link className="btn btn-primary btn-lg" to="/shop">Explore Tiles <ArrowRight size={18} /></Link>
            <Link className="btn btn-secondary btn-lg" to="/contact">Talk to Our Team</Link>
          </div>
        </div>
      </section>

      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-section-copy">
            <span className="about-section-kicker">Our Story</span>
            <h2>Built for homeowners, designers, and builders who need choices they can trust.</h2>
          </div>
          <div className="about-story-text">
            <p>
              TileMatch began as a small tile sourcing service for local renovation projects in Bicol.
              As customers asked for more variety, clearer pricing, and easier ordering, the business grew into a digital-first tile shop with a curated catalog for modern homes and commercial spaces.
            </p>
            <p>
              Today, our team works with trusted suppliers to offer ceramic, porcelain, glass, natural stone, and decorative tiles that balance durability with design. We keep the experience simple: browse, compare, estimate, checkout, and track your order from one place.
            </p>
            <p>
              Our goal is not only to sell tile. It is to help customers choose finishes that make everyday spaces feel more finished, more personal, and easier to maintain.
            </p>
          </div>
        </div>
      </section>

      <section className="about-awards-section">
        <div className="container about-awards-inner">
          <div className="about-awards-copy">
            <Award size={24} />
            <div>
              <h2>Recognized for reliable service and modern tile sourcing.</h2>
              <p>These sample recognitions reflect the standards we aim for: quality products, clear service, and dependable order support.</p>
            </div>
          </div>
          <div className="about-awards-list">
            {AWARDS.map((award) => (
              <article className="about-award-card" key={award.title}>
                <span>{award.year}</span>
                <strong>{award.title}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-promise-section">
        <div className="container">
          <div className="about-section-header center">
            <span className="about-section-kicker">Our Promise</span>
            <h2>Service beyond the sale.</h2>
            <p>We combine curated products, practical support, and straightforward ordering so customers can move from inspiration to installation with confidence.</p>
          </div>

          <div className="about-team-panel">
            <div className="about-team-image">
              <img src="/group-pic.png" alt="TileMatch service team reviewing project samples" />
            </div>
            <div className="about-team-copy">
              <Building2 size={28} />
              <h3>A local team with a showroom mindset.</h3>
              <p>Every product page, checkout flow, and support message is designed to feel like a helpful showroom visit, even when customers are shopping from home.</p>
            </div>
          </div>

          <div className="about-promise-grid">
            {PROMISES.map((promise) => (
              <article className="about-promise-card" key={promise.title}>
                <span>{promise.icon}</span>
                <h3>{promise.title}</h3>
                <p>{promise.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reach-section">
        <div className="container about-reach-grid">
          <div className="about-location-card">
            <iframe
              title="TileMatch Legazpi and Daraga service area"
              src="https://www.google.com/maps?q=Legazpi%20City%20Daraga%20Albay&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="about-location-summary">
              <strong>Legazpi and Daraga Service Area</strong>
              <span>Serving Albay customers around Legazpi City and Daraga</span>
            </div>
          </div>
          <div className="about-reach-copy">
            <span className="about-section-kicker">Our Reach</span>
            <h2>Designed for local service, ready for wider delivery.</h2>
            <p>TileMatch supports customers in the Legazpi City and Daraga area through careful packing, coordinated delivery, and transparent order tracking.</p>
            <div className="about-service-areas" aria-label="Service areas">
              <span>Legazpi City</span>
              <span>Daraga</span>
              <span>Albay</span>
            </div>
            <div className="about-metrics-grid">
              {METRICS.map((metric) => (
                <div className="about-metric" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="container about-cta-inner">
          <div>
            <span className="about-section-kicker">Ready When You Are</span>
            <h2>Find tiles for your next room, renovation, or project.</h2>
          </div>
          <div className="about-cta-actions">
            <Link className="btn btn-primary btn-lg" to="/shop"><Sparkles size={18} /> Shop Collection</Link>
            <Link className="btn btn-secondary btn-lg" to="/tracking"><Truck size={18} /> Track an Order</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
