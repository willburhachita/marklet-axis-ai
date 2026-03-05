import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Menu, X, Target, PenTool, Rocket,
    Code2, Shield, Zap, Github, ChevronDown,
} from 'lucide-react';
import { useSession } from '../lib/auth-client.ts';

/* ═══════════════════════════════════════════ */
/* LANDING HEADER                              */
/* ═══════════════════════════════════════════ */
function LandingHeader() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <header className="landing-header">
            <div className="landing-container">
                <div className="landing-header-inner">
                    {/* Logo */}
                    <a href="/" className="landing-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                        <img src="/marketaxis-logo.png" alt="MarketAxis AI" className="landing-logo-img" />
                        <span>MarketAxis</span>
                    </a>

                    {/* Desktop Nav */}
                    <nav className="landing-nav">
                        <a href="#features" className="landing-nav-link">Features</a>
                        <a href="#showcase" className="landing-nav-link">Product</a>
                        <a href="#pricing" className="landing-nav-link">Pricing</a>
                    </nav>

                    {/* CTA */}
                    <div className="landing-header-cta">
                        {session ? (
                            <button className="landing-btn-pill" onClick={() => navigate('/overview')}>
                                Continue to Dashboard
                            </button>
                        ) : (
                            <>
                                <button className="landing-btn-ghost" onClick={() => navigate('/auth')}>
                                    Sign in
                                </button>
                                <button className="landing-btn-pill" onClick={() => navigate('/auth')}>
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="landing-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="landing-mobile-menu">
                    <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
                    <a href="#showcase" onClick={() => setMobileOpen(false)}>Product</a>
                    <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
                    {session ? (
                        <button className="landing-btn-pill" style={{ width: '100%', marginTop: 8 }} onClick={() => { setMobileOpen(false); navigate('/overview'); }}>
                            Continue to Dashboard
                        </button>
                    ) : (
                        <button className="landing-btn-pill" style={{ width: '100%', marginTop: 8 }} onClick={() => { setMobileOpen(false); navigate('/auth'); }}>
                            Get Started
                        </button>
                    )}
                </div>
            )}
        </header>
    );
}

/* ═══════════════════════════════════════════ */
/* HERO                                        */
/* ═══════════════════════════════════════════ */
function LandingHero() {
    const navigate = useNavigate();
    const { data: session } = useSession();

    return (
        <section className="landing-hero">
            <div className="landing-container" style={{ textAlign: 'center' }}>
                <h1 className="landing-hero-title">
                    Your AI<br />marketing team
                </h1>
                <p className="landing-hero-sub">
                    AI agents that understand your codebase, create your strategy,
                    generate content, and grow your user base — while you keep building.
                </p>
                <div className="landing-hero-ctas">
                    {session ? (
                        <button className="landing-btn-pill landing-btn-lg" onClick={() => navigate('/overview')}>
                            Continue to Dashboard <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button className="landing-btn-pill landing-btn-lg" onClick={() => navigate('/auth')}>
                            Get Started Free <ArrowRight size={16} />
                        </button>
                    )}
                    <a href="#showcase" className="landing-btn-ghost-outline">
                        See how it works
                    </a>
                </div>
                <p className="landing-hero-note">No credit card required · Free to start</p>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* INTEGRATION LOGOS                           */
/* ═══════════════════════════════════════════ */
function IntegrationLogos() {
    const logos = [
        { name: 'Convex' },
        { name: 'GitHub' },
        { name: 'Composio' },
        { name: 'Google AI' },
        { name: 'DigitalOcean' },
        { name: 'X / Twitter' },
        { name: 'LinkedIn' },
    ];

    return (
        <section className="landing-logos">
            <div className="landing-container">
                <p className="landing-logos-label">Powered by modern tools</p>
                <div className="landing-logos-grid">
                    {logos.map((l) => (
                        <div key={l.name} className="landing-logos-item">
                            {l.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* PRODUCT SHOWCASE (2 cards)                  */
/* ═══════════════════════════════════════════ */
function ProductShowcase() {
    const navigate = useNavigate();

    return (
        <section id="showcase" className="landing-showcase">
            <div className="landing-container">
                <div className="landing-showcase-grid">
                    {/* Card 1 */}
                    <div className="landing-product-card" onClick={() => navigate('/auth')}>
                        <div className="landing-product-card-overlay">
                            <div>
                                <p className="landing-product-card-name">MarketAxis AI</p>
                                <p className="landing-product-card-desc">Your autonomous marketing dashboard</p>
                            </div>
                            <span className="landing-btn-pill-sm">Explore</span>
                        </div>
                        <img src="/dashboard-screenshot.png" alt="MarketAxis AI Dashboard" className="landing-product-card-img" />
                    </div>

                    {/* Card 2 */}
                    <div className="landing-product-card" onClick={() => navigate('/auth')}>
                        <div className="landing-product-card-overlay">
                            <div>
                                <p className="landing-product-card-name">Content Studio</p>
                                <p className="landing-product-card-desc">AI-generated content for every platform</p>
                            </div>
                            <span className="landing-btn-pill-sm">Explore</span>
                        </div>
                        <img src="/content-studio-screenshot.png" alt="Content Studio" className="landing-product-card-img" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* FEATURES GRID                               */
/* ═══════════════════════════════════════════ */
function FeaturesGrid() {
    const features = [
        { icon: Target, color: 'var(--info)', name: 'Strategy Agent', desc: 'Positioning, brand voice, 30-day content calendar, and launch roadmap — generated from your codebase.' },
        { icon: PenTool, color: 'var(--primary)', name: 'Content Agent', desc: 'Twitter threads, LinkedIn posts, Reddit posts, App Store descriptions — all platform-native, all on-brand.' },
        { icon: Rocket, color: 'var(--warning)', name: 'Launch Agent', desc: 'Product Hunt listing, Hacker News post, press email, BetaList submission — the complete launch package.' },
        { icon: Code2, color: 'var(--success)', name: 'Codebase Agent', desc: 'Reads your GitHub repo to extract features, tech stack, and APIs. Deep product context for every agent.' },
        { icon: Shield, color: 'var(--error)', name: 'Legal Agent', desc: 'Detects legal requirements from your code, then generates Privacy Policy, ToS, GDPR notices, and more.' },
        { icon: Zap, color: 'var(--primary)', name: 'Assist or Autopilot', desc: 'Assist mode: you review everything. Autopilot: agents act autonomously. Switch any time.' },
    ];

    return (
        <section id="features" className="landing-features">
            <div className="landing-container">
                <h2 className="landing-section-title">Everything your marketing team would do</h2>
                <div className="landing-features-grid">
                    {features.map((f) => {
                        const IconComp = f.icon;
                        return (
                            <div key={f.name} className="landing-feature-card">
                                <div className="landing-feature-icon" style={{ color: f.color }}>
                                    <IconComp size={22} />
                                </div>
                                <h3 className="landing-feature-name">{f.name}</h3>
                                <p className="landing-feature-desc">{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* TESTIMONIAL                                 */
/* ═══════════════════════════════════════════ */
function Testimonial() {
    return (
        <section className="landing-testimonial">
            <div className="landing-container">
                <div className="landing-testimonial-inner">
                    <div className="landing-testimonial-stars">★★★★★</div>
                    <blockquote className="landing-testimonial-quote">
                        "I shipped 4 apps that went nowhere. MarketAxis gave me a full strategy in 3 minutes. My last launch hit #3 on Product Hunt."
                    </blockquote>
                    <div className="landing-testimonial-author">
                        <p className="landing-testimonial-name">Jake T.</p>
                        <p className="landing-testimonial-role">Indie Developer</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* PRICING                                     */
/* ═══════════════════════════════════════════ */
function Pricing() {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Indie', price: '$19', period: '/mo',
            desc: 'For side project builders',
            features: ['1 app profile', 'Unlimited strategy', '30 content pieces/mo', '1 social account', 'Launch kit', 'Assist mode'],
            cta: 'Start building',
            popular: false,
        },
        {
            name: 'Startup', price: '$49', period: '/mo',
            desc: 'For growth-focused founders',
            features: ['3 app profiles', 'Unlimited content', '5 social accounts', 'Full launch kit', 'Assist + Autopilot', 'Priority support'],
            cta: 'Start growing',
            popular: true,
        },
        {
            name: 'Pro', price: '$149', period: '/mo',
            desc: 'For teams and agencies',
            features: ['Unlimited profiles', 'Everything in Startup', 'Advanced analytics', 'Outreach automation', 'Custom brand training', 'Dedicated support'],
            cta: 'Scale up',
            popular: false,
        },
    ];

    return (
        <section id="pricing" className="landing-pricing">
            <div className="landing-container">
                <h2 className="landing-section-title">Marketing shouldn't cost more than your servers</h2>
                <p className="landing-section-sub">All plans include a 14-day free trial. No credit card required.</p>
                <div className="landing-pricing-grid">
                    {plans.map((p) => (
                        <div key={p.name} className={`landing-pricing-card${p.popular ? ' popular' : ''}`}>
                            {p.popular && <div className="landing-pricing-badge">Most Popular</div>}
                            <h3 className="landing-pricing-name">{p.name}</h3>
                            <p className="landing-pricing-desc">{p.desc}</p>
                            <div className="landing-pricing-price">
                                <span className="landing-pricing-amount">{p.price}</span>
                                <span className="landing-pricing-period">{p.period}</span>
                            </div>
                            <ul className="landing-pricing-features">
                                {p.features.map((f) => (
                                    <li key={f}>✓ {f}</li>
                                ))}
                            </ul>
                            <button className={`landing-btn-pill${p.popular ? '' : ' secondary'}`} style={{ width: '100%' }} onClick={() => navigate('/auth')}>
                                {p.cta} <ArrowRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* CTA SECTION                                 */
/* ═══════════════════════════════════════════ */
function CtaSection() {
    const navigate = useNavigate();
    const { data: session } = useSession();

    return (
        <section className="landing-cta-section">
            <div className="landing-container">
                <div className="landing-cta-card">
                    <h2 className="landing-cta-title">Ready to launch?</h2>
                    <p className="landing-cta-sub">Your app deserves to be found. MarketAxis AI handles everything after you ship.</p>
                    {session ? (
                        <button className="landing-btn-pill landing-btn-lg" onClick={() => navigate('/overview')}>
                            Continue to Dashboard <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button className="landing-btn-pill landing-btn-lg" onClick={() => navigate('/auth')}>
                            Get Started Free <ArrowRight size={16} />
                        </button>
                    )}
                    <p className="landing-hero-note" style={{ marginTop: 16 }}>Setup takes 2 minutes</p>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════ */
/* FOOTER                                      */
/* ═══════════════════════════════════════════ */
function LandingFooter() {
    const columns = [
        {
            title: 'Product',
            links: [
                { label: 'Overview', href: '#' },
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Changelog', href: '#' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'Documentation', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Support', href: '#' },
                { label: 'Status', href: '#' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Contact', href: '#' },
            ],
        },
    ];

    return (
        <footer className="landing-footer">
            <div className="landing-container">
                <div className="landing-footer-top">
                    <div className="landing-footer-brand">
                        <a href="/" className="landing-logo">
                            <img src="/marketaxis-logo.png" alt="MarketAxis AI" className="landing-logo-img" />
                            <span>MarketAxis</span>
                        </a>
                        <p className="landing-footer-tagline">Your autonomous AI marketing team.</p>
                    </div>
                    <div className="landing-footer-columns">
                        {columns.map((col) => (
                            <div key={col.title} className="landing-footer-col">
                                <p className="landing-footer-col-title">{col.title}</p>
                                <ul>
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <a href={link.href} className="landing-footer-link">{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="landing-footer-bottom">
                    <p>© 2026 MarketAxis AI. Built for builders who ship.</p>
                    <div className="landing-footer-social">
                        <a href="https://twitter.com" target="_blank" rel="noreferrer">X / Twitter</a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════ */
/* ANNOUNCEMENT BANNER                         */
/* ═══════════════════════════════════════════ */
function AnnouncementBanner() {
    const navigate = useNavigate();

    return (
        <div className="landing-announcement">
            <button className="landing-announcement-pill" onClick={() => navigate('/auth')}>
                MarketAxis AI is now in beta.
                <span className="landing-announcement-cta">
                    Get early access <ArrowRight size={14} />
                </span>
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════ */
/* MAIN EXPORT                                 */
/* ═══════════════════════════════════════════ */
export default function Landing() {
    return (
        <div className="landing-page">
            <LandingHeader />
            <main style={{ paddingTop: 52 }}>
                <LandingHero />
                <IntegrationLogos />
                <ProductShowcase />
                <FeaturesGrid />
                <Testimonial />
                <Pricing />
                <CtaSection />
            </main>
            <LandingFooter />
            <AnnouncementBanner />
        </div>
    );
}
