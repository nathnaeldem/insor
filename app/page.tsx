'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  MapPin,
  QrCode,
  Sparkles,
  Shield,
  Smartphone,
  ArrowRight,
  Star,
  ChevronDown,
  Lock,
  Gem,
  Zap,
  Globe
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Intersection Observer Hook for scroll reveals
   ───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   Animated counter for stats
   ───────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView();

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  /* refs for sections */
  const feat = useInView();
  const how = useInView();
  const test = useInView();
  const price = useInView();

  return (
    <div className="landing-page" onMouseMove={handleMouse}>

      {/* ──── Ambient glow that follows cursor ──── */}
      <div
        className="cursor-glow"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* ========================================
          TOP NAV
          ======================================== */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`} id="landing-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <Heart size={20} fill="var(--rose-500)" color="var(--rose-500)" />
            <span className="text-gradient-rose" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>
              Insory
            </span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <Link href="/create" className="nav-cta" id="nav-cta-btn">
            Create Proposal <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="hero-section" id="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="hero-content">
          <div className="hero-badge fade-in-up">
            <Sparkles size={14} /> The #1 QR Proposal Experience
          </div>

          <h1 className="hero-title fade-in-up delay-1">
            Make Your <span className="text-gradient-rose">Proposal</span><br />
            Unforgettable
          </h1>

          <p className="hero-subtitle fade-in-up delay-2">
            Create a magical, location-locked experience. Your partner scans a QR code,
            follows a hint to your special place, and discovers a beautiful question
            waiting just for them.
          </p>

          <div className="hero-actions fade-in-up delay-3">
            <Link href="/create" className="hero-btn-primary" id="hero-cta-btn">
              <Gem size={18} /> Create Your Proposal
            </Link>
            <a href="#how-it-works" className="hero-btn-secondary" id="hero-learn-btn">
              See How It Works <ChevronDown size={16} />
            </a>
          </div>

          {/* Floating phone mockup */}
          <div className="hero-visual fade-in-up delay-4">
            <div className="phone-mockup">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>💍</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
                    Will you marry me?
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                    <div className="mock-btn-yes">Yes! 💕</div>
                    <div className="mock-btn-no">No</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          STATS BAR
          ======================================== */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={2847} suffix="+" /></div>
            <div className="stat-label">Proposals Created</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={94} suffix="%" /></div>
            <div className="stat-label">Said Yes!</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={48} /></div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES
          ======================================== */}
      <section className="section features-section" id="features" ref={feat.ref}>
        <div className={`section-inner ${feat.visible ? 'reveal' : ''}`}>
          <div className="section-header">
            <span className="section-tag"><Zap size={14} /> Why Insory</span>
            <h2 className="section-title">
              Everything You Need for the <span className="text-gradient-gold">Perfect Moment</span>
            </h2>
            <p className="section-subtitle">
              More than just a QR code — it&apos;s a complete proposal experience designed to create memories that last forever.
            </p>
          </div>

          <div className="features-grid">
            {[
              { icon: MapPin, title: 'Location Locked', desc: 'The question only reveals when your partner reaches your chosen spot. GPS magic meets romance.', color: '#f43f6c' },
              { icon: QrCode, title: 'Beautiful QR Cards', desc: 'Premium printable QR codes designed to be placed in a card, letter, or special spot.', color: '#a78bfa' },
              { icon: Smartphone, title: 'Works on Any Phone', desc: 'No app needed. Just scan and go — works on every smartphone browser instantly.', color: '#60a5fa' },
              { icon: Shield, title: 'Completely Private', desc: 'UUID-secured links, no personal data stored, location used only client-side.', color: '#34d399' },
              { icon: Sparkles, title: 'Magical Experience', desc: 'Floating hearts, GPS tracking, distance countdown — every detail crafted for "wow".', color: '#fbbf24' },
              { icon: Globe, title: 'Works Worldwide', desc: 'Use any location on Earth. Wherever your special place is, Insory works there.', color: '#f472b6' },
            ].map((f, i) => (
              <div className="feature-card" key={i} style={{ '--accent': f.color } as React.CSSProperties}>
                <div className="feature-icon-wrap">
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          HOW IT WORKS
          ======================================== */}
      <section className="section how-section" id="how-it-works" ref={how.ref}>
        <div className={`section-inner ${how.visible ? 'reveal' : ''}`}>
          <div className="section-header">
            <span className="section-tag"><Heart size={14} fill="currentColor" /> Simple as 1-2-3</span>
            <h2 className="section-title">
              How <span className="text-gradient-rose">Insory</span> Works
            </h2>
          </div>

          <div className="steps-timeline">
            {[
              { num: '01', title: 'Pick Your Place', desc: 'Paste a Google Maps link or coordinates of your special location — where you had your first date, a favorite park, or anywhere meaningful.', emoji: '📍' },
              { num: '02', title: 'Write Your Heart', desc: 'Add a romantic hint to guide them, choose the big question, and personalize the yes & no messages.', emoji: '💌' },
              { num: '03', title: 'Share the QR Code', desc: 'Print the beautiful QR card and give it to your partner. When they scan it and arrive at the location, the magic begins.', emoji: '✨' },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{s.num}</div>
                <div className="step-emoji">{s.emoji}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/create" className="hero-btn-primary" id="how-cta-btn">
              Start Creating Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          TESTIMONIALS
          ======================================== */}
      <section className="section testimonials-section" id="testimonials" ref={test.ref}>
        <div className={`section-inner ${test.visible ? 'reveal' : ''}`}>
          <div className="section-header">
            <span className="section-tag"><Star size={14} fill="currentColor" /> Love Stories</span>
            <h2 className="section-title">
              They Said <span className="text-gradient-gold">Yes!</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {[
              { name: 'James & Sarah', text: "I placed the QR code inside a book she was reading. When she scanned it and we walked to our first date spot, she was in tears before she even saw the question. She said YES!", stars: 5, location: 'New York, USA' },
              { name: 'Alex & Maria', text: "The location tracking blew her mind. Watching her follow the hint, getting closer and closer, and then seeing the question pop up... it was pure magic. 10/10 would recommend.", stars: 5, location: 'Barcelona, Spain' },
              { name: 'David & Lin', text: "We're a tech-savvy couple so a QR code proposal was perfect for us. The whole experience felt so premium and special. She keeps the printed QR card in her journal.", stars: 5, location: 'Tokyo, Japan' },
            ].map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-stars">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.split(' ')[0][0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-location">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          PRICING
          ======================================== */}
      <section className="section pricing-section" id="pricing" ref={price.ref}>
        <div className={`section-inner ${price.visible ? 'reveal' : ''}`}>
          <div className="section-header">
            <span className="section-tag"><Lock size={14} /> Simple Pricing</span>
            <h2 className="section-title">
              One Price. <span className="text-gradient-rose">Unlimited Magic.</span>
            </h2>
          </div>

          <div className="pricing-card">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-amount">
              <span className="pricing-currency">$</span>
              <span className="pricing-value">28</span>
              <span className="pricing-period">one-time</span>
            </div>
            <p className="pricing-desc">Everything you need for the perfect proposal</p>
            <ul className="pricing-features">
              {[
                'Location-locked QR code experience',
                'Beautiful printable QR card',
                'GPS tracking & distance counter',
                'Custom question & messages',
                'Romantic hints & clues',
                'Works worldwide, any device',
                'Lifetime link — never expires',
              ].map((f, i) => (
                <li key={i}><Heart size={14} fill="var(--rose-500)" color="var(--rose-500)" /> {f}</li>
              ))}
            </ul>
            <Link href="/create" className="hero-btn-primary" id="pricing-cta-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Create Your Proposal <ArrowRight size={16} />
            </Link>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px', textAlign: 'center' }}>
              Create & preview for free — only pay when you&apos;re ready to go live
            </p>
          </div>
        </div>
      </section>

      {/* ========================================
          FINAL CTA
          ======================================== */}
      <section className="final-cta-section">
        <div className="final-cta-inner">
          <Gem size={40} className="text-rose-400" style={{ marginBottom: '16px' }} />
          <h2 className="section-title" style={{ marginBottom: '12px' }}>
            Ready to Create Something <span className="text-gradient-gold">Magical?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 32px', fontSize: '16px' }}>
            Join thousands of people who made their proposal unforgettable with Insory.
          </p>
          <Link href="/create" className="hero-btn-primary" id="final-cta-btn">
            <Heart size={18} fill="currentColor" /> Start Now — It&apos;s Free to Create
          </Link>
        </div>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="landing-footer" id="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Heart size={16} fill="var(--rose-500)" color="var(--rose-500)" />
            <span className="text-gradient-rose" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Insory</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            Made with <Heart size={10} fill="currentColor" style={{ verticalAlign: 'middle' }} /> for lovers everywhere
          </p>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/create">Create</Link>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '16px' }}>
            © {new Date().getFullYear()} Insory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
