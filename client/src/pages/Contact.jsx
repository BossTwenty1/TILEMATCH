import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck, Truck } from 'lucide-react';
import { contactAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Contact.css';

const BRANCH = {
  name: 'TileMatch Naga Design Studio',
  address: 'Unit 204, Magsaysay Avenue, Barangay Balatas, Naga City, Camarines Sur 4400',
  phone: '0917-845-3628',
  secondaryPhone: '(054) 472-1186',
  email: 'support@tilematch.com',
  hours: 'Mon-Sat, 9:00 AM - 7:00 PM',
  map: 'https://www.google.com/maps?q=Magsaysay%20Avenue%20Naga%20City%20Camarines%20Sur&output=embed'
};

const SERVICES = [
  { icon: <Truck size={20} />, title: 'Delivery Coordination', text: 'Ask about schedules, provincial delivery, and order preparation.' },
  { icon: <ShieldCheck size={20} />, title: 'Product Guidance', text: 'Get help choosing finishes, sizes, and tile quantities for your space.' },
  { icon: <MessageSquare size={20} />, title: 'Project Support', text: 'Send plans, concerns, or supplier requests and we will route them properly.' }
];

export default function Contact() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const initialForm = useMemo(() => ({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: ''
  }), [user]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required';
    if (!form.message.trim()) nextErrors.message = 'Message is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data } = await contactAPI.send(form);
      addToast(data.message || 'Message sent successfully.');
      setForm({ ...initialForm, subject: '', message: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Unable to send message right now.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <video autoPlay muted loop playsInline className="contact-hero-video">
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="contact-hero-overlay" />
        <div className="container contact-hero-content">
          <span className="contact-eyebrow">TileMatch Support</span>
          <h1>Visit our studio or send us your project details.</h1>
          <p>Our team can help with product questions, delivery coordination, tile estimates, and order concerns.</p>
          <div className="contact-hero-actions">
            <a className="btn btn-primary btn-lg" href={`tel:${BRANCH.phone.replace(/[^0-9]/g, '')}`}>
              <Phone size={18} /> Call Now
            </a>
            <a className="btn btn-secondary btn-lg" href={`mailto:${BRANCH.email}`}>
              <Mail size={18} /> Email Us
            </a>
          </div>
        </div>
      </section>

      <section className="contact-overview">
        <div className="container contact-overview-grid">
          <article className="contact-info-panel">
            <span className="section-kicker">Get in touch</span>
            <h2>Know our location and reach the right team today.</h2>
            <p>
              Share what room you are working on, your preferred tile style, and any deadline details.
              We will reply with practical next steps.
            </p>

            <div className="contact-detail-list">
              <div className="contact-detail">
                <span className="contact-detail-icon"><MapPin size={22} /></span>
                <div>
                  <strong>{BRANCH.name}</strong>
                  <p>{BRANCH.address}</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon"><Phone size={22} /></span>
                <div>
                  <strong>{BRANCH.phone}</strong>
                  <p>{BRANCH.secondaryPhone}</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon"><Clock size={22} /></span>
                <div>
                  <strong>{BRANCH.hours}</strong>
                  <p>Closed on Sundays and selected holidays</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon"><Mail size={22} /></span>
                <div>
                  <strong>{BRANCH.email}</strong>
                  <p>Typical response within one business day</p>
                </div>
              </div>
            </div>
          </article>

          <form className="contact-form card card-body" onSubmit={handleSubmit} noValidate>
            <div className="contact-form-heading">
              <span className="contact-form-icon"><MessageSquare size={22} /></span>
              <div>
                <h2>Send a Message</h2>
                <p>Tell us how we can help with your tile project.</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="input-group">
                <label htmlFor="contact-name">Name *</label>
                <input
                  id="contact-name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  autoComplete="name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="contact-phone">Phone</label>
                <input
                  id="contact-phone"
                  className="input"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contact-email">Email *</label>
              <input
                id="contact-email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="contact-subject">Subject *</label>
              <input
                id="contact-subject"
                className={`input ${errors.subject ? 'input-error' : ''}`}
                value={form.subject}
                onChange={(event) => updateField('subject', event.target.value)}
                placeholder="Delivery inquiry, tile estimate, order concern..."
              />
              {errors.subject && <span className="error-text">{errors.subject}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                className={`input contact-message-input ${errors.message ? 'input-error' : ''}`}
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                rows="7"
                placeholder="Tell us the room size, preferred tile type, location, or order number."
              />
              {errors.message && <span className="error-text">{errors.message}</span>}
            </div>

            <button className="btn btn-accent btn-lg contact-submit" type="submit" disabled={submitting}>
              <Send size={18} /> {submitting ? 'Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="container contact-map-grid">
          <div className="contact-map-copy">
            <span className="section-kicker">Find us</span>
            <h2>Drop by the TileMatch showroom in Naga City.</h2>
            <p>Use the map for directions, then message us ahead if you need stock checked before your visit.</p>
            <Link className="btn btn-secondary" to="/shop">Browse Tiles Before Visiting</Link>
          </div>
          <div className="contact-map-frame">
            <iframe
              title="TileMatch Naga City location map"
              src={BRANCH.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="contact-service-strip">
        <div className="container contact-service-grid">
          {SERVICES.map((service) => (
            <article className="contact-service-card" key={service.title}>
              <span>{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
