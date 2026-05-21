import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotScene   from '../components/landing/ChatbotScene';
import KnowledgeScene from '../components/landing/KnowledgeScene';
import CostScene      from '../components/landing/CostScene';
import PricingScene   from '../components/landing/PricingScene';
import { useTheme }   from '../context/ThemeContext';
import '../styles/landing.css';

// ── Smooth scroll helper ──────────────────────────────────────────────────────
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

// ── Nav ───────────────────────────────────────────────────────────────────────
const THEME_META = {
  light:  { icon: '☀️', label: 'Light'  },
  dark:   { icon: '🌙', label: 'Dark'   },
  system: { icon: '💻', label: 'System' },
};

const Navbar: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const { mode, cycle } = useTheme();
  const meta = THEME_META[mode];

  useEffect(() => {
    const el = document.querySelector('.land-page');
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 40);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`land-nav ${scrolled ? 'land-nav--scrolled' : ''}`}>
      <div className="land-nav-inner">
        <span className="land-logo">
          Rent<span className="land-logo-accent">A</span>Bot
        </span>
        <div className="land-nav-links">
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
        </div>
        <div className="land-nav-actions">
          <button
            className="land-theme-toggle"
            onClick={cycle}
            aria-label={`Theme: ${meta.label}. Click to cycle.`}
            title={`Theme: ${meta.label}`}
          >
            <span className="theme-icon">{meta.icon}</span>
            {meta.label}
          </button>
          <button className="land-btn-ghost" onClick={onLogin}>Log In</button>
          <button className="land-btn-primary" onClick={() => scrollTo('pricing')}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <section className="land-hero" id="hero">
    <div className="land-hero-bg" aria-hidden="true">
      <div className="land-orb land-orb-1" />
      <div className="land-orb land-orb-2" />
      <div className="land-orb land-orb-3" />
    </div>

    <div className="land-container land-hero-split">
      {/* ── Left: copy ── */}
      <div className="land-hero-text">
        <div className="land-badge">🤖 AI-Powered Customer Support</div>
        <h1 className="land-hero-title">
          Rent a Smart Chatbot<br />
          <span className="land-gradient-text">for Your Business</span>
        </h1>
        <p className="land-hero-sub">
          Deploy a fully trained AI chatbot on your website in minutes.
          No ML expertise needed — just upload your docs, set your tone, and go live.
        </p>
        <div className="land-hero-cta">
          <button className="land-btn-primary land-btn-lg" onClick={() => scrollTo('pricing')}>
            Get Started Free
          </button>
          <button className="land-btn-outline land-btn-lg" onClick={onLogin}>
            Sign In to Dashboard →
          </button>
        </div>
        <div className="land-hero-stats">
          <div className="land-stat"><span>500+</span><p>Companies</p></div>
          <div className="land-stat-divider" />
          <div className="land-stat"><span>2M+</span><p>Chats Handled</p></div>
          <div className="land-stat-divider" />
          <div className="land-stat"><span>99.9%</span><p>Uptime</p></div>
        </div>
      </div>

      {/* ── Right: Three.js scene ── */}
      <div className="land-hero-canvas" aria-hidden="true">
        <ChatbotScene />
      </div>
    </div>
  </section>
);

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: '📄',
    title: 'RAG Knowledge Base',
    desc: 'Upload PDFs, DOCX, or plain text. Your bot answers from your own documents instantly.',
  },
  {
    icon: '🎛️',
    title: 'Tunable AI Parameters',
    desc: 'Adjust temperature, Top-K, and Top-P sliders to control creativity vs. precision.',
  },
  {
    icon: '🔑',
    title: 'API Key Integration',
    desc: 'Embed the chatbot in any website or app with a single API key and 5 lines of code.',
  },
  {
    icon: '🌐',
    title: 'Multi-Platform SDKs',
    desc: 'Ready-made code snippets for JavaScript, Python, Java, .NET, PHP, and cURL.',
  },
  {
    icon: '💬',
    title: 'Multi-Turn Conversations',
    desc: 'Context-aware sessions remember the full conversation thread for natural dialogue.',
  },
  {
    icon: '📊',
    title: 'Usage Analytics',
    desc: 'Track API key usage, last-used timestamps, and conversation volumes per company.',
  },
];

const Features: React.FC = () => (
  <section className="land-section land-features" id="features">
    <div className="land-container">
      <div className="land-section-header">
        <div className="land-badge land-badge-purple">Everything You Need</div>
        <h2>Built for teams that move fast</h2>
        <p>From upload to live chatbot in under 10 minutes.</p>
      </div>

      {/* 3D scene above the feature cards */}
      <div className="land-scene-banner" aria-hidden="true">
        <KnowledgeScene />
      </div>

      <div className="land-features-grid">
        {features.map(f => (
          <div className="land-feature-card" key={f.title}>
            <div className="land-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Cost Effective ────────────────────────────────────────────────────────────
const CostEffective: React.FC = () => (
  <section className="land-section land-cost" id="cost">
    <div className="land-container land-cost-inner">
      <div className="land-cost-text">
        <div className="land-badge land-badge-green">Cost Effective</div>
        <h2>Stop paying per-message.<br />Pay for what you use.</h2>
        <ul className="land-cost-list">
          <li>✅ No per-query fees — flat monthly subscription</li>
          <li>✅ Runs on your own Ollama instance — zero vendor lock-in</li>
          <li>✅ One chatbot per company — no seat-based pricing</li>
          <li>✅ Unlimited RAG documents and FAQ entries</li>
          <li>✅ Cancel anytime — no long-term contracts</li>
        </ul>
        <button
          className="land-btn-primary land-btn-lg"
          onClick={() => scrollTo('pricing')}
        >
          See Pricing →
        </button>
      </div>

      {/* 3D cost comparison scene replaces the bar chart */}
      <div className="land-cost-scene" aria-hidden="true">
        <CostScene />
      </div>
    </div>
  </section>
);

// ── Pricing ───────────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'Perfect for small businesses getting started with AI support.',
    features: [
      '1 Chatbot',
      'Up to 10 RAG documents',
      '5,000 messages / month',
      '1 API key',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$149',
    period: '/month',
    desc: 'For growing teams that need more capacity and customisation.',
    features: [
      '1 Chatbot',
      'Unlimited RAG documents',
      '50,000 messages / month',
      '5 API keys',
      'Custom system prompt',
      'Priority support',
    ],
    cta: 'Get Started',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Dedicated infrastructure, SLA guarantees, and white-glove onboarding.',
    features: [
      'Unlimited chatbots',
      'Unlimited everything',
      'Dedicated Ollama instance',
      'Unlimited API keys',
      'SSO / SAML',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const Pricing: React.FC<{ onContactSales: () => void }> = ({ onContactSales }) => (
  <section className="land-section land-pricing" id="pricing">
    <div className="land-container">
      <div className="land-section-header">
        <div className="land-badge land-badge-blue">Pricing</div>
        <h2>Simple, transparent pricing</h2>
        <p>No hidden fees. No per-message charges. Just flat monthly plans.</p>
      </div>

      {/* 3D tier scene above pricing cards */}
      <div className="land-scene-banner land-scene-banner--dark" aria-hidden="true">
        <PricingScene />
      </div>

      <div className="land-pricing-grid">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`land-plan-card ${plan.highlight ? 'land-plan-card--highlight' : ''}`}
          >
            {plan.badge && <div className="land-plan-badge">{plan.badge}</div>}
            <div className="land-plan-name">{plan.name}</div>
            <div className="land-plan-price">
              {plan.price}
              {plan.period && <span className="land-plan-period">{plan.period}</span>}
            </div>
            <p className="land-plan-desc">{plan.desc}</p>
            <ul className="land-plan-features">
              {plan.features.map(f => (
                <li key={f}><span className="land-check">✓</span> {f}</li>
              ))}
            </ul>
            <button
              className={plan.highlight ? 'land-btn-primary land-btn-full' : 'land-btn-outline land-btn-full'}
              onClick={plan.name === 'Enterprise' ? onContactSales : () => scrollTo('contact')}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Contact Sales ─────────────────────────────────────────────────────────────
const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would POST to a contact endpoint
    setSent(true);
  };

  return (
    <section className="land-section land-contact" id="contact">
      <div className="land-container land-contact-inner">
        <div className="land-contact-text">
          <div className="land-badge land-badge-orange">Contact Sales</div>
          <h2>Let's find the right plan for you</h2>
          <p>
            Our team will walk you through a personalised demo, answer your
            technical questions, and help you get live in days — not months.
          </p>
          <div className="land-contact-perks">
            <div className="land-perk">📞 <span>Response within 24 hours</span></div>
            <div className="land-perk">🎯 <span>Personalised onboarding</span></div>
            <div className="land-perk">🔒 <span>NDA available on request</span></div>
          </div>
        </div>

        <div className="land-contact-form-wrap">
          {sent ? (
            <div className="land-contact-success">
              <div className="land-success-icon">✅</div>
              <h3>Message received!</h3>
              <p>We'll be in touch within one business day.</p>
            </div>
          ) : (
            <form className="land-contact-form" onSubmit={handleSubmit}>
              <div className="land-form-row">
                <div className="land-form-group">
                  <label htmlFor="c-name">Full Name</label>
                  <input
                    id="c-name" name="name" type="text"
                    placeholder="Jane Smith" required
                    value={form.name} onChange={handleChange}
                  />
                </div>
                <div className="land-form-group">
                  <label htmlFor="c-email">Work Email</label>
                  <input
                    id="c-email" name="email" type="email"
                    placeholder="jane@company.com" required
                    value={form.email} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="land-form-group">
                <label htmlFor="c-company">Company Name</label>
                <input
                  id="c-company" name="company" type="text"
                  placeholder="Acme Corp" required
                  value={form.company} onChange={handleChange}
                />
              </div>
              <div className="land-form-group">
                <label htmlFor="c-message">How can we help?</label>
                <textarea
                  id="c-message" name="message" rows={4}
                  placeholder="Tell us about your use case…"
                  value={form.message} onChange={handleChange}
                />
              </div>
              <button type="submit" className="land-btn-primary land-btn-full land-btn-lg">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Login Modal ───────────────────────────────────────────────────────────────
// Navigates to the existing /login page — keeps auth logic in one place
const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();

  const goToLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="land-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="land-modal" onClick={e => e.stopPropagation()}>
        <button className="land-modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="land-modal-logo">
          Rent<span className="land-logo-accent">A</span>Bot
        </div>
        <h2>Welcome back</h2>
        <p className="land-modal-sub">Sign in to your dashboard</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button className="land-btn-primary land-btn-full land-btn-lg" onClick={goToLogin}>
            Go to Login →
          </button>
          <p className="land-modal-footer">
            Need access?{' '}
            <button className="land-link-btn" onClick={() => { onClose(); scrollTo('contact'); }}>
              Contact Sales
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => (
  <footer className="land-footer">
    <div className="land-container land-footer-inner">
      <div className="land-footer-brand">
        <span className="land-logo">Rent<span className="land-logo-accent">A</span>Bot</span>
        <p>AI chatbots, rented — not built.</p>
      </div>
      <div className="land-footer-links">
        <div>
          <h4>Product</h4>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={() => scrollTo('cost')}>Why RentABot</button>
        </div>
        <div>
          <h4>Company</h4>
          <button onClick={() => scrollTo('contact')}>Contact Sales</button>
          <button onClick={() => scrollTo('contact')}>Support</button>
        </div>
      </div>
    </div>
    <div className="land-footer-bottom">
      <p>© {new Date().getFullYear()} RentABot. All rights reserved.</p>
    </div>
  </footer>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => navigate('/login');

  return (
    <div className="land-page">
      <Navbar onLogin={handleLogin} />

      <main className="land-main">
        <Hero onLogin={handleLogin} />
        <Features />
        <CostEffective />
        <Pricing onContactSales={() => scrollTo('contact')} />
        <Contact />
      </main>

      <Footer />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LandingPage;
